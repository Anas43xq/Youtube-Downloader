// --- FILE: frontend/src/hooks/useDownloadHistory.js ---

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "ytdl_history";
const MAX_ENTRIES = 100;

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function persist(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage quota exceeded — silently skip
  }
}

export default function useDownloadHistory() {
  const [history, setHistory] = useState(load);

  // Persist on every change
  useEffect(() => {
    persist(history);
  }, [history]);

  // ── addEntry ───────────────────────────────────────────────────────────────
  const addEntry = useCallback((entry) => {
    setHistory((prev) => [entry, ...prev].slice(0, MAX_ENTRIES));
  }, []);

  // ── removeEntry ────────────────────────────────────────────────────────────
  const removeEntry = useCallback((id) => {
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ── clearHistory ───────────────────────────────────────────────────────────
  const clearHistory = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  // ── reDownload ─────────────────────────────────────────────────────────────
  /**
   * Re-enqueue a history entry via the provided addToQueue function.
   * Passes a minimal videoInfo object so addToQueue can display the title.
   *
   * @param {import("../types/shapes.js").HistoryItem} item
   * @param {Function} addToQueue
   */
  const reDownload = useCallback((item, addToQueue) => {
    const videoInfo = {
      title:            item.title,
      thumbnail:        null,
      duration:         null,
      durationSeconds:  0,
      availableQualities: [],
      isShort:          false,
    };
    addToQueue(videoInfo, item.url, {
      quality:          item.quality,
      mode:             item.mode,
      // History stores format as a single field; derive video/audio split from mode
      videoFormat:      item.videoFormat || (item.mode === "audio" ? "mp4" : (item.format || "mp4")),
      audioFormat:      item.audioFormat || (item.mode === "audio" ? (item.format || "mp3") : "mp3"),
      startTime:        0,
      endTime:          null,
      fileDuration:     0,
      outputDir:        "",
      filenameTemplate: "",
    });
  }, []);

  return { history, addEntry, removeEntry, clearHistory, reDownload };
}
