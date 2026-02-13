/**
 * Parse a GitHub input string — handles raw usernames, full URLs, and edge cases.
 *
 * @returns { username, error } — `username` is the cleaned string if valid,
 *          `error` is a user-facing message if the input is invalid.
 */

const GITHUB_URL_RE =
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s?#]+)\/?(?:[?#].*)?$/i;

const NON_GITHUB_URL_RE =
    /^(?:https?:\/\/)/i;

export function parseGitHubInput(raw: string): { username: string | null; error: string | null } {
    const input = raw.trim();

    if (!input) {
        return { username: null, error: null };
    }

    // Try matching a GitHub URL first
    const match = input.match(GITHUB_URL_RE);
    if (match) {
        const extracted = match[1].replace(/^\/+|\/+$/g, "").trim();
        if (!extracted) {
            return { username: null, error: "Could not extract a username from that URL." };
        }
        return validateUsername(extracted);
    }

    // If it looks like a URL but isn't GitHub
    if (NON_GITHUB_URL_RE.test(input) || input.includes(".com/") || input.includes(".org/")) {
        return { username: null, error: "Please provide a valid GitHub profile URL." };
    }

    // Raw username — sanitize
    const sanitized = input.replace(/^\/+|\/+$/g, "").replace(/\s+/g, "").trim();

    if (!sanitized || sanitized.includes("/")) {
        return { username: null, error: "That doesn't look like a valid GitHub username." };
    }

    return validateUsername(sanitized);
}

/** Validate a GitHub username against GitHub's actual rules */
const GITHUB_USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

function validateUsername(username: string): { username: string | null; error: string | null } {
    if (username.length > 39) {
        return { username: null, error: "GitHub usernames cannot exceed 39 characters." };
    }
    if (username.startsWith("-") || username.endsWith("-")) {
        return { username: null, error: "GitHub usernames cannot start or end with a hyphen." };
    }
    if (username.includes("--")) {
        return { username: null, error: "GitHub usernames cannot contain consecutive hyphens." };
    }
    if (!GITHUB_USERNAME_RE.test(username)) {
        return { username: null, error: "GitHub usernames can only contain letters, numbers, and single hyphens." };
    }
    return { username, error: null };
}
