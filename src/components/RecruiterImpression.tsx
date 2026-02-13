"use client";

import { motion } from "framer-motion";
import { Eye } from "lucide-react";

interface RecruiterImpressionProps {
    headline: string;
}

export default function RecruiterImpression({ headline }: RecruiterImpressionProps) {
    if (!headline) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 backdrop-blur-sm"
        >
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Eye className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="mb-2 text-lg font-semibold text-white">The First 5 Seconds</h3>
                    <p className="text-sm leading-relaxed text-blue-100/80">
                        {headline}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
