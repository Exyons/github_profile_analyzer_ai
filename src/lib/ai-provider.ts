import {
    GitHubProfileData,
    AIAnalysisResult,
    GrowthRoadmapAI,
} from "./types";
import { stripReadme, stripEmpty, reposToCompactList, prsToCompactList, commitsToCompactList } from "./compressor";

// ─── Environment Configuration ──────────────────────────────────────────────

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://localhost:8000/api/generate";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;

// ─── Shared Prompt Builder ──────────────────────────────────────────────────

function buildPrompt(data: GitHubProfileData): string {
    const sortedRepos = [...data.topRepos].sort((a, b) => a.name.localeCompare(b.name));
    const sortedCommits = [...data.recentCommits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sortedPRs = [...data.pullRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const sortedReadmes = [...data.readmes].sort((a, b) => a.repoName.localeCompare(b.repoName));

    const profile = stripEmpty({
        user: data.user.login,
        name: data.user.name,
        bio: data.user.bio,
        company: data.user.company,
        location: data.user.location,
        blog: data.user.blog,
        twitter: data.user.twitter_username,
        repos: data.user.public_repos,
        followers: data.user.followers,
        following: data.user.following,
        created: data.user.created_at,
    });

    const repoList = reposToCompactList(sortedRepos);

    const readmes = sortedReadmes
        .map((r) => `### ${r.repoName}\n${stripReadme(r.content)}`)
        .join("\n\n");

    const commits = commitsToCompactList(sortedCommits.slice(0, 10));

    const prList = prsToCompactList(sortedPRs.slice(0, 5).map((pr) => ({
        title: pr.title,
        repoFullName: pr.repoFullName,
        merged: pr.merged,
        repoStars: pr.repoStars,
    })));

    const prStats = stripEmpty({
        total: data.prStats.total,
        merged: data.prStats.merged,
        open: data.prStats.open,
        rate: data.prStats.acceptanceRate,
        extMerged: data.prStats.thirdPartyMerged,
    });

    const langs = Object.entries(data.languageStats)
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a)
        .map(([k, v]) => `${k}:${v}%`)
        .join(", ");

    return `GitHub profile audit. Analyze data. Return JSON. Score 0-100.

PROFILE: ${JSON.stringify(profile)}

REPOS (${sortedRepos.length}, ★${data.totalStars} total, ${data.totalForks} forks):
${repoList || "None"}

LANGUAGES: ${langs || "None"}

READMES:
${readmes || "None"}

RECENT COMMITS:
${commits || "None"}

PR ACTIVITY (${JSON.stringify(prStats)}):
${prList || "None"}

Respond with ONLY valid JSON. No markdown fences. Exact schema:
{"profileScore":<0-100>,"scoreBreakdown":{"professionalism":<0-100>,"documentation":<0-100>,"technicalBreadth":<0-100>,"communityEngagement":<0-100>,"codeQuality":<0-100>},"currentBio":"<bio>","suggestedBio":"<suggestion>","readmeCritiques":[{"repoName":"<name>","score":<0-100>,"strengths":["..."],"improvements":["..."]}],"suggestedSkills":["..."],"actionItems":[{"title":"<title>","description":"<action>","priority":"high|medium|low","category":"profile|repository|documentation|community"}],"languageConfidence":[{"language":"<name>","percentage":<0-100>,"confidence":"expert|proficient|familiar|beginner"}],"topImprovements":["<1>","<2>","<3>"],"summary":"<2-3 sentences>","contributionScore":<0-100>,"hiringInsights":{"headline":"<2-sentence recruiter impression>","portfolioHealth":{"highImpact":["<repo1>","<repo2>"],"clutter":["<repo3>"]},"projectEnhancements":[{"repoName":"<topRepo>","suggestions":["<tech-tip1>","<tech-tip2>"]}],"roadmap":[{"step":1,"title":"<milestone>","description":"<details>"}]}}

SCORING:
prof(0-100): bio+20 avatar+10 location+10 company+15 blog+15 naming+10 social+10 2yr+10
doc(0-100): readme/repo+20(max60) descriptions+15 commits+15 wiki+10
tech(0-100): 3+langs+30 5+langs+50 topics+20 complexity+15 modern+15
comm(0-100): stars_log(100+→30,10+→15) forks+15 ratio>1+15 recent+20 extPR+20
code(0-100): msgs+25 org+25 license+20 style+15 ci+15
profileScore=prof*.15+doc*.25+tech*.20+comm*.20+code*.20
contribScore: +10/merged_ext(cap60) +5/open_ext(cap20) rate>70%+20

Reference actual repos. No invented data. If empty data return {"error":"insufficient_data"}.`;
}

// ─── Roadmap Prompt Builder ─────────────────────────────────────────────────

function buildRoadmapPrompt(data: GitHubProfileData): string {
    const sortedPRs = [...data.pullRequests]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const prLines = sortedPRs
        .map((pr) => `- ${pr.title} → ${pr.repoFullName} (${pr.merged ? "merged" : "open"}, ★${pr.repoStars})${pr.body ? " | " + pr.body.slice(0, 120) : ""}`)
        .join("\n");

    const forkLines = data.forkedRepos
        .map((r) => `- ${r.name} (${r.language || "?"}, ★${r.stargazers_count})`)
        .join("\n");

    const stats = stripEmpty(data.prStats);

    return `Career coach analysis. Analyze PR history. Return JSON.

USER: ${data.user.login}${data.user.name ? ` (${data.user.name})` : ""}${data.user.bio ? ` — ${data.user.bio}` : ""}
PR STATS: ${JSON.stringify(stats)}

PRS:
${prLines || "None"}

FORKED REPOS:
${forkLines || "None"}

Respond with ONLY valid JSON:
{"expertiseAreas":[{"title":"<area>","description":"<why, cite PRs>"}],"projectIdea":{"title":"<idea>","description":"<why>","techStack":["<tech>"]}}

Return exactly 3 expertise areas. Project idea must be specific.`;
}

// ─── Direct Ollama Adapter ──────────────────────────────────────────────────

async function callOllama(
    systemPrompt: string,
    userPrompt: string
): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 300_000); // 5 minute timeout

    try {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (OLLAMA_API_KEY) {
            headers["Authorization"] = `Bearer ${OLLAMA_API_KEY}`;
        }

        const response = await fetch(OLLAMA_API_URL, {
            method: "POST",
            headers,
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: `${systemPrompt}\n\n${userPrompt}`,
                stream: false, // We use non-streaming for the internal call, handled by route for streaming to client
                format: "json",
                options: {
                    temperature: 0,
                    num_predict: 4000,
                },
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 401 || response.status === 403) {
                throw new Error("AI Service Unauthorized. Check API Key configuration.");
            }
            throw new Error(`AI Service Error (${response.status}): ${errorText}`);
        }

        // Handle both streaming (NDJSON) and non-streaming responses
        // Since we requested stream: false, we expect a single JSON object with 'response' field
        const result = await response.json();

        // Some Ollama versions might return differently, handle robustly
        return result.response || result.message?.content || "";
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error("AI Service Timeout. The model took too long to respond.");
        }
        // Check for connection refused
        if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new Error("AI Service Unavailable. Unable to connect to the secured Ollama instance.");
        }
        throw error;
    } finally {
        clearTimeout(timeout);
    }
}

// ─── Unified Analysis Function ──────────────────────────────────────────────

export async function generateAnalysis(
    data: GitHubProfileData
): Promise<AIAnalysisResult> {
    const prompt = buildPrompt(data);
    const systemPrompt = "Expert technical recruiter. Respond with valid JSON only.";

    const content = await callOllama(systemPrompt, prompt);

    if (!content || content.trim() === "") {
        throw new Error("AI Service returned empty response.");
    }

    try {
        return JSON.parse(content) as AIAnalysisResult;
    } catch (e) {
        console.error("JSON Parse Error:", content);
        throw new Error("AI Service returned invalid JSON.");
    }
}

// ─── Unified Roadmap Function ───────────────────────────────────────────────

export async function generateRoadmap(
    data: GitHubProfileData
): Promise<GrowthRoadmapAI> {
    const prompt = buildRoadmapPrompt(data);
    const systemPrompt = "Career coach. Respond with valid JSON only.";

    const content = await callOllama(systemPrompt, prompt);

    if (!content) throw new Error("No roadmap response from AI");

    try {
        return JSON.parse(content) as GrowthRoadmapAI;
    } catch (e) {
        console.error("JSON Parse Error (Roadmap):", content);
        throw new Error("AI Service returned invalid JSON for roadmap.");
    }
}
