/**
 * Data Compression Pipeline — minimizes token usage before AI calls.
 *
 * Strips HTML, removes boilerplate README sections, truncates content,
 * and filters null/undefined/empty fields from any object.
 */

// ─── README Content Stripper ────────────────────────────────────────────────

/** Remove HTML tags, comments, boilerplate sections, then truncate */
export function stripReadme(raw: string, maxChars = 800): string {
    let text = raw;

    // Remove HTML comments
    text = text.replace(/<!--[\s\S]*?-->/g, "");

    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, "");

    // Remove common boilerplate sections (License, Contributors, Images/badges)
    text = text.replace(
        /^#+\s*(License|Licen[cs]e|Contributors?|Contributing|Acknowledgements?|Authors?)[\s\S]*?(?=^#+\s|\z)/gim,
        ""
    );

    // Remove badge images ![...](...)
    text = text.replace(/!\[.*?\]\(.*?\)/g, "");

    // Remove consecutive blank lines
    text = text.replace(/\n{3,}/g, "\n\n");

    // Trim and truncate
    text = text.trim();
    if (text.length > maxChars) {
        text = text.slice(0, maxChars).replace(/\s+\S*$/, "") + "…";
    }

    return text;
}

// ─── Empty Field Filter ─────────────────────────────────────────────────────

/** Recursively strip null, undefined, empty string, and empty array fields */
export function stripEmpty<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
        return obj.map(stripEmpty).filter((v) => v !== null && v !== undefined) as unknown as T;
    }

    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        if (value === null || value === undefined) continue;
        if (typeof value === "string" && value.trim() === "") continue;
        if (Array.isArray(value) && value.length === 0) continue;

        const inner = typeof value === "object" ? stripEmpty(value) : value;
        cleaned[key] = inner;
    }

    return cleaned as T;
}

// ─── Compact Repo Line Builder ──────────────────────────────────────────────

interface MinRepo {
    n: string;
    d?: string;
    s: number;
    f: number;
    l?: string;
    t?: string[];
    lic?: boolean;
    url: string;
}

/** Convert full repo objects to compact markdown list lines */
export function reposToCompactList(
    repos: Array<{
        name: string;
        description?: string | null;
        stargazers_count: number;
        forks_count: number;
        language?: string | null;
        topics?: string[];
        license?: unknown;
        html_url: string;
    }>
): string {
    return repos
        .map((r) => {
            const parts: string[] = [`- ${r.name}`];
            if (r.description) parts.push(`: ${r.description}`);
            const meta: string[] = [];
            if (r.stargazers_count > 0) meta.push(`★${r.stargazers_count}`);
            if (r.language) meta.push(`Lang:${r.language}`);
            if (r.forks_count > 0) meta.push(`Forks:${r.forks_count}`);
            if (r.license) meta.push("Licensed");
            if (r.topics && r.topics.length > 0) meta.push(`[${r.topics.join(",")}]`);
            if (meta.length > 0) parts.push(` (${meta.join(", ")})`);
            return parts.join("");
        })
        .join("\n");
}

/** Convert PR list to compact lines */
export function prsToCompactList(
    prs: Array<{
        title: string;
        repoFullName: string;
        merged: boolean;
        repoStars: number;
    }>
): string {
    return prs
        .map((pr) => {
            const status = pr.merged ? "✓merged" : "open";
            return `- ${pr.title} → ${pr.repoFullName} (${status}, ★${pr.repoStars})`;
        })
        .join("\n");
}

/** Convert commits to compact lines */
export function commitsToCompactList(
    commits: Array<{ repoName: string; message: string; date: string }>
): string {
    return commits
        .map((c) => `- [${c.date.slice(0, 10)}] ${c.repoName}: ${c.message.slice(0, 80)}`)
        .join("\n");
}
