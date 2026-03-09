// --- FILE: frontend/src/services/apiService.js ---
// Pure fetch/SSE functions — no state, no hooks, no side-effects.

import { ENDPOINTS } from "../constants/api.js";
import { ERRORS }    from "../constants/errors.js";

// ─── fetchVideoInfo ───────────────────────────────────────────────────────────

/**
 * Fetch video metadata from the backend.
 *
 * @param {string} url - YouTube URL
 * @returns {Promise<import("../types/shapes.js").VideoInfo>}
 * @throws {{ code: string, message: string }}
 */
export async function fetchVideoInfo(url) {
  let res;
  try {
    res = await fetch(`${ENDPOINTS.INFO}?url=${encodeURIComponent(url)}`);
  } catch {
    throw { code: "NETWORK_FAILED", message: ERRORS.NETWORK_FAILED };
  }

  if (!res.ok) {
    let msg = ERRORS.INFO_FAILED;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch { /* ignore */ }
    throw { code: "INFO_FAILED", message: msg };
  }

  return res.json();
}

// ─── openProgressStream ───────────────────────────────────────────────────────

/**
 * Open a Server-Sent Events stream for an active download job.
 * The caller is responsible for attaching event handlers and calling .close().
 *
 * @param {{
 *   url: string,
 *   quality: string,
 *   mode: string,
 *   videoFormat: string,
 *   audioFormat: string,
 *   startTime?: number,
 *   endTime?: number|null,
 *   customFilename?: string
 * }} params
 * @returns {EventSource}
 */
export function openProgressStream(params) {
  const q = new URLSearchParams();
  q.set("url",         params.url);
  q.set("quality",     params.quality);
  q.set("mode",        params.mode);
  q.set("videoFormat", params.videoFormat);
  q.set("audioFormat", params.audioFormat);
  if (params.startTime  != null) q.set("startTime",      String(params.startTime));
  if (params.endTime    != null) q.set("endTime",        String(params.endTime));
  if (params.customFilename)     q.set("customFilename", params.customFilename);

  return new EventSource(`${ENDPOINTS.PROGRESS}?${q.toString()}`);
}

// ─── fetchFile ────────────────────────────────────────────────────────────────

/**
 * Download the completed file for a job ID.
 *
 * @param {string} jobId
 * @returns {Promise<{ blob: Blob, filename: string }>}
 * @throws {{ code: string, message: string }}
 */
export async function fetchFile(jobId) {
  let res;
  try {
    res = await fetch(`${ENDPOINTS.FILE}?jobId=${encodeURIComponent(jobId)}`);
  } catch {
    throw { code: "NETWORK_FAILED", message: ERRORS.NETWORK_FAILED };
  }

  if (!res.ok) {
    throw { code: "DOWNLOAD_FAILED", message: ERRORS.DOWNLOAD_FAILED };
  }

  const blob        = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match       = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\r\n]+)/i);
  const filename    = match ? decodeURIComponent(match[1]) : `download_${jobId}`;

  return { blob, filename };
}

// ─── openFolder ───────────────────────────────────────────────────────────────

/**
 * Ask the backend to reveal a file in Explorer / Finder.
 *
 * @param {string} filePath
 * @returns {Promise<{ success: boolean }>}
 * @throws {{ code: string, message: string }}
 */
export async function openFolder(filePath) {
  let res;
  try {
    res = await fetch(`${ENDPOINTS.OPEN}?path=${encodeURIComponent(filePath)}`);
  } catch {
    throw { code: "NETWORK_FAILED", message: ERRORS.NETWORK_FAILED };
  }

  if (!res.ok) {
    throw { code: "PERMISSION_DENIED", message: ERRORS.PERMISSION_DENIED };
  }

  return res.json();
}
