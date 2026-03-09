// --- FILE: frontend/src/hooks/useDownloadQueue.js ---

import { useState, useRef, useCallback } from "react";
import { resolveFilename } from "../utils/resolveFilename.js";
import { openProgressStream, fetchFile } from "../services/apiService.js";
import { ERRORS } from "../constants/errors.js";

/**
 * @param {{ onItemComplete?: (item: import("../types/shapes.js").QueueItem) => void }} opts
 */
export default function useDownloadQueue({ onItemComplete } = {}) {
  // queueRef mirrors queue state so async callbacks always see the latest snapshot.
  const [queue, setQueueState] = useState([]);
  const queueRef  = useRef([]);
  const [isRunning, setIsRunning] = useState(false);
  const runningRef  = useRef(false);
  const esRefs      = useRef({}); // id → EventSource
  const resolveRefs = useRef({}); // id → Promise resolve fn

  const setQueue = useCallback((updater) => {
    setQueueState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      queueRef.current = next;
      return next;
    });
  }, []);

  const updateItem = useCallback(
    (id, patch) => {
      setQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
      );
    },
    [setQueue]
  );

  // ── Public: add a new queued item ──────────────────────────────────────────
  /**
   * @param {import("../types/shapes.js").VideoInfo|null} videoInfo
   * @param {string} url
   * @param {{ quality?, mode?, videoFormat?, audioFormat?,
   *           startTime?, endTime?, fileDuration?,
   *           outputDir?, filenameTemplate? }} settings
   */
  const addToQueue = useCallback(
    (videoInfo, url, settings = {}) => {
      const {
        quality        = "720",
        mode           = "video",
        videoFormat    = "mp4",
        audioFormat    = "mp3",
        startTime      = 0,
        endTime        = null,
        fileDuration   = 0,
        outputDir      = "",
        filenameTemplate = "",
      } = settings;

      const customFilename = filenameTemplate.trim()
        ? resolveFilename(filenameTemplate, {
            title:  videoInfo?.title || "",
            quality,
            format: mode === "audio" ? audioFormat : videoFormat,
            mode,
            url,
          })
        : "";

      const item = {
        id:             crypto.randomUUID(),
        url,
        title:          videoInfo?.title || url,
        duration:       videoInfo?.duration || null,
        thumbnail:      videoInfo?.thumbnail || null,
        quality,
        mode,
        videoFormat,
        audioFormat,
        startTime:      startTime || 0,
        endTime:        endTime ?? null,
        fileDuration:   fileDuration || 0,
        outputDir:      outputDir || "",
        customFilename,
        status:         "queued",
        progress:       0,
        speed:          null,
        eta:            null,
        filesize:       null,
        filePath:       null,
        jobId:          null,
        error:          null,
        addedAt:        Date.now(),
      };

      setQueue((prev) => [...prev, item]);
    },
    [setQueue]
  );

  // ── Public: remove an item (closes in-flight EventSource) ─────────────────
  const removeFromQueue = useCallback(
    (id) => {
      const es = esRefs.current[id];
      if (es) { es.close(); delete esRefs.current[id]; }

      // Resolve any pending Promise so the sequential loop is unblocked.
      const resolve = resolveRefs.current[id];
      if (resolve) { delete resolveRefs.current[id]; resolve(); }

      setQueue((prev) => prev.filter((item) => item.id !== id));
    },
    [setQueue]
  );

  // ── Public: clear all finished items ──────────────────────────────────────
  const clearDone = useCallback(() => {
    setQueue((prev) => prev.filter((item) => item.status !== "done"));
  }, [setQueue]);

  // ── Internal: download a single item via SSE ───────────────────────────────
  const downloadItem = useCallback(
    (id) => {
      const item = queueRef.current.find((i) => i.id === id);
      if (!item) return Promise.resolve();

      updateItem(id, { status: "downloading", progress: 0, error: null });

      return new Promise((resolve) => {
        resolveRefs.current[id] = resolve;

        const es = openProgressStream({
          url:            item.url,
          quality:        item.quality,
          mode:           item.mode,
          videoFormat:    item.videoFormat,
          audioFormat:    item.audioFormat,
          startTime:      item.startTime,
          endTime:        item.endTime,
          customFilename: item.customFilename,
        });

        esRefs.current[id] = es;

        // Close ES and resolve the Promise exactly once.
        const finish = () => {
          es.close();
          delete esRefs.current[id];
          const res = resolveRefs.current[id];
          if (res) { delete resolveRefs.current[id]; res(); }
        };

        // ── Progress ────────────────────────────────────────────────────────
        es.addEventListener("progress", (e) => {
          try {
            const { percent, speed, eta, filesize } = JSON.parse(e.data);
            updateItem(id, {
              progress: parseFloat(percent) || 0,
              speed,
              eta,
              filesize,
            });
          } catch { /* ignore malformed frame */ }
        });

        // ── Merging ─────────────────────────────────────────────────────────
        es.addEventListener("merging", () => {
          updateItem(id, { status: "merging" });
        });

        // ── Complete ────────────────────────────────────────────────────────
        es.addEventListener("complete", async (e) => {
          let data = {};
          try { data = JSON.parse(e.data); } catch {}
          const { jobId, filePath, filename: serverFilename } = data;

          try {
            const { blob, filename } = await fetchFile(jobId);

            // Trigger browser save dialog
            const objUrl = URL.createObjectURL(blob);
            const a      = document.createElement("a");
            a.href       = objUrl;
            a.download   = filename || serverFilename || "download";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(objUrl);

            updateItem(id, { status: "done", progress: 100, filePath, filename });

            if (typeof onItemComplete === "function") {
              const latest = queueRef.current.find((i) => i.id === id);
              onItemComplete({ ...latest, status: "done", filePath, filename });
            }
          } catch (err) {
            updateItem(id, { status: "error", error: err.message || ERRORS.DOWNLOAD_FAILED });
          }

          finish();
        });

        // ── Server-sent failure ─────────────────────────────────────────────
        // Server sends:  event: fail\ndata: {"message":"..."}\n\n
        es.addEventListener("fail", (e) => {
          let msg = ERRORS.DOWNLOAD_FAILED;
          try { msg = JSON.parse(e.data).message || msg; } catch {}
          updateItem(id, { status: "error", error: msg });
          finish();
        });

        // ── Network / connection error ──────────────────────────────────────
        es.onerror = () => {
          if (!esRefs.current[id]) return; // already handled in finish()
          updateItem(id, { status: "error", error: "Connection to server lost" });
          finish();
        };
      });
    },
    [updateItem, onItemComplete]
  );

  // ── Public: run all queued items sequentially ──────────────────────────────
  const downloadAll = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setIsRunning(true);

    // Snapshot queued IDs now; items added mid-run require a second click.
    const ids = queueRef.current
      .filter((i) => i.status === "queued")
      .map((i) => i.id);

    for (const id of ids) {
      const current = queueRef.current.find((i) => i.id === id);
      if (!current || current.status !== "queued") continue;
      await downloadItem(id);
    }

    runningRef.current = false;
    setIsRunning(false);
  }, [downloadItem]);

  return { queue, isRunning, addToQueue, removeFromQueue, clearDone, downloadAll };
}
