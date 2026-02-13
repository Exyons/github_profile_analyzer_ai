"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FileText, TrendingUp, AlertCircle } from "lucide-react";
import { ReadmeCritique as ReadmeCritiqueType } from "@/lib/types";

interface ReadmeCritiqueProps {
    critiques: ReadmeCritiqueType[];
}

function getScoreColor(score: number): string {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    if (score >= 40) return "#f97316";
    return "#ef4444";
}

export default function ReadmeCritique({ critiques }: ReadmeCritiqueProps) {
    if (!critiques || critiques.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
        >
            <h3 className="mb-4 text-lg font-semibold text-white">README Analysis</h3>

            <div className="space-y-4">
                {critiques.map((critique, index) => (
                    <motion.div
                        key={critique.repoName}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
                    >
                        {/* Header */}
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-violet-400" />
                                <span className="font-medium text-white">{critique.repoName}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-400">Score:</span>
                                <span
                                    className="text-sm font-bold"
                                    style={{ color: getScoreColor(critique.score) }}
                                >
                                    {critique.score}/100
                                </span>
                            </div>
                        </div>

                        {/* Strengths */}
                        {critique.strengths.length > 0 && (
                            <div className="mb-3">
                                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                                    <TrendingUp className="h-3 w-3" />
                                    Strengths
                                </div>
                                <ul className="space-y-1">
                                    {critique.strengths.map((s, i) => (
                                        <li key={i} className="text-xs text-gray-400 pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-emerald-500">
                                            <div className="readme-content">
                                                <ReactMarkdown>{s}</ReactMarkdown>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Improvements */}
                        {critique.improvements.length > 0 && (
                            <div>
                                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-400">
                                    <AlertCircle className="h-3 w-3" />
                                    Improvements
                                </div>
                                <ul className="space-y-1">
                                    {critique.improvements.map((s, i) => (
                                        <li key={i} className="text-xs text-gray-400 pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-amber-500">
                                            <div className="readme-content">
                                                <ReactMarkdown>{s}</ReactMarkdown>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
