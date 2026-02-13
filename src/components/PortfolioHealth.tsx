"use client";

import { motion } from "framer-motion";
import { Gem, Trash2 } from "lucide-react";

interface PortfolioHealthProps {
    health: {
        highImpact: string[];
        clutter: string[];
    };
}

export default function PortfolioHealth({ health }: PortfolioHealthProps) {
    if (!health) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-md"
        >
            <div className="grid divide-y divide-gray-800 md:grid-cols-2 md:divide-x md:divide-y-0">
                {/* High Impact */}
                <div className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                            <Gem className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-white">High Impact</h3>
                    </div>
                    {health.highImpact.length > 0 ? (
                        <ul className="space-y-2">
                            {health.highImpact.map((repo, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    {repo}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm italic text-gray-500">No standout repositories identified yet.</p>
                    )}
                </div>

                {/* Clutter / Archive */}
                <div className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                            <Trash2 className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-white">Clutter / Archive</h3>
                    </div>
                    {health.clutter.length > 0 ? (
                        <ul className="space-y-2">
                            {health.clutter.map((repo, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500/50" />
                                    {repo}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm italic text-gray-500">Your profile looks clean! No clutter found.</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
