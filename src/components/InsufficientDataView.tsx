"use client";

import { motion } from "framer-motion";
import { PackageOpen, Search, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface InsufficientDataViewProps {
    username: string;
}

export default function InsufficientDataView({ username }: InsufficientDataViewProps) {
    return (
        <div className="mx-auto max-w-lg px-4 py-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 text-center"
            >
                <div className="mb-5 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
                        <PackageOpen className="h-8 w-8 text-amber-400" />
                    </div>
                </div>

                <h2 className="mb-2 text-xl font-semibold text-white">
                    Not Enough Data to Analyze
                </h2>

                <p className="mb-6 text-sm leading-relaxed text-gray-400">
                    The profile{" "}
                    <span className="font-medium text-white">@{username}</span>{" "}
                    currently has no public repositories or activity. We need at least
                    one public project to generate a Hiring Score and improvement
                    insights.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-violet-500/25"
                >
                    <Search className="h-4 w-4" />
                    Search Another User
                </Link>
            </motion.div>
        </div>
    );
}

/* ── Low Data Warning Banner ────────────────────────────────────────── */

interface LowDataWarningProps {
    username: string;
}

export function LowDataWarning({ username }: LowDataWarningProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-6 max-w-7xl px-4 sm:px-6"
        >
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
                <div>
                    <p className="text-sm font-medium text-amber-300">
                        Limited Analysis
                    </p>
                    <p className="text-xs text-gray-400">
                        <span className="font-medium text-white">@{username}</span> has
                        repositories but lacks documentation (READMEs), so the analysis
                        may be less accurate.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
