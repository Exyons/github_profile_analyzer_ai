"use client";

import { motion } from "framer-motion";
import { ScoreBreakdown } from "@/lib/types";

interface HiringScoreGaugeProps {
    score: number;
    breakdown: ScoreBreakdown;
}

function getScoreColor(score: number): string {
    if (score >= 75) return "#10b981"; // Green 75+
    if (score >= 40) return "#f59e0b"; // Yellow 40-74
    return "#ef4444"; // Red < 40
}

function getScoreLabel(score: number): string {
    if (score >= 90) return "Outstanding";
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Very Good";
    if (score >= 60) return "Good";
    if (score >= 50) return "Average";
    if (score >= 40) return "Needs Work";
    return "Needs Improvement";
}

const breakdownLabels: Record<keyof ScoreBreakdown, string> = {
    professionalism: "Professionalism",
    documentation: "Documentation",
    technicalBreadth: "Technical Breadth",
    communityEngagement: "Community",
    codeQuality: "Code Quality",
};

export default function HiringScoreGauge({ score, breakdown }: HiringScoreGaugeProps) {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const color = getScoreColor(score);

    return (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h3 className="mb-4 text-center text-lg font-semibold text-white">Hiring Score</h3>

            <div className="flex justify-center">
                <div className="relative">
                    <svg width="200" height="200" viewBox="0 0 200 200">
                        {/* Background circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="12"
                        />
                        {/* Score arc */}
                        <motion.circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="none"
                            stroke={color}
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            transform="rotate(-90 100 100)"
                            style={{
                                filter: `drop-shadow(0 0 8px ${color}40)`,
                            }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            className="text-4xl font-bold"
                            style={{ color }}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            {score}
                        </motion.span>
                        <span className="text-sm text-gray-400">{getScoreLabel(score)}</span>
                    </div>
                </div>
            </div>

            {/* Breakdown bars */}
            <div className="mt-6 space-y-3">
                {(Object.entries(breakdown) as [keyof ScoreBreakdown, number][]).map(
                    ([key, value], index) => (
                        <div key={key}>
                            <div className="mb-1 flex justify-between text-xs">
                                <span className="text-gray-400">{breakdownLabels[key]}</span>
                                <span className="text-gray-300">{value}</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: getScoreColor(value) }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${value}%` }}
                                    transition={{ delay: 0.3 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
