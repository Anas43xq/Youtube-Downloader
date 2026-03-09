// --- FILE: frontend/src/utils/resolveFilename.js ---

import { extractVideoId } from "./extractVideoId.js";
import { sanitizeFilename } from "./sanitize.js";

/**
 * Resolve a filename template string using the given metadata tokens.
 *
 * Supported tokens:
 *   {title}   — video title (sanitized)
 *   {quality} — e.g. "720p" (empty string in audio mode)
 *   {format}  — file extension, e.g. "mp4" or "mp3"
 *   {mode}    — "video" or "audio"
 *   {date}    — ISO date YYYY-MM-DD
 *   {time}    — HH-MM-SS
 *   {id}      — YouTube video ID
 *
 * Returns an empty string if template is blank (caller should fall back to
 * the default auto-generated filename).
 *
 * @param {string} template
 * @param {{ title?: string, quality?: string, format?: string, mode?: string, url?: string }} opts
 * @returns {string}
 */
export function resolveFilename(template, { title = "", quality = "", format = "", mode = "video", url = "" } = {}) {
  if (!template || !template.trim()) return "";

  const now = new Date();
  const date = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const time = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("-");

  const id = extractVideoId(url) ?? "";
  const qualityToken = mode === "audio" ? "" : `${quality}p`;
  const safeTitle = sanitizeFilename(title).substring(0, 80);

  let result = template
    .replace(/\{title\}/g, safeTitle)
    .replace(/\{quality\}/g, qualityToken)
    .replace(/\{format\}/g, format)
    .replace(/\{mode\}/g, mode)
    .replace(/\{date\}/g, date)
    .replace(/\{time\}/g, time)
    .replace(/\{id\}/g, id);

  // Collapse consecutive underscores/dots that empty tokens leave behind
  result = result.replace(/_{2,}/g, "_").replace(/\.{2,}/g, ".");
  // Trim leading/trailing underscores or dots
  result = result.replace(/^[_.]|[_.]$/g, "");
  // Hard cap
  return result.substring(0, 200);
}

/**
 * Default template placeholder text for the given mode.
 * @param {string} mode
 * @returns {string}
 */
export function defaultTemplate(mode) {
  return mode === "audio" ? "{title}_audio.{format}" : "{title}_{quality}.{format}";
}
