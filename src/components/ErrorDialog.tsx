"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Search, Ghost } from "lucide-react";

interface ErrorDialogProps {
    username: string;
    type?: "not_found" | "rate_limit" | "generic";
    message?: string;
    resetTimestamp?: number;
}

export default function ErrorDialog({
    username,
    type = "not_found",
    message,
    resetTimestamp,
}: ErrorDialogProps) {
    const router = useRouter();

    const title =
        type === "not_found"
            ? "User Not Found"
            : type === "rate_limit"
                ? "Rate Limit Exceeded"
                : "Something Went Wrong";

    const description =
        type === "not_found"
            ? `We couldn't find a GitHub profile for "${username}". Please check the spelling or try a different URL.`
            : type === "rate_limit"
                ? `GitHub API rate limit exceeded.${resetTimestamp
                    ? ` Resets at ${new Date(resetTimestamp * 1000).toLocaleTimeString()}.`
                    : " Please try again in a few minutes."
                }`
                : message || "An unexpected error occurred while analyzing this profile.";

    const iconColor =
        type === "not_found"
            ? "text-amber-400"
            : type === "rate_limit"
                ? "text-orange-400"
                : "text-red-400";

    const iconBg =
        type === "not_found"
            ? "bg-amber-500/10"
            : type === "rate_limit"
                ? "bg-orange-500/10"
                : "bg-red-500/10";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => router.push("/")}
                />

                {/* Dialog */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gray-900/95 shadow-2xl shadow-black/40"
                >
                    {/* Glow accent */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

                    <div className="p-8 text-center">
                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                            className="mb-5 flex justify-center"
                        >
                            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${iconBg}`}>
                                {type === "not_found" ? (
                                    <Ghost className={`h-8 w-8 ${iconColor}`} />
                                ) : (
                                    <AlertTriangle className={`h-8 w-8 ${iconColor}`} />
                                )}
                            </div>
                        </motion.div>

                        {/* Title */}
                        <h2 className="mb-2 text-xl font-bold text-white">{title}</h2>

                        {/* Description */}
                        <p className="mb-8 text-sm leading-relaxed text-gray-400">
                            {description}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <button
                                onClick={() => router.push("/")}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-violet-500/25"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Return to Search
                            </button>
                            {type === "not_found" && (
                                <button
                                    onClick={() => {
                                        router.push("/");
                                        // Small delay so the page mounts before we try to focus the input
                                        setTimeout(() => {
                                            const input = document.querySelector<HTMLInputElement>("input[type='text']");
                                            input?.focus();
                                        }, 300);
                                    }}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm text-gray-300 transition-all hover:bg-white/[0.06]"
                                >
                                    <Search className="h-4 w-4" />
                                    Try Another User
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
