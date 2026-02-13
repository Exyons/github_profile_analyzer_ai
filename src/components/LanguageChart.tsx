"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { LanguageConfidence } from "@/lib/types";

interface LanguageChartProps {
    languageStats: Record<string, number>;
    languageConfidence: LanguageConfidence[];
}

const COLORS = [
    "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444",
    "#ec4899", "#6366f1", "#14b8a6", "#f97316", "#84cc16",
    "#a855f7", "#22d3ee",
];

const confidenceColors: Record<string, string> = {
    expert: "text-emerald-400",
    proficient: "text-cyan-400",
    familiar: "text-amber-400",
    beginner: "text-gray-400",
};

export default function LanguageChart({ languageStats, languageConfidence }: LanguageChartProps) {
    const totalBytes = Object.values(languageStats).reduce((a, b) => a + b, 0);
    if (totalBytes === 0) return null;

    const chartData = Object.entries(languageStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, value]) => ({
            name,
            value,
            percentage: ((value / totalBytes) * 100).toFixed(1),
        }));

    const confidenceMap = new Map(
        (languageConfidence ?? []).map((lc) => [lc.language, lc.confidence])
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
        >
            <h3 className="mb-4 text-lg font-semibold text-white">Language Distribution</h3>

            <div className="flex flex-col items-center gap-6 lg:flex-row">
                <div className="w-full max-w-[220px]">
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        style={{ filter: `drop-shadow(0 0 4px ${COLORS[index % COLORS.length]}40)` }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (!active || !payload?.[0]) return null;
                                    const data = payload[0].payload;
                                    return (
                                        <div className="rounded-lg border border-white/10 bg-[#12121a]/95 px-3 py-2 shadow-lg backdrop-blur-sm">
                                            <p className="text-sm font-medium text-white">{data.name}</p>
                                            <p className="text-xs text-gray-400">{data.percentage}%</p>
                                        </div>
                                    );
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex-1 space-y-2 w-full">
                    {chartData.map((lang, index) => {
                        const confidence = confidenceMap.get(lang.name);
                        return (
                            <div key={lang.name} className="flex items-center gap-3">
                                <div
                                    className="h-3 w-3 flex-shrink-0 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="w-24 truncate text-sm text-gray-300">{lang.name}</span>
                                <div className="flex-1">
                                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${lang.percentage}%` }}
                                            transition={{ delay: 0.5 + index * 0.05, duration: 0.6 }}
                                        />
                                    </div>
                                </div>
                                <span className="w-12 text-right text-xs text-gray-500">{lang.percentage}%</span>
                                {confidence && (
                                    <span
                                        className={`w-20 text-right text-[10px] font-medium uppercase ${confidenceColors[confidence]}`}
                                    >
                                        {confidence}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
