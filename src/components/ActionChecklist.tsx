"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, AlertTriangle, Info, ArrowUpRight } from "lucide-react";
import { ActionItem } from "@/lib/types";

interface ActionChecklistProps {
    items: ActionItem[];
}

const priorityStyles = {
    high: {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        text: "text-red-400",
        badge: "bg-red-500/20 text-red-400",
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
    },
    medium: {
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        text: "text-amber-400",
        badge: "bg-amber-500/20 text-amber-400",
        icon: <ArrowUpRight className="h-3.5 w-3.5" />,
    },
    low: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        text: "text-blue-400",
        badge: "bg-blue-500/20 text-blue-400",
        icon: <Info className="h-3.5 w-3.5" />,
    },
};

const categoryColors: Record<string, string> = {
    profile: "text-violet-400",
    repository: "text-cyan-400",
    documentation: "text-emerald-400",
    community: "text-amber-400",
};

export default function ActionChecklist({ items }: ActionChecklistProps) {
    const [checked, setChecked] = useState<Set<number>>(new Set());

    const toggle = (index: number) => {
        setChecked((prev) => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const safeItems = Array.isArray(items) ? items : [];
    const sortedItems = [...safeItems].sort((a, b) => {
        const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
        const pa = order[a.priority?.toLowerCase?.()] ?? 1;
        const pb = order[b.priority?.toLowerCase?.()] ?? 1;
        return pa - pb;
    });

    const completedCount = checked.size;
    const totalCount = items.length;
    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
        >
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Quick Wins</h3>
                <span className="text-sm text-gray-400">
                    {completedCount}/{totalCount} done
                </span>
            </div>

            {/* Progress bar */}
            <div className="mb-5 h-1 overflow-hidden rounded-full bg-white/5">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>

            {/* Checklist */}
            <div className="space-y-2">
                {sortedItems.map((item, index) => {
                    const isChecked = checked.has(index);
                    const normalizedPriority = (item.priority?.toLowerCase?.() ?? "medium") as keyof typeof priorityStyles;
                    const style = priorityStyles[normalizedPriority] ?? priorityStyles.medium;

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            onClick={() => toggle(index)}
                            className={`cursor-pointer rounded-xl border p-3 transition-all ${isChecked
                                ? "border-white/5 bg-white/[0.01] opacity-50"
                                : `${style.border} ${style.bg}`
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex-shrink-0">
                                    {isChecked ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-gray-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span
                                            className={`text-sm font-medium ${isChecked ? "text-gray-500 line-through" : "text-white"
                                                }`}
                                        >
                                            {item.title}
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase ${style.badge}`}
                                        >
                                            {style.icon}
                                            {item.priority}
                                        </span>
                                        <span
                                            className={`text-[10px] font-medium uppercase ${categoryColors[item.category] || "text-gray-400"
                                                }`}
                                        >
                                            {item.category}
                                        </span>
                                    </div>
                                    <p
                                        className={`mt-1 text-xs ${isChecked ? "text-gray-600" : "text-gray-400"
                                            }`}
                                    >
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
