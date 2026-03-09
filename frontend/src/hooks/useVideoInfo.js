// --- FILE: frontend/src/hooks/useVideoInfo.js ---

import { useState, useCallback } from "react";
import { extractVideoId } from "../utils/extractVideoId.js";
import { fetchVideoInfo } from "../services/apiService.js";
import { ERRORS } from "../constants/errors.js";

/**
 * @returns {{ videoInfo: import("../types/shapes.js").VideoInfo|null,
 *             status: "idle"|"loading"|"error"|"ok",
 *             errorMsg: string|null,
 *             loadVideo: (url: string) => Promise<void> }}
 */
export default function useVideoInfo() {
  const [videoInfo, setVideoInfo] = useState(null);
  /** @type {"idle"|"loading"|"error"|"ok"} */
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState(null);

  const loadVideo = useCallback(async (url) => {
    const trimmed = (url || "").trim();

    if (!extractVideoId(trimmed)) {
      setStatus("error");
      setErrorMsg(ERRORS.INVALID_URL);
      return;
    }

    setStatus("loading");
    setErrorMsg(null);
    setVideoInfo(null);

    try {
      const info = await fetchVideoInfo(trimmed);
      setVideoInfo(info);
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || ERRORS.INFO_FAILED);
    }
  }, []);

  return { videoInfo, status, errorMsg, loadVideo };
}
