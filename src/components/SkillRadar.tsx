"use client";

import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { ScoreBreakdown } from "@/lib/types";

interface SkillRadarProps {
    breakdown: ScoreBreakdown;
}

const dimensionLabels: Record<keyof ScoreBreakdown, string> = {
    professionalism: "Professional",
    documentation: "Docs",
    technicalBreadth: "Tech Breadth",
    communityEngagement: "Community",
    codeQuality: "Code Quality",
};

export default function SkillRadar({ breakdown }: SkillRadarProps) {
    const data = (Object.entries(breakdown) as [keyof ScoreBreakdown, number][]).map(
        ([key, value]) => ({
            dimension: dimensionLabels[key],
            value,
            fullMark: 100,
        })
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
        >
            <h3 className="mb-4 text-lg font-semibold text-white">Skill Radar</h3>

            <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid
                        stroke="rgba(255,255,255,0.06)"
                        strokeDasharray="3 3"
                    />
                    <PolarAngleAxis
                        dataKey="dimension"
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={false}
                        axisLine={false}
                    />
                    <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.15}
                        strokeWidth={2}
                        dot={{
                            r: 4,
                            fill: "#8b5cf6",
                            stroke: "#0a0a0f",
                            strokeWidth: 2,
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
