"use client";

import { motion } from "framer-motion";
import {
    GitMerge,
    GitPullRequest,
    Star,
    Rocket,
    BookOpen,
    Code,
    ArrowRight,
    Search,
    ExternalLink,
    TrendingUp,
    Target,
    Lightbulb,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { PullRequestInfo, PRStats, GrowthRoadmapAI, GitHubUser, GitHubRepo } from "@/lib/types";

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface GrowthRoadmapProps {
    user: GitHubUser;
    pullRequests: PullRequestInfo[];
    prStats: PRStats;
    forkedRepos: GitHubRepo[];
    roadmap: GrowthRoadmapAI | null;
}

/* ─── Fade-in animation wrapper ──────────────────────────────────────────── */

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            {children}
        </motion.div>
    );
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function GrowthRoadmap({
    user,
    pullRequests,
    prStats,
    forkedRepos,
    roadmap,
}: GrowthRoadmapProps) {
    const expertiseAreas = roadmap?.expertiseAreas ?? [];
    const projectIdea = roadmap?.projectIdea ?? null;

    // Highlight PRs to high-star repos first, then recent
    const sortedPRs = [...pullRequests]
        .sort((a, b) => b.repoStars - a.repoStars)
        .slice(0, 8);

    return (
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            {/* ── Hero ────────────────────────────────────── */}
            <Reveal>
                <div className="mb-12 text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
                        <TrendingUp className="h-4 w-4" />
                        Growth Roadmap
                    </div>
                    <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
                        {user.name || user.login}&apos;s Contribution Journey
                    </h1>
                    <p className="mx-auto max-w-xl text-gray-400">
                        You may not have many personal projects yet, but your contribution
                        history tells a story. Here&apos;s your roadmap to building a standout
                        portfolio.
                    </p>
                </div>
            </Reveal>

            {/* ── Impact Metrics ──────────────────────────── */}
            <Reveal delay={0.1}>
                <div className="mb-10 grid gap-4 sm:grid-cols-3">
                    <MetricCard
                        icon={<GitPullRequest className="h-5 w-5" />}
                        label="Total PRs"
                        value={prStats.total}
                        accent="violet"
                    />
                    <MetricCard
                        icon={<GitMerge className="h-5 w-5" />}
                        label="Merged PRs"
                        value={prStats.merged}
                        sub={prStats.thirdPartyMerged > 0 ? `${prStats.thirdPartyMerged} in 3rd-party repos` : undefined}
                        accent="emerald"
                    />
                    <MetricCard
                        icon={<Target className="h-5 w-5" />}
                        label="Acceptance Rate"
                        value={`${prStats.acceptanceRate}%`}
                        accent="cyan"
                    />
                </div>
            </Reveal>

            {/* ── Contribution Score ─────────────────────── */}
            {prStats.thirdPartyMerged > 0 && (
                <Reveal delay={0.15}>
                    <div className="mb-10 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                                <Zap className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="mb-1 text-lg font-semibold text-white">Code Review Proven</h3>
                                <p className="text-sm text-gray-400">
                                    You&apos;ve had <span className="font-medium text-emerald-400">{prStats.thirdPartyMerged} PRs merged</span> into
                                    other people&apos;s repositories. This means your code has passed professional review — a strong hiring signal.
                                </p>
                            </div>
                        </div>
                    </div>
                </Reveal>
            )}

            {/* ── Significant Contributions (Timeline) ─── */}
            {sortedPRs.length > 0 && (
                <Reveal delay={0.2}>
                    <div className="mb-10">
                        <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-white">
                            <GitPullRequest className="h-5 w-5 text-violet-400" />
                            Significant Contributions
                        </h2>
                        <div className="relative space-y-1 pl-6 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-gradient-to-b before:from-violet-500/40 before:to-transparent">
                            {sortedPRs.map((pr, i) => (
                                <PRTimelineItem key={`${pr.url}-${i}`} pr={pr} index={i} />
                            ))}
                        </div>
                    </div>
                </Reveal>
            )}

            {/* ── AI Roadmap ─────────────────────────────── */}
            {expertiseAreas.length > 0 && (
                <Reveal delay={0.3}>
                    <div className="mb-10">
                        <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-white">
                            <Lightbulb className="h-5 w-5 text-amber-400" />
                            AI-Identified Expertise
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {expertiseAreas.map((area, i) => (
                                <motion.div
                                    key={area.title}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.35 + i * 0.1 }}
                                    className="rounded-2xl border border-white/5 bg-white/[0.02] p-5"
                                >
                                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                                        <span className="text-sm font-bold">{i + 1}</span>
                                    </div>
                                    <h3 className="mb-1 text-sm font-semibold text-white">{area.title}</h3>
                                    <p className="text-xs leading-relaxed text-gray-400">{area.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </Reveal>
            )}

            {/* ── Project Idea ───────────────────────────── */}
            {projectIdea && (
                <Reveal delay={0.4}>
                    <div className="mb-10 overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-cyan-500/5 p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20">
                                <Rocket className="h-6 w-6 text-violet-400" />
                            </div>
                            <div>
                                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-violet-400">
                                    Suggested Project
                                </p>
                                <h3 className="mb-2 text-lg font-semibold text-white">{projectIdea.title}</h3>
                                <p className="mb-3 text-sm text-gray-400">{projectIdea.description}</p>
                                {Array.isArray(projectIdea.techStack) && projectIdea.techStack.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {projectIdea.techStack.map((tech) => (
                                            <span
                                                key={tech}
                                                className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-gray-300"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Reveal>
            )}

            {/* ── Forked Repos ────────────────────────────── */}
            {forkedRepos.length > 0 && (
                <Reveal delay={0.45}>
                    <div className="mb-10">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                            <Code className="h-5 w-5 text-cyan-400" />
                            Forked Projects
                        </h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {forkedRepos.slice(0, 6).map((repo) => (
                                <a
                                    key={repo.name}
                                    href={repo.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/10"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-white group-hover:text-cyan-400">
                                            {repo.name}
                                        </p>
                                        {repo.language && (
                                            <p className="text-xs text-gray-500">{repo.language}</p>
                                        )}
                                    </div>
                                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-gray-600 group-hover:text-gray-400" />
                                </a>
                            ))}
                        </div>
                    </div>
                </Reveal>
            )}

            {/* ── Profile Power-Ups (Tips Grid) ──────────── */}
            <Reveal delay={0.5}>
                <div className="mb-10">
                    <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-white">
                        <Star className="h-5 w-5 text-amber-400" />
                        Profile Power-Ups
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <TipCard
                            icon={<Rocket className="h-5 w-5" />}
                            title="The Open Source Jumpstart"
                            description="Find beginner-friendly issues in popular repos. Look for 'good first issue' labels to start contributing today."
                            linkLabel="Browse Good First Issues"
                            linkHref="https://github.com/topics/good-first-issue"
                            gradient="from-emerald-500/10 to-teal-500/10"
                            iconColor="text-emerald-400"
                        />
                        <TipCard
                            icon={<Code className="h-5 w-5" />}
                            title="Own Your Code"
                            description="Create a personal project instead of just forking. Even a small CLI tool or API shows initiative and original thinking."
                            gradient="from-violet-500/10 to-purple-500/10"
                            iconColor="text-violet-400"
                        />
                        <TipCard
                            icon={<BookOpen className="h-5 w-5" />}
                            title="Document for Humans"
                            description="A great README transforms a script into a portfolio piece. Include setup instructions, screenshots, and a tech stack overview."
                            gradient="from-cyan-500/10 to-blue-500/10"
                            iconColor="text-cyan-400"
                        />
                    </div>
                </div>
            </Reveal>

            {/* ── CTA ─────────────────────────────────────── */}
            <Reveal delay={0.55}>
                <div className="text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-violet-500/25"
                    >
                        <Search className="h-4 w-4" />
                        Search Another User
                    </Link>
                </div>
            </Reveal>
        </div>
    );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function MetricCard({
    icon,
    label,
    value,
    sub,
    accent,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sub?: string;
    accent: "violet" | "emerald" | "cyan";
}) {
    const accentMap = {
        violet: { bg: "bg-violet-500/10", text: "text-violet-400" },
        emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
        cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400" },
    };
    const a = accentMap[accent];

    return (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${a.bg} ${a.text}`}>
                {icon}
            </div>
            <p className="mb-0.5 text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
            {sub && <p className={`mt-1 text-xs ${a.text}`}>{sub}</p>}
        </div>
    );
}

function PRTimelineItem({ pr, index }: { pr: PullRequestInfo; index: number }) {
    const isMerged = pr.merged;
    const dotColor = isMerged
        ? "bg-emerald-500 shadow-emerald-500/40"
        : pr.state === "open"
            ? "bg-amber-500 shadow-amber-500/40"
            : "bg-gray-500";

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + index * 0.05 }}
            className="relative flex items-start gap-3 py-2"
        >
            <div className={`absolute -left-6 top-3.5 h-2.5 w-2.5 rounded-full ${dotColor} shadow-md`} />
            <div className="min-w-0 flex-1">
                <a
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2"
                >
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white group-hover:text-violet-400">
                            {pr.title}
                        </p>
                        <p className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="truncate">{pr.repoFullName}</span>
                            {pr.repoStars > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-amber-500">
                                    <Star className="h-3 w-3" /> {pr.repoStars.toLocaleString()}
                                </span>
                            )}
                        </p>
                    </div>
                    <span
                        className={`mt-0.5 flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${isMerged
                                ? "bg-emerald-500/10 text-emerald-400"
                                : pr.state === "open"
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-gray-500/10 text-gray-400"
                            }`}
                    >
                        {isMerged ? "Merged" : pr.state === "open" ? "Open" : "Closed"}
                    </span>
                </a>
            </div>
        </motion.div>
    );
}

function TipCard({
    icon,
    title,
    description,
    linkLabel,
    linkHref,
    gradient,
    iconColor,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    linkLabel?: string;
    linkHref?: string;
    gradient: string;
    iconColor: string;
}) {
    return (
        <div className={`rounded-2xl border border-white/5 bg-gradient-to-br ${gradient} p-5`}>
            <div className={`mb-3 ${iconColor}`}>{icon}</div>
            <h3 className="mb-1 text-sm font-semibold text-white">{title}</h3>
            <p className="mb-3 text-xs leading-relaxed text-gray-400">{description}</p>
            {linkLabel && linkHref && (
                <a
                    href={linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 text-xs font-medium ${iconColor} hover:underline`}
                >
                    {linkLabel} <ArrowRight className="h-3 w-3" />
                </a>
            )}
        </div>
    );
}
