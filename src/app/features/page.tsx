"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
    Sparkles,
    Brain,
    FileDown,
    ArrowLeft,
    Shield,
    Zap,
    Eye,
    GitBranch,
    FileText,
    Target,
    CheckCircle2,
    Code2,
    Users,
    Lock,
    Globe,
    Server,
    BarChart3,
    Lightbulb,
    BookOpen,
} from "lucide-react";

/* ─── Scroll-reveal wrapper ─────────────────────────────────────────── */

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.7, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ─── Feature detail card ───────────────────────────────────────────── */

function DetailCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="glass-card p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-violet-400">
                {icon}
            </div>
            <h4 className="mb-1.5 text-sm font-semibold text-white">{title}</h4>
            <p className="text-xs leading-relaxed text-gray-400">{description}</p>
        </div>
    );
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function FeaturesPage() {
    return (
        <div className="relative">
            {/* Sticky back nav */}
            <div className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-lg">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Analyzer
                    </Link>
                    <nav className="hidden items-center gap-6 text-xs text-gray-500 sm:flex">
                        <a href="#analysis" className="transition-colors hover:text-white">Analysis</a>
                        <a href="#security" className="transition-colors hover:text-white">Security</a>
                        <a href="#enhancements" className="transition-colors hover:text-white">Enhancements</a>
                    </nav>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
                {/* ═══════════════════════════════════════════════════════════
                    HERO
                   ═══════════════════════════════════════════════════════════ */}
                <Reveal className="mb-24 text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI-Powered GitHub Portfolio Analyzer &amp; Enhancer
                    </div>

                    <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        Turn your Code into a{" "}
                        <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                            Career-Ready Portfolio
                        </span>
                    </h1>

                    <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
                        We analyze your repositories, READMEs, and commit patterns with AI to produce
                        a comprehensive Hiring Score, actionable improvements, and a polished PDF report
                        you can share with recruiters — all in seconds.
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-violet-500/25"
                        >
                            <Zap className="h-4 w-4" />
                            Try the Analyzer
                        </Link>
                        <a
                            href="#analysis"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-gray-300 transition-all hover:bg-white/[0.06] hover:text-white"
                        >
                            <Eye className="h-4 w-4" />
                            See How It Works
                        </a>
                    </div>
                </Reveal>

                {/* ═══════════════════════════════════════════════════════════
                    SECTION 1 — AI-POWERED ANALYSIS
                   ═══════════════════════════════════════════════════════════ */}
                <section id="analysis" className="mb-28 scroll-mt-20">
                    <Reveal>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                            <Sparkles className="h-3 w-3" />
                            AI-Powered Analysis
                        </div>
                        <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
                            Deep-Dive Profile Intelligence
                        </h2>
                        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
                            We don&apos;t just count stars — we understand context. Using GitHub&apos;s Octokit API,
                            we fetch your repositories, README contents, commit messages, language distributions,
                            and community metrics. The full dataset is then evaluated by your chosen LLM against
                            five recruiting-grade dimensions.
                        </p>
                    </Reveal>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Reveal delay={0.1}>
                            <DetailCard
                                icon={<GitBranch className="h-5 w-5" />}
                                title="Repository Deep Scan"
                                description="We analyze your top repositories by stars, forks, topics, licensing, homepage links, and wiki usage to assess project maturity."
                            />
                        </Reveal>
                        <Reveal delay={0.2}>
                            <DetailCard
                                icon={<FileText className="h-5 w-5" />}
                                title="README Quality Scoring"
                                description="Each README is parsed and critiqued for structure, clarity, installation instructions, usage examples, and visual assets."
                            />
                        </Reveal>
                        <Reveal delay={0.3}>
                            <DetailCard
                                icon={<BarChart3 className="h-5 w-5" />}
                                title="5-Dimension Hiring Score"
                                description="Professionalism, Documentation, Technical Breadth, Community Engagement, and Code Quality — each scored 0-100 with an overall composite."
                            />
                        </Reveal>
                        <Reveal delay={0.4}>
                            <DetailCard
                                icon={<Code2 className="h-5 w-5" />}
                                title="Commit Pattern Analysis"
                                description="Recent commits are scanned for message quality, consistency, and contribution patterns to infer coding discipline."
                            />
                        </Reveal>
                        <Reveal delay={0.5}>
                            <DetailCard
                                icon={<Users className="h-5 w-5" />}
                                title="Community Metrics"
                                description="Follower-to-following ratio, star density, fork rates, and contribution activity paint a picture of community presence."
                            />
                        </Reveal>
                        <Reveal delay={0.6}>
                            <DetailCard
                                icon={<Target className="h-5 w-5" />}
                                title="Actionable Quick Wins"
                                description="You get a prioritized checklist of specific, actionable improvements — not generic advice, but changes to actual repos."
                            />
                        </Reveal>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    SECTION 2 — MULTI-PROVIDER AI
                   ═══════════════════════════════════════════════════════════ */}
                {/* ═══════════════════════════════════════════════════════════
                    SECTION 2 — PRIVATE & SECURE AI
                   ═══════════════════════════════════════════════════════════ */}
                <section id="security" className="mb-28 scroll-mt-20">
                    <Reveal>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
                            <Lock className="h-3 w-3" />
                            Private & Secure AI
                        </div>
                        <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
                            Enterprise-Grade Security
                        </h2>
                        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
                            Your data never leaves your infrastructure. Powered exclusively by your own secured
                            Ollama instance, ensuring complete privacy and control over your codebase analysis.
                        </p>
                    </Reveal>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Reveal delay={0.1}>
                            <div className="glass-card feature-glow p-6 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                    <Server className="h-7 w-7" />
                                </div>
                                <h4 className="mb-1 text-base font-semibold text-white">Self-Hosted Ollama</h4>
                                <p className="mb-3 text-xs text-gray-400">Llama 3 & Beyond</p>
                                <ul className="space-y-1.5 text-left text-xs text-gray-400">
                                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" /> Full control over models</li>
                                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" /> Zero external API latency</li>
                                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" /> No data egress</li>
                                </ul>
                            </div>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <div className="glass-card feature-glow p-6 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                    <Shield className="h-7 w-7" />
                                </div>
                                <h4 className="mb-1 text-base font-semibold text-white">Secure Communication</h4>
                                <p className="mb-3 text-xs text-gray-400">End-to-End Encryption</p>
                                <ul className="space-y-1.5 text-left text-xs text-gray-400">
                                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-blue-400" /> Direct-to-Ollama calls</li>
                                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-blue-400" /> HTTPS everywhere</li>
                                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-blue-400" /> No middleman logging</li>
                                </ul>
                            </div>
                        </Reveal>
                        <Reveal delay={0.3}>
                            <div className="glass-card feature-glow p-6 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                                    <Lock className="h-7 w-7" />
                                </div>
                                <h4 className="mb-1 text-base font-semibold text-white">Compliance Ready</h4>
                                <p className="mb-3 text-xs text-gray-400">For Enterprise & Teams</p>
                                <ul className="space-y-1.5 text-left text-xs text-gray-400">
                                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-violet-400" /> Audit-friendly architecture</li>
                                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-violet-400" /> Private repo analysis</li>
                                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-violet-400" /> No third-party data sharing</li>
                                </ul>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    SECTION 3 — PDF EXPORT
                   ═══════════════════════════════════════════════════════════ */}


                {/* ═══════════════════════════════════════════════════════════
                    SECTION 4 — ENHANCEMENTS
                   ═══════════════════════════════════════════════════════════ */}
                <section id="enhancements" className="mb-16 scroll-mt-20">
                    <Reveal>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                            <Lightbulb className="h-3 w-3" />
                            Profile Enhancer
                        </div>
                        <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
                            Don&apos;t Just Analyze — Improve
                        </h2>
                        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
                            ProfileAI doesn&apos;t just grade you — it shows you exactly how to level up.
                            Every analysis comes with concrete enhancement suggestions that you can act
                            on immediately.
                        </p>
                    </Reveal>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <Reveal delay={0.1}>
                            <div className="glass-card p-6">
                                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                                        <Users className="h-4 w-4 text-white" />
                                    </span>
                                    Bio Optimization
                                </h3>
                                <p className="mb-3 text-sm text-gray-400">
                                    Your current bio is shown side-by-side with an AI-crafted alternative
                                    that highlights your strongest skills and projects. Copy it with one click.
                                </p>
                                <ul className="space-y-1.5 text-xs text-gray-500">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-violet-400" /> Tailored to your actual work</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-violet-400" /> Professional tone with personality</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-violet-400" /> Before/after comparison view</li>
                                </ul>
                            </div>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <div className="glass-card p-6">
                                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                                        <FileText className="h-4 w-4 text-white" />
                                    </span>
                                    README Audits
                                </h3>
                                <p className="mb-3 text-sm text-gray-400">
                                    Each of your top repositories gets a detailed README critique with
                                    a quality score, highlighted strengths, and concrete improvement suggestions.
                                </p>
                                <ul className="space-y-1.5 text-xs text-gray-500">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-cyan-400" /> Per-repo quality scores</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-cyan-400" /> Structure and content analysis</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-cyan-400" /> Missing section detection</li>
                                </ul>
                            </div>
                        </Reveal>
                        <Reveal delay={0.3}>
                            <div className="glass-card p-6">
                                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                                        <Target className="h-4 w-4 text-white" />
                                    </span>
                                    Skill-Gap Analysis
                                </h3>
                                <p className="mb-3 text-sm text-gray-400">
                                    Based on your language distribution and project types, the AI identifies
                                    skills you should showcase more prominently or develop further.
                                </p>
                                <ul className="space-y-1.5 text-xs text-gray-500">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Language confidence levels</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Suggested skills to highlight</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Interactive radar visualization</li>
                                </ul>
                            </div>
                        </Reveal>
                        <Reveal delay={0.4}>
                            <div className="glass-card p-6">
                                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                                        <Zap className="h-4 w-4 text-white" />
                                    </span>
                                    Prioritized Action Plan
                                </h3>
                                <p className="mb-3 text-sm text-gray-400">
                                    Get a checklist of quick wins sorted by impact — from profile tweaks
                                    to repository improvements — with an interactive progress tracker.
                                </p>
                                <ul className="space-y-1.5 text-xs text-gray-500">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-amber-400" /> High / Medium / Low priority</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-amber-400" /> Category-based organization</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-amber-400" /> Interactive checkbox tracking</li>
                                </ul>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    CTA
                   ═══════════════════════════════════════════════════════════ */}
                <Reveal className="text-center">
                    <div className="rounded-2xl border border-violet-500/10 bg-gradient-to-br from-violet-500/5 to-cyan-500/5 p-10">
                        <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                            Ready to level up your profile?
                        </h2>
                        <p className="mx-auto mb-6 max-w-md text-sm text-gray-400">
                            Enter any GitHub username and get a full AI-powered audit in under a minute.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-8 py-3.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-violet-500/25"
                        >
                            <Sparkles className="h-4 w-4" />
                            Start Analyzing
                        </Link>
                    </div>
                </Reveal>
            </div>
        </div>
    );
}
