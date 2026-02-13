"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  Brain,
  FileDown,
  ArrowRight,
  Github,
  User,
  AlertCircle,
} from "lucide-react";
import { parseGitHubInput } from "@/lib/utils";

const features = [
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "AI-Powered Analysis",
    description:
      "Get an expert evaluation of your GitHub presence, including a Hiring Score and personalized improvement suggestions.",
    gradient: "from-violet-500 to-purple-600",
    href: "/features#analysis",
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: "Secured Enterprise AI",
    description:
      "Powered by a private, secured Ollama instance running Llama 3. No external API keys required.",
    gradient: "from-cyan-500 to-blue-600",
    href: "/features#security",
  },
  {
    icon: <FileDown className="h-6 w-6" />,
    title: "PDF Export",
    description:
      "Download a comprehensive Profile Audit Report as a polished PDF to share with recruiters or use for self-improvement.",
    gradient: "from-emerald-500 to-teal-600",
    href: "/features#export",
  },
];

export default function HomePage() {
  const [input, setInput] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  // Live-parse the input to detect usernames from URLs
  const parsed = useMemo(() => parseGitHubInput(input), [input]);
  const isUrl = input.includes("github.com/");
  const detectedUsername = isUrl && parsed.username ? parsed.username : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const { username, error } = parseGitHubInput(input);

    if (error) {
      setSubmitError(error);
      toast.error(error, { duration: 4000 });
      return;
    }

    if (username) {
      router.push(`/user/${username}`);
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (submitError) setSubmitError(null);
  };

  return (
    <div className="flex min-h-[calc(100vh-130px)] flex-col items-center justify-center px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-4xl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered GitHub Portfolio Analysis
          </div>

          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Elevate Your{" "}
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              GitHub Profile
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-base text-gray-400 sm:text-lg">
            Get an AI-generated Hiring Score, personalized bio suggestions, README critiques,
            and a step-by-step action plan to make your profile stand out to recruiters.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="mx-auto max-w-xl">
            <div className="group relative">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-violet-500/20 opacity-0 blur transition-opacity group-focus-within:opacity-100" />
              <div className="relative flex items-center rounded-2xl border border-white/10 bg-white/[0.03] transition-colors focus-within:border-violet-500/30">
                <Github className="ml-4 h-5 w-5 flex-shrink-0 text-gray-500" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Enter a GitHub username or paste a profile URL..."
                  className="min-w-0 flex-1 bg-transparent px-4 py-4 text-white placeholder-gray-500 outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="mr-2 flex flex-shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-30 disabled:hover:shadow-none"
                >
                  <Search className="h-4 w-4" />
                  Analyze
                </button>
              </div>
            </div>

            {/* Username detected badge */}
            <AnimatePresence>
              {detectedUsername && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-2.5 flex items-center justify-center gap-1.5"
                >
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    <User className="h-3 w-3" />
                    Username detected: <span className="text-white">{detectedUsername}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-red-400"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  {submitError}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p className="mt-3 text-xs text-gray-500">
            Try: <button onClick={() => { setInput("torvalds"); setSubmitError(null); }} className="text-gray-400 hover:text-white transition-colors">torvalds</button>
            {" • "}
            <button onClick={() => { setInput("gaearon"); setSubmitError(null); }} className="text-gray-400 hover:text-white transition-colors">gaearon</button>
            {" • "}
            <button onClick={() => { setInput("sindresorhus"); setSubmitError(null); }} className="text-gray-400 hover:text-white transition-colors">sindresorhus</button>
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-20 grid gap-6 sm:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.15 }}
              className="glass-card feature-glow p-6"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white`}
              >
                {feature.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-gray-400">{feature.description}</p>
              <Link href={feature.href} className="mt-4 flex items-center gap-1 text-xs font-medium text-violet-400 transition-colors hover:text-violet-300">
                Learn more <ArrowRight className="h-3 w-3" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
