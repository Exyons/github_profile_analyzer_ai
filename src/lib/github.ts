import { Octokit } from "@octokit/rest";
import {
    GitHubUser,
    GitHubRepo,
    LanguageStats,
    CommitInfo,
    RepoReadme,
    PullRequestInfo,
    PRStats,
    GitHubProfileData,
    UserNotFoundError,
    RateLimitError,
    GitHubApiError,
} from "./types";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || undefined,
});

// ─── Rate Limit Checker ─────────────────────────────────────────────────────

function checkRateLimit(headers: Record<string, string | undefined>) {
    const remaining = parseInt(headers["x-ratelimit-remaining"] || "1", 10);
    const resetTimestamp = parseInt(headers["x-ratelimit-reset"] || "0", 10);
    if (remaining <= 0) {
        throw new RateLimitError(resetTimestamp);
    }
}

// ─── Fetch User Profile ─────────────────────────────────────────────────────

export async function fetchGitHubProfile(username: string): Promise<GitHubUser> {
    try {
        const response = await octokit.users.getByUsername({ username });
        checkRateLimit(response.headers as Record<string, string>);
        return response.data as GitHubUser;
    } catch (error: unknown) {
        if (error instanceof RateLimitError) throw error;
        const err = error as { status?: number; response?: { headers: Record<string, string> } };
        if (err.status === 404) throw new UserNotFoundError(username);
        if (err.status === 403 && err.response) checkRateLimit(err.response.headers);
        throw new GitHubApiError(`Failed to fetch user "${username}"`, err.status || 500);
    }
}

// ─── Fetch All User Repos (single call, split into original + forked) ───────

async function fetchAllUserRepos(username: string): Promise<{ original: GitHubRepo[]; forked: GitHubRepo[] }> {
    try {
        const response = await octokit.repos.listForUser({
            username,
            sort: "updated",
            per_page: 100,
            type: "owner",
        });
        checkRateLimit(response.headers as Record<string, string>);
        const all = response.data as unknown as GitHubRepo[];

        // Sort originals by stars + recency (pushed_at within last 6 months gets a boost)
        const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;
        const original = all
            .filter((r) => !r.fork)
            .sort((a, b) => {
                const aRecent = new Date(a.pushed_at || 0).getTime() > sixMonthsAgo ? 50 : 0;
                const bRecent = new Date(b.pushed_at || 0).getTime() > sixMonthsAgo ? 50 : 0;
                return (b.stargazers_count + bRecent) - (a.stargazers_count + aRecent);
            });

        const forked = all
            .filter((r) => r.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count);

        return { original, forked };
    } catch (error: unknown) {
        if (error instanceof RateLimitError) throw error;
        if (error instanceof UserNotFoundError) throw error;
        const err = error as { status?: number; response?: { headers: Record<string, string> } };
        if (err.status === 404) throw new UserNotFoundError(username);
        if (err.status === 403 && err.response) checkRateLimit(err.response.headers);
        throw new GitHubApiError(`Failed to fetch repos for "${username}"`, err.status || 500);
    }
}

// ─── Fetch Repo README ──────────────────────────────────────────────────────

export async function fetchRepoReadme(owner: string, repo: string): Promise<string> {
    try {
        const response = await octokit.repos.getReadme({ owner, repo });
        checkRateLimit(response.headers as Record<string, string>);
        const data = response.data as unknown as { content: string; encoding: string };
        if (data.encoding === "base64") {
            return Buffer.from(data.content, "base64").toString("utf-8");
        }
        return data.content;
    } catch {
        return "";
    }
}

// ─── Fetch Recent Commits (parallel per repo) ──────────────────────────────

export async function fetchRecentCommits(
    username: string,
    repos: GitHubRepo[],
    limit = 10
): Promise<CommitInfo[]> {
    const reposToCheck = repos.slice(0, 5);

    const perRepoCommits = await Promise.all(
        reposToCheck.map(async (repo) => {
            try {
                const response = await octokit.repos.listCommits({
                    owner: username,
                    repo: repo.name,
                    per_page: 3,
                    author: username,
                });
                checkRateLimit(response.headers as Record<string, string>);

                return response.data.map((commit) => ({
                    repoName: repo.name,
                    message: commit.commit.message.split("\n")[0],
                    date: commit.commit.author?.date || "",
                    sha: commit.sha.slice(0, 7),
                }));
            } catch {
                return [];
            }
        })
    );

    return perRepoCommits
        .flat()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
}

// ─── Fetch Repo Languages ───────────────────────────────────────────────────

export async function fetchRepoLanguages(
    owner: string,
    repo: string
): Promise<LanguageStats> {
    try {
        const response = await octokit.repos.listLanguages({ owner, repo });
        checkRateLimit(response.headers as Record<string, string>);
        return response.data as LanguageStats;
    } catch {
        return {};
    }
}

// ─── Fetch User Pull Requests ───────────────────────────────────────────────

export async function fetchUserPRs(username: string, limit = 10): Promise<PullRequestInfo[]> {
    try {
        const response = await octokit.search.issuesAndPullRequests({
            q: `author:${username} type:pr`,
            sort: "created",
            order: "desc",
            per_page: limit,
        });
        checkRateLimit(response.headers as Record<string, string>);

        const prs: PullRequestInfo[] = [];
        const repoStarCache = new Map<string, number>();

        // Batch fetch repo stars for unique repos
        const uniqueRepos = new Map<string, { owner: string; name: string }>();
        for (const item of response.data.items) {
            const repoUrl = (item as unknown as { repository_url: string }).repository_url || "";
            const parts = repoUrl.split("/");
            const repoOwner = parts[parts.length - 2] || "";
            const repoName = parts[parts.length - 1] || "";
            const repoFullName = `${repoOwner}/${repoName}`;
            if (!uniqueRepos.has(repoFullName)) {
                uniqueRepos.set(repoFullName, { owner: repoOwner, name: repoName });
            }
        }

        // Fetch all repo stars in parallel
        await Promise.all(
            Array.from(uniqueRepos.entries()).map(async ([fullName, { owner, name }]) => {
                try {
                    const repoData = await octokit.repos.get({ owner, repo: name });
                    repoStarCache.set(fullName, repoData.data.stargazers_count);
                } catch {
                    repoStarCache.set(fullName, 0);
                }
            })
        );

        for (const item of response.data.items) {
            const repoUrl = (item as unknown as { repository_url: string }).repository_url || "";
            const parts = repoUrl.split("/");
            const repoOwner = parts[parts.length - 2] || "";
            const repoName = parts[parts.length - 1] || "";
            const repoFullName = `${repoOwner}/${repoName}`;
            const repoStars = repoStarCache.get(repoFullName) ?? 0;
            const merged = item.pull_request?.merged_at != null;

            prs.push({
                title: item.title,
                repoFullName,
                repoOwner,
                repoName,
                state: item.state as "open" | "closed",
                merged,
                repoStars,
                url: item.html_url,
                createdAt: item.created_at,
                body: (item.body || "").slice(0, 500),
            });
        }

        return prs;
    } catch {
        return [];
    }
}

// ─── Calculate PR Stats ─────────────────────────────────────────────────────

export function calculatePRStats(prs: PullRequestInfo[], username: string): PRStats {
    const total = prs.length;
    const merged = prs.filter((pr) => pr.merged).length;
    const open = prs.filter((pr) => pr.state === "open").length;
    const closed = total - open;
    const thirdPartyMerged = prs.filter(
        (pr) => pr.merged && pr.repoOwner.toLowerCase() !== username.toLowerCase()
    ).length;
    const acceptanceRate = closed > 0 ? Math.round((merged / closed) * 100) : 0;

    return { total, merged, open, closed, acceptanceRate, thirdPartyMerged };
}

// ─── Text Truncation for Token Management ───────────────────────────────────

export function truncateText(text: string, maxChars = 3000): string {
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars) + "\n\n[... truncated for analysis ...]";
}

// ─── Aggregate All GitHub Data (fully concurrent) ───────────────────────────

export async function aggregateGitHubData(username: string): Promise<GitHubProfileData> {
    // Phase 1: Fetch profile, repos, and PRs concurrently
    const [user, { original, forked }, pullRequests] = await Promise.all([
        fetchGitHubProfile(username),
        fetchAllUserRepos(username),
        fetchUserPRs(username, 10),
    ]);

    const topRepos = original.slice(0, 5);
    const forkedRepos = forked.slice(0, 10);
    const prStats = calculatePRStats(pullRequests, username);

    // Phase 2: Once repos are known, fetch READMEs, commits, and languages concurrently
    const readmeRepos = topRepos.slice(0, 3);
    const langRepos = [...topRepos, ...forkedRepos].slice(0, 10);

    const [readmeResults, recentCommits, ...langResults] = await Promise.all([
        // READMEs for top 3 repos
        Promise.all(
            readmeRepos.map(async (repo) => {
                const content = await fetchRepoReadme(username, repo.name);
                return { repoName: repo.name, content: truncateText(content) } as RepoReadme;
            })
        ),
        // Commits in parallel
        fetchRecentCommits(username, topRepos, 10),
        // Languages for all repos
        ...langRepos.map((repo) => fetchRepoLanguages(username, repo.name)),
    ]);

    const readmes = readmeResults.filter((r) => r.content.length > 0);

    const mergedLanguages: LanguageStats = {};
    for (const langs of langResults) {
        for (const [lang, bytes] of Object.entries(langs as LanguageStats)) {
            mergedLanguages[lang] = (mergedLanguages[lang] || 0) + bytes;
        }
    }

    const totalStars = topRepos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = topRepos.reduce((sum, r) => sum + r.forks_count, 0);

    return {
        user,
        topRepos,
        forkedRepos,
        readmes,
        recentCommits,
        languageStats: mergedLanguages,
        totalStars,
        totalForks,
        pullRequests,
        prStats,
    };
}
