"use client";

import { motion } from "framer-motion";
import { Zap, GitBranch } from "lucide-react";

interface ProjectEnhancementsProps {
    enhancements: {
        repoName: string;
        suggestions: string[];
    }[];
}

export default function ProjectEnhancements({ enhancements }: ProjectEnhancementsProps) {
    if (!enhancements || enhancements.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
        >
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                    <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">Level Up Your Code</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {enhancements.map((item, idx) => (
                    <div
                        key={idx}
                        className="rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-colors hover:bg-white/[0.04]"
                    >
                        <div className="mb-3 flex items-center gap-2 text-violet-300">
                            <GitBranch className="h-4 w-4" />
                            <h4 className="font-medium">{item.repoName}</h4>
                        </div>
                        <ul className="space-y-2.5">
                            {item.suggestions.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-500" />
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
