"use client";

import { useEffect, useState, useCallback, use, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Star,
    GitFork,
    Users,
    BookOpen,
    ExternalLink,
    MapPin,
    Building2,
    Globe,
    RefreshCw,
    Sparkles,
    Cpu,
} from "lucide-react";
import Image from "next/image";
import HiringScoreGauge from "@/components/HiringScoreGauge";
import BioComparison from "@/components/BioComparison";
import ActionChecklist from "@/components/ActionChecklist";
import LanguageChart from "@/components/LanguageChart";
import SkillRadar from "@/components/SkillRadar";
import ReadmeCritique from "@/components/ReadmeCritique";
import InsufficientDataView, { LowDataWarning } from "@/components/InsufficientDataView";
import GrowthRoadmap from "@/components/GrowthRoadmap";
import AnalysisSkeleton from "@/components/AnalysisSkeleton";
import ErrorDialog from "@/components/ErrorDialog";
import RecruiterImpression from "@/components/RecruiterImpression";
import PortfolioHealth from "@/components/PortfolioHealth";
import ProjectEnhancements from "@/components/ProjectEnhancements";
import RecruiterRoadmap from "@/components/RecruiterRoadmap";
import { AIAnalysisResult, GitHubUser, GitHubRepo, PullRequestInfo, PRStats, GrowthRoadmapAI } from "@/lib/types";

// ─── Types ──────────────────────────────────────────────────────────────────

interface GitHubPayload {
    user: GitHubUser;
    topRepos: GitHubRepo[];
    forkedRepos: GitHubRepo[];
    languageStats: Record<string, number>;
    totalStars: number;
    totalForks: number;
    pullRequests: PullRequestInfo[];
    prStats: PRStats;
}

interface AnalysisResponse {
    mode: "full" | "growth";
    githubData: GitHubPayload;
    analysis?: AIAnalysisResult;
    roadmap?: GrowthRoadmapAI | null;
    lowData?: boolean;
    cached?: boolean;
}

type Phase = "idle" | "github" | "ai" | "done" | "error";

// ─── Animated Status Pill ───────────────────────────────────────────────────

function StatusPill({ phase, message }: { phase: Phase; message: string }) {
    if (phase === "done" || phase === "idle") return null;

    const icon =
        phase === "github" ? (
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
        ) : phase === "ai" ? (
            <Cpu className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
        ) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 left-1/2 z-50 -translate-x-1/2"
        >
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-gray-900/80 backdrop-blur-lg px-4 py-2 text-xs text-gray-300 shadow-lg shadow-black/30">
                {icon}
                <Loader2 className="h-3 w-3 animate-spin text-white/40" />
                {message}
            </div>
        </motion.div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function UserAnalysisPage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = use(params);

    // Core state
    const [phase, setPhase] = useState<Phase>("idle");
    const [statusMessage, setStatusMessage] = useState("");
    const [githubData, setGithubData] = useState<GitHubPayload | null>(null);
    const [result, setResult] = useState<AnalysisResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [insufficientData, setInsufficientData] = useState(false);
    const [growthData, setGrowthData] = useState<AnalysisResponse | null>(null);
    const [isCached, setIsCached] = useState(false);
    const [forceRefresh, setForceRefresh] = useState(false);
    const [errorType, setErrorType] = useState<"not_found" | "rate_limit" | "generic">("generic");
    const [resetTimestamp, setResetTimestamp] = useState<number | undefined>(undefined);

    const abortRef = useRef<AbortController | null>(null);

    // ── SSE Streaming Analysis ──────────────────────────────────────────────

    const runAnalysis = useCallback(async () => {


        // Abort previous
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        // Reset
        setPhase("github");
        setStatusMessage("Fetching GitHub data...");
        setError(null);
        setResult(null);
        setGithubData(null);
        setInsufficientData(false);
        setGrowthData(null);
        setIsCached(false);
        setErrorType("generic");
        setResetTimestamp(undefined);

        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                body: JSON.stringify({
                    username,
                    forceRefresh,
                    stream: true,
                }),
                signal: controller.signal,
            });

            if (!response.ok || !response.body) {
                // Detect error type from HTTP status
                if (response.status === 404) setErrorType("not_found");
                else if (response.status === 429) setErrorType("rate_limit");

                // Fallback: try to parse JSON error
                try {
                    const errData = await response.json();
                    if (errData.error?.includes("not found") || errData.error?.includes("USER_NOT_FOUND")) {
                        setErrorType("not_found");
                    }
                    if (errData.resetTimestamp) setResetTimestamp(errData.resetTimestamp);
                    throw new Error(errData.error || "Analysis failed");
                } catch (jsonErr) {
                    if (jsonErr instanceof Error && jsonErr.message !== "Analysis failed") {
                        throw new Error(`Server error (${response.status})`);
                    }
                    throw jsonErr;
                }
            }

            // Read SSE stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Process complete events in buffer
                const events = buffer.split("\n\n");
                buffer = events.pop() || "";

                for (const eventStr of events) {
                    if (!eventStr.trim()) continue;

                    const lines = eventStr.split("\n");
                    let eventType = "";
                    let dataStr = "";

                    for (const line of lines) {
                        if (line.startsWith("event: ")) eventType = line.slice(7);
                        if (line.startsWith("data: ")) dataStr = line.slice(6);
                    }

                    if (!eventType || !dataStr) continue;

                    try {
                        const data = JSON.parse(dataStr);

                        switch (eventType) {
                            case "status":
                                setStatusMessage(data.message || "Processing...");
                                if (data.step === "ai") setPhase("ai");
                                break;

                            case "github_data":
                                setGithubData(data as GitHubPayload);
                                setPhase("ai");
                                setStatusMessage("AI is analyzing your profile...");
                                break;

                            case "complete": {
                                const parsed = data as AnalysisResponse;
                                setPhase("done");
                                setIsCached(!!parsed.cached);
                                if (parsed.mode === "growth") {
                                    setGrowthData(parsed);
                                } else {
                                    setResult(parsed);
                                    // Also ensure githubData is set from complete payload
                                    if (parsed.githubData) setGithubData(parsed.githubData);
                                }
                                break;
                            }

                            case "error":
                                if (data.error === "insufficient_data") {
                                    if (data.githubData) setGithubData(data.githubData);
                                    setInsufficientData(true);
                                    setPhase("done");
                                } else {
                                    // Detect specific error types
                                    if (data.status === 404 || data.error?.includes("not found") || data.error?.includes("USER_NOT_FOUND")) {
                                        setErrorType("not_found");
                                    } else if (data.status === 429 || data.error?.includes("rate limit")) {
                                        setErrorType("rate_limit");
                                        if (data.resetTimestamp) setResetTimestamp(data.resetTimestamp);
                                    }
                                    setError(data.error || "Analysis failed");
                                    setPhase("error");
                                    reader.cancel();
                                    return;
                                }
                                break;
                        }
                    } catch (parseErr) {
                        console.warn("SSE parse error:", parseErr);
                    }
                }
            }
        } catch (err) {
            if (controller.signal.aborted) return;
            const message = err instanceof Error ? err.message : "An unexpected error occurred";
            if (message === "The operation was aborted." || message === "AbortError") return;
            setError(message);
            setPhase("error");
        } finally {
            if (!controller.signal.aborted && forceRefresh) {
                setForceRefresh(false);
            }
        }
    }, [username, forceRefresh]);

    useEffect(() => {
        runAnalysis();
        return () => abortRef.current?.abort();
    }, [username]); // eslint-disable-line react-hooks/exhaustive-deps



    const isLoading = phase !== "done" && phase !== "error" && phase !== "idle";

    // ─── Insufficient Data State ────────────────────────────────────────────
    if (insufficientData) {
        return <InsufficientDataView username={username} />;
    }

    // ── Growth Roadmap Mode ────────────────────────────────────────────────
    if (growthData) {
        return (
            <GrowthRoadmap
                user={growthData.githubData.user}
                pullRequests={growthData.githubData.pullRequests}
                prStats={growthData.githubData.prStats}
                forkedRepos={growthData.githubData.forkedRepos}
                roadmap={growthData.roadmap ?? null}
            />
        );
    }



    // ─── Error State ───────────────────────────────────────────────────────
    if (error) {
        // Full-screen modal for not_found and rate_limit errors
        if (errorType === "not_found" || errorType === "rate_limit") {
            return (
                <ErrorDialog
                    username={username}
                    type={errorType}
                    message={error}
                    resetTimestamp={resetTimestamp}
                />
            );
        }

        // Generic/AI error — inline card with retry
        return (
            <div className="mx-auto max-w-lg px-4 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 text-center"
                >
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
                            <AlertTriangle className="h-8 w-8 text-red-400" />
                        </div>
                    </div>
                    <h2 className="mb-2 text-xl font-semibold text-white">Analysis Failed</h2>
                    <p className="mb-6 text-sm text-gray-400">{error}</p>
                    <div className="flex justify-center gap-3">

                        <button
                            onClick={() => runAnalysis()}
                            className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-violet-500/25"
                        >
                            Retry
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ─── Initial loading (no GitHub data yet) ──────────────────────────────
    if (!githubData && isLoading) {
        return (
            <>
                <AnimatePresence>
                    <StatusPill phase={phase} message={statusMessage} />
                </AnimatePresence>
                <div className="mx-auto max-w-lg px-4 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8"
                    >
                        <div className="mb-6 flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                            <h2 className="text-lg font-semibold text-white">
                                Analyzing @{username}
                            </h2>
                        </div>
                        <div className="space-y-2">
                            {[
                                { label: "Fetching profile data...", active: phase === "github" },
                                { label: "Loading repositories...", active: false },
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                    {step.active ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />
                                    ) : (
                                        <div className="h-3.5 w-3.5 rounded-full bg-white/5" />
                                    )}
                                    {step.label}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </>
        );
    }

    // ─── Progressive Dashboard (GitHub data received) ──────────────────────
    if (!githubData) return null;

    const analysis = result?.analysis;
    const hasAnalysis = !!analysis;
    const { user, topRepos } = githubData;

    return (
        <>
            <AnimatePresence>
                <StatusPill phase={phase} message={statusMessage} />
            </AnimatePresence>

            {result?.lowData && <LowDataWarning username={username} />}

            <div id="analysis-dashboard" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                {/* ── Profile Header (shown immediately) ─────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center"
                >
                    <Image
                        src={user.avatar_url}
                        alt={user.login}
                        width={80}
                        height={80}
                        className="rounded-2xl border-2 border-white/10"
                    />
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold text-white">{user.name || user.login}</h1>
                            <a
                                href={user.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-xs text-gray-400 transition-colors hover:text-white"
                            >
                                @{user.login} <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                        {user.bio && <p className="mt-1 text-sm text-gray-400">{user.bio}</p>}
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                            {user.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {user.location}
                                </span>
                            )}
                            {user.company && (
                                <span className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" /> {user.company}
                                </span>
                            )}
                            {user.blog && (
                                <a
                                    href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-violet-400 hover:text-violet-300"
                                >
                                    <Globe className="h-3 w-3" /> Website
                                </a>
                            )}
                        </div>
                        {/* Stats */}
                        <div className="mt-3 flex flex-wrap gap-4">
                            {[
                                { icon: <Users className="h-3.5 w-3.5" />, label: "Followers", value: user.followers },
                                { icon: <BookOpen className="h-3.5 w-3.5" />, label: "Repos", value: user.public_repos },
                                { icon: <Star className="h-3.5 w-3.5" />, label: "Stars", value: githubData.totalStars },
                                { icon: <GitFork className="h-3.5 w-3.5" />, label: "Forks", value: githubData.totalForks },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs"
                                >
                                    <span className="text-gray-500">{stat.icon}</span>
                                    <span className="font-medium text-white">{String(stat.value)}</span>
                                    <span className="text-gray-500">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">

                        <button
                            onClick={() => { setForceRefresh(true); setTimeout(runAnalysis, 0); }}
                            disabled={isLoading}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm text-gray-300 transition-all hover:bg-white/5 hover:text-white disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                            Refresh Analysis
                        </button>
                        {isCached && (
                            <span className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400">
                                ⚡ Cached Result
                            </span>
                        )}
                    </div>
                </motion.div>

                {/* ── AI Analysis Section ─────────────────────────────────────── */}
                {hasAnalysis ? (
                    <motion.div
                        key="analysis"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Section 1: The First 5 Seconds */}
                        <RecruiterImpression headline={analysis.hiringInsights?.headline} />

                        {/* Summary */}
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="mb-8 rounded-2xl border border-violet-500/10 bg-violet-500/5 p-5"
                            >
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                    className="text-sm leading-relaxed text-gray-300"
                                >
                                    {analysis.summary}
                                </motion.p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Main Grid */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left col — Score + Radar */}
                            <div className="space-y-6">
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                                    <HiringScoreGauge score={analysis.profileScore} breakdown={analysis.scoreBreakdown} />
                                </motion.div>
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                                    <SkillRadar breakdown={analysis.scoreBreakdown} />
                                </motion.div>
                            </div>

                            {/* Center + Right — Bio, Actions, Language, README */}
                            <div className="space-y-6 lg:col-span-2">
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                                    <BioComparison currentBio={analysis.currentBio} suggestedBio={analysis.suggestedBio} />
                                </motion.div>

                                {/* Section 2: Portfolio Health */}
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                    <PortfolioHealth health={analysis.hiringInsights?.portfolioHealth} />
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                                    <ActionChecklist items={analysis.actionItems} />
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                    <RecruiterRoadmap roadmap={analysis.hiringInsights?.roadmap} />
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                                    <ProjectEnhancements enhancements={analysis.hiringInsights?.projectEnhancements} />
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                                    <LanguageChart
                                        languageStats={githubData.languageStats}
                                        languageConfidence={analysis.languageConfidence}
                                    />
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                                    <ReadmeCritique critiques={analysis.readmeCritiques} />
                                </motion.div>

                                {/* Top Repos */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.65 }}
                                    className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
                                >
                                    <h3 className="mb-4 text-lg font-semibold text-white">Top Repositories</h3>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {topRepos.map((repo) => (
                                            <a
                                                key={repo.name}
                                                href={repo.html_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]"
                                            >
                                                <div className="mb-1 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {repo.fork ? (
                                                            <GitFork className="h-3.5 w-3.5 text-cyan-400" />
                                                        ) : (
                                                            <BookOpen className="h-3.5 w-3.5 text-violet-400" />
                                                        )}
                                                        <span className="font-medium text-white text-sm">{repo.name}</span>
                                                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${repo.fork ? 'bg-cyan-500/10 text-cyan-400' : 'bg-violet-500/10 text-violet-400'}`}>
                                                            {repo.fork ? 'Fork' : 'Original'}
                                                        </span>
                                                    </div>
                                                    <ExternalLink className="h-3 w-3 text-gray-500" />
                                                </div>
                                                {repo.description && (
                                                    <p className="mb-2 text-xs text-gray-400 line-clamp-2">{repo.description}</p>
                                                )}
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    {repo.language && (
                                                        <span className="flex items-center gap-1">
                                                            <span className="h-2 w-2 rounded-full bg-violet-400" />
                                                            {repo.language}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Star className="h-3 w-3" /> {repo.stargazers_count}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <GitFork className="h-3 w-3" /> {repo.forks_count}
                                                    </span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Suggested Skills */}
                                {(analysis.suggestedSkills?.length ?? 0) > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.75 }}
                                        className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
                                    >
                                        <h3 className="mb-4 text-lg font-semibold text-white">Suggested Skills to Showcase</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.suggestedSkills.map((skill) => (
                                                <motion.span
                                                    key={skill}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300"
                                                >
                                                    {skill}
                                                </motion.span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ) : isLoading ? (
                    /* ── Shimmer Skeleton (while AI is processing) ─────────── */
                    <AnalysisSkeleton />
                ) : null}
            </div>
        </>
    );
}
