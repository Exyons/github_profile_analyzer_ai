"use client";

import { motion } from "framer-motion";

/** A single shimmer bar with animated gradient */
function ShimmerBar({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <div className={`relative overflow-hidden rounded-lg bg-white/[0.03] ${className}`} style={style}>
            <motion.div
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
                animate={{ translateX: ["-100%", "100%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            />
        </div>
    );
}

/** Skeleton for the AI Score panel */
export function ScoreSkeleton() {
    return (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-4">
                <ShimmerBar className="h-5 w-5 rounded-full" />
                <ShimmerBar className="h-4 w-32" />
            </div>
            <div className="flex items-center justify-center py-6">
                <ShimmerBar className="h-32 w-32 rounded-full" />
            </div>
            <div className="space-y-2 mt-4">
                <ShimmerBar className="h-3 w-full" />
                <ShimmerBar className="h-3 w-4/5" />
                <ShimmerBar className="h-3 w-3/5" />
            </div>
        </div>
    );
}

/** Skeleton for the Bio Comparison panel */
export function BioSkeleton() {
    return (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-4">
                <ShimmerBar className="h-5 w-5 rounded-full" />
                <ShimmerBar className="h-4 w-40" />
            </div>
            <div className="space-y-3">
                <ShimmerBar className="h-16 w-full rounded-xl" />
                <ShimmerBar className="h-4 w-20" />
                <ShimmerBar className="h-16 w-full rounded-xl" />
            </div>
        </div>
    );
}

/** Skeleton for a chart panel */
export function ChartSkeleton() {
    return (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-4">
                <ShimmerBar className="h-5 w-5 rounded-full" />
                <ShimmerBar className="h-4 w-36" />
            </div>
            <div className="flex items-end gap-2 h-40 pt-4">
                {[60, 80, 45, 70, 55, 90, 65].map((h, i) => (
                    <ShimmerBar key={i} className="flex-1" style={{ height: `${h}%` }} />
                ))}
            </div>
        </div>
    );
}

/** Skeleton for the action items list */
export function ActionsSkeleton() {
    return (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-4">
                <ShimmerBar className="h-5 w-5 rounded-full" />
                <ShimmerBar className="h-4 w-32" />
            </div>
            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                        <ShimmerBar className="h-5 w-5 rounded flex-shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1.5">
                            <ShimmerBar className="h-3.5 w-3/4" />
                            <ShimmerBar className="h-3 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Skeleton for the summary block */
export function SummarySkeleton() {
    return (
        <div className="rounded-2xl border border-violet-500/10 bg-violet-500/5 p-5">
            <div className="space-y-2">
                <ShimmerBar className="h-3.5 w-full" />
                <ShimmerBar className="h-3.5 w-5/6" />
                <ShimmerBar className="h-3.5 w-4/6" />
            </div>
        </div>
    );
}

/** Full AI analysis skeleton grid — used while streaming */
export default function AnalysisSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <SummarySkeleton />
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <ScoreSkeleton />
                <BioSkeleton />
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>
            <div className="mt-6">
                <ActionsSkeleton />
            </div>
        </motion.div>
    );
}
