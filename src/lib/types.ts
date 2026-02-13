// ─── GitHub API Types ───────────────────────────────────────────────────────

export interface GitHubUser {
    login: string;
    name: string | null;
    bio: string | null;
    avatar_url: string;
    html_url: string;
    company: string | null;
    location: string | null;
    blog: string | null;
    twitter_username: string | null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
}

export interface GitHubRepo {
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    watchers_count: number;
    open_issues_count: number;
    topics: string[];
    license: { spdx_id: string; name: string } | null;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    fork: boolean;
    has_wiki: boolean;
    has_pages: boolean;
    homepage: string | null;
}

export type LanguageStats = Record<string, number>;

export interface CommitInfo {
    repoName: string;
    message: string;
    date: string;
    sha: string;
}

export interface RepoReadme {
    repoName: string;
    content: string;
}

// ─── Pull Request Types ─────────────────────────────────────────────────────

export interface PullRequestInfo {
    title: string;
    repoFullName: string;
    repoOwner: string;
    repoName: string;
    state: "open" | "closed";
    merged: boolean;
    repoStars: number;
    url: string;
    createdAt: string;
    body: string;
}

export interface PRStats {
    total: number;
    merged: number;
    open: number;
    closed: number;
    acceptanceRate: number;
    thirdPartyMerged: number;
}

export interface GrowthRoadmapAI {
    expertiseAreas: { title: string; description: string }[];
    projectIdea: { title: string; description: string; techStack: string[] };
}

// ─── Aggregated GitHub Data (sent to AI) ────────────────────────────────────

export interface GitHubProfileData {
    user: GitHubUser;
    topRepos: GitHubRepo[];
    forkedRepos: GitHubRepo[];
    readmes: RepoReadme[];
    recentCommits: CommitInfo[];
    languageStats: LanguageStats;
    totalStars: number;
    totalForks: number;
    pullRequests: PullRequestInfo[];
    prStats: PRStats;
}

// ─── AI Analysis Result ─────────────────────────────────────────────────────

export interface ScoreBreakdown {
    professionalism: number;
    documentation: number;
    technicalBreadth: number;
    communityEngagement: number;
    codeQuality: number;
}

export interface ReadmeCritique {
    repoName: string;
    score: number;
    strengths: string[];
    improvements: string[];
}

export interface ActionItem {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    category: "profile" | "repository" | "documentation" | "community";
}

export interface LanguageConfidence {
    language: string;
    percentage: number;
    confidence: "expert" | "proficient" | "familiar" | "beginner";
}

// ─── Recruiter Insights ───────────────────────────────────────────────────

export interface RecruiterInsights {
    headline: string;
    portfolioHealth: {
        highImpact: string[];
        clutter: string[];
    };
    projectEnhancements: {
        repoName: string;
        suggestions: string[];
    }[];
    roadmap: {
        step: number;
        title: string;
        description: string;
    }[];
}

export interface AIAnalysisResult {
    profileScore: number;
    scoreBreakdown: ScoreBreakdown;
    currentBio: string;
    suggestedBio: string;
    readmeCritiques: ReadmeCritique[];
    suggestedSkills: string[];
    actionItems: ActionItem[];
    languageConfidence: LanguageConfidence[];
    topImprovements: string[];
    summary: string;
    hiringInsights: RecruiterInsights; // New field
}



// ─── Error Classes ──────────────────────────────────────────────────────────

export class UserNotFoundError extends Error {
    constructor(username: string) {
        super(`User "${username}" not found`);
        this.name = "UserNotFoundError";
    }
}

export class RateLimitError extends Error {
    resetTimestamp: number;
    constructor(resetTimestamp: number) {
        const resetDate = new Date(resetTimestamp * 1000);
        super(`GitHub API rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}`);
        this.name = "RateLimitError";
        this.resetTimestamp = resetTimestamp;
    }
}

export class GitHubApiError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.name = "GitHubApiError";
        this.statusCode = statusCode;
    }
}
