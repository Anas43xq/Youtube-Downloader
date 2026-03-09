// --- FILE: frontend/src/utils/extractVideoId.js ---

/**
 * Extract the YouTube video ID from a URL.
 * Handles:
 *   - https://www.youtube.com/watch?v=XXXXXXXXXXX
 *   - https://youtu.be/XXXXXXXXXXX
 *   - https://www.youtube.com/shorts/XXXXXXXXXXX
 *
 * @param {string} url
 * @returns {string|null} video ID, or null if not detected
 */
export function extractVideoId(url) {
  try {
    const u = new URL(url);

    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1).split("?")[0];
      return id || null;
    }

    const shortsMatch = u.pathname.match(/^\/shorts\/([^/?]+)/);
    if (shortsMatch) return shortsMatch[1];

    return u.searchParams.get("v") || null;
  } catch {
    return null;
  }
}
