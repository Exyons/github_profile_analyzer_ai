"use client";

import { motion } from "framer-motion";
import { Map, CheckCircle2 } from "lucide-react";

interface RecruiterRoadmapProps {
    roadmap: {
        step: number;
        title: string;
        description: string;
    }[];
}

export default function RecruiterRoadmap({ roadmap }: RecruiterRoadmapProps) {
    if (!roadmap || roadmap.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-gray-800 p-6"
        >
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Map className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">Roadmap to Recruiter-Ready</h3>
            </div>

            <div className="relative space-y-8 pl-2">
                {/* Vertical Line */}
                <div className="absolute left-[15px] top-3 h-[calc(100%-20px)] w-0.5 bg-gray-700" />

                {roadmap.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                        <div className="relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500 ring-4 ring-gray-900">
                            <span className="text-xs font-bold text-white">{step.step}</span>
                        </div>
                        <div className="pt-0.5">
                            <h4 className="font-semibold text-white">{step.title}</h4>
                            <p className="mt-1 text-sm text-gray-400">{step.description}</p>
                        </div>
                    </div>
                ))}

                <div className="relative flex items-center gap-4 pt-2 opacity-50">
                    <div className="relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 ring-4 ring-gray-900">
                        <CheckCircle2 className="h-4 w-4 text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">Hired!</span>
                </div>
            </div>
        </motion.div>
    );
}
