import { NextRequest, NextResponse } from "next/server";
import { aggregateGitHubData } from "@/lib/github";
import { generateAnalysis, generateRoadmap } from "@/lib/ai-provider";
import { UserNotFoundError, RateLimitError } from "@/lib/types";
import { analysisCache, buildCacheKey } from "@/lib/cache";

// Extend server timeout for AI calls
export const maxDuration = 300; // Increased to 300s for local LLMs

export async function POST(request: NextRequest) {
    try {
        const text = await request.text();
        if (!text) {
            return NextResponse.json({ error: "Empty request body" }, { status: 400 });
        }
        const body = JSON.parse(text);

        const { username, forceRefresh, stream: useStream } = body as {
            username: string;
            forceRefresh?: boolean;
            stream?: boolean;
        };

        // Validate inputs
        if (!username || typeof username !== "string") {
            return NextResponse.json(
                { error: "Username is required" },
                { status: 400 }
            );
        }

        // ── Streaming path ──────────────────────────────────────────────
        if (useStream) {
            return handleStreamingRequest(username, forceRefresh);
        }

        // ── Non-streaming path (legacy/fallback) ────────────────────────
        return handleClassicRequest(username, forceRefresh);
    } catch (error: unknown) {
        return handleError(error);
    }
}

// ─── SSE Streaming Handler ──────────────────────────────────────────────────

function handleStreamingRequest(
    username: string,
    forceRefresh?: boolean
) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const send = (event: string, data: unknown) => {
                try {
                    controller.enqueue(
                        encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
                    );
                } catch {
                    // Ignore enqueue errors if stream is closed
                }
            };

            try {
                // Phase 1: Fetch GitHub data
                send("status", { step: "github", message: "Fetching GitHub data..." });
                const githubData = await aggregateGitHubData(username);

                const basePayload = {
                    user: githubData.user,
                    topRepos: githubData.topRepos,
                    forkedRepos: githubData.forkedRepos,
                    languageStats: githubData.languageStats,
                    totalStars: githubData.totalStars,
                    totalForks: githubData.totalForks,
                    pullRequests: githubData.pullRequests,
                    prStats: githubData.prStats,
                };

                // Send GitHub data immediately — UI can show profile now
                send("github_data", basePayload);

                // Check cache
                const cacheKey = buildCacheKey(username, githubData.user.updated_at);
                if (!forceRefresh) {
                    const cached = analysisCache.get(cacheKey);
                    if (cached) {
                        send("complete", { ...cached, cached: true });
                        controller.close();
                        return;
                    }
                }

                // Growth mode
                if (githubData.topRepos.length === 0 && githubData.prStats.total > 0) {
                    send("status", { step: "ai", message: "Generating growth roadmap..." });
                    let roadmap = null;
                    try {
                        roadmap = await generateRoadmap(githubData);
                    } catch { /* best-effort */ }

                    const response = { mode: "growth" as const, githubData: basePayload, roadmap };
                    analysisCache.set(cacheKey, response);
                    send("complete", response);
                    controller.close();
                    return;
                }

                // Insufficient data
                if (
                    githubData.user.public_repos === 0 &&
                    githubData.topRepos.length === 0 &&
                    githubData.prStats.total === 0
                ) {
                    send("error", { error: "insufficient_data", githubData: basePayload });
                    controller.close();
                    return;
                }

                // Phase 2: AI Analysis
                send("status", { step: "ai", message: "AI is analyzing your profile..." });
                const lowData = githubData.readmes.length === 0;

                // Call Secured Ollama
                const analysis = await generateAnalysis(githubData);

                // Post-AI guardrail
                if (
                    analysis &&
                    typeof analysis === "object" &&
                    "error" in analysis &&
                    (analysis as Record<string, unknown>).error === "insufficient_data"
                ) {
                    send("error", { error: "insufficient_data", githubData: basePayload });
                    controller.close();
                    return;
                }

                const response = {
                    mode: "full" as const,
                    githubData: basePayload,
                    analysis,
                    lowData,
                };

                analysisCache.set(cacheKey, response);
                send("complete", response);
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "An unexpected error occurred";

                if (error instanceof UserNotFoundError) {
                    send("error", { error: message, status: 404 });
                } else if (error instanceof RateLimitError) {
                    send("error", { error: message, status: 429, resetTimestamp: error.resetTimestamp });
                } else {
                    console.error("Analysis stream error:", error);
                    send("error", { error: message, status: 500 });
                }
            } finally {
                try {
                    controller.close();
                } catch { /* ignore if already closed */ }
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}

// ─── Classic (non-streaming) Handler ────────────────────────────────────────

async function handleClassicRequest(
    username: string,
    forceRefresh?: boolean
) {
    const githubData = await aggregateGitHubData(username);

    const baseGithubPayload = {
        user: githubData.user,
        topRepos: githubData.topRepos,
        forkedRepos: githubData.forkedRepos,
        languageStats: githubData.languageStats,
        totalStars: githubData.totalStars,
        totalForks: githubData.totalForks,
        pullRequests: githubData.pullRequests,
        prStats: githubData.prStats,
    };

    const cacheKey = buildCacheKey(username, githubData.user.updated_at);
    if (!forceRefresh) {
        const cached = analysisCache.get(cacheKey);
        if (cached) {
            return NextResponse.json({ ...cached, cached: true });
        }
    }

    if (githubData.topRepos.length === 0 && githubData.prStats.total > 0) {
        let roadmap = null;
        try {
            roadmap = await generateRoadmap(githubData);
        } catch { /* best-effort */ }

        const response = { mode: "growth" as const, githubData: baseGithubPayload, roadmap };
        analysisCache.set(cacheKey, response);
        return NextResponse.json(response);
    }

    if (
        githubData.user.public_repos === 0 &&
        githubData.topRepos.length === 0 &&
        githubData.prStats.total === 0
    ) {
        return NextResponse.json(
            { error: "insufficient_data", githubData: baseGithubPayload },
            { status: 422 }
        );
    }

    const lowData = githubData.readmes.length === 0;
    const analysis = await generateAnalysis(githubData);

    if (
        analysis &&
        typeof analysis === "object" &&
        "error" in analysis &&
        (analysis as Record<string, unknown>).error === "insufficient_data"
    ) {
        return NextResponse.json(
            { error: "insufficient_data", githubData: baseGithubPayload },
            { status: 422 }
        );
    }

    const response = {
        mode: "full" as const,
        githubData: baseGithubPayload,
        analysis,
        lowData,
    };

    analysisCache.set(cacheKey, response);
    return NextResponse.json(response);
}

// ─── Error Handler ──────────────────────────────────────────────────────────

function handleError(error: unknown) {
    if (error instanceof UserNotFoundError) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof RateLimitError) {
        return NextResponse.json(
            { error: error.message, resetTimestamp: error.resetTimestamp },
            { status: 429 }
        );
    }

    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Analysis error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
}
