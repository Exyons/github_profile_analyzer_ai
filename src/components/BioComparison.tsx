"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ArrowRight } from "lucide-react";

interface BioComparisonProps {
    currentBio: string | Record<string, unknown> | unknown;
    suggestedBio: string | Record<string, unknown> | unknown;
}

function toBioString(value: unknown): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.filter((v) => typeof v === "string").join(" ");
    if (typeof value === "object") {
        const obj = value as Record<string, unknown>;
        // Try common keys the AI might use
        if (typeof obj.shortDescription === "string" && typeof obj.longDescription === "string") {
            return `${obj.shortDescription} — ${obj.longDescription}`;
        }
        // Fallback: join all string values
        return Object.values(obj)
            .filter((v) => typeof v === "string")
            .join(" | ");
    }
    return String(value);
}

export default function BioComparison({ currentBio, suggestedBio }: BioComparisonProps) {
    const [copied, setCopied] = useState(false);
    const currentStr = toBioString(currentBio);
    const suggestedStr = toBioString(suggestedBio);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(suggestedStr);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
        >
            <h3 className="mb-4 text-lg font-semibold text-white">Bio Enhancement</h3>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Current */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-gray-500" />
                        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                            Current
                        </span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-400">
                        {currentStr || "No bio set"}
                    </p>
                </div>

                {/* Arrow on desktop */}
                <div className="hidden items-center justify-center md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <ArrowRight className="h-5 w-5 text-violet-400" />
                </div>

                {/* Suggested */}
                <div className="relative rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-violet-500" />
                            <span className="text-xs font-medium uppercase tracking-wider text-violet-400">
                                AI Suggested
                            </span>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-3 w-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3 w-3" />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-200">{suggestedStr}</p>
                </div>
            </div>
        </motion.div>
    );
}
