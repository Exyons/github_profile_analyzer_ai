"use client";

import { Github, Zap } from "lucide-react";
import Link from "next/link";

export default function Header() {
    return (
        <header className="glass sticky top-0 z-40">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 transition-transform group-hover:scale-110">
                        <Zap className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">
                        Profile<span className="text-violet-400">AI</span>
                    </span>
                </Link>

                <div className="flex items-center gap-2">
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                    >
                        <Github className="h-5 w-5" />
                    </a>
                </div>
            </div>
        </header>
    );
}

