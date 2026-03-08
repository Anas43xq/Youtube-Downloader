import { useState } from "react";

function DownloadIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M7 11l5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

export default function DownloadButton({ url, quality, disabled, backendUrl, startTime = 0, endTime, duration = 0, outputDir = "" }) {
  const [state, setState] = useState("idle");
  const [statusMsg, setStatusMsg] = useState("");

  async function handleDownload() {
    if (!url || disabled) return;
    setState("loading");
    setStatusMsg("Saving…");

    try {
      const params = new URLSearchParams({ url, quality });
      if (startTime > 0) params.set("startTime", startTime.toFixed(3));
      if (endTime != null && endTime < duration) params.set("endTime", endTime.toFixed(3));
      if (outputDir) params.set("outputDir", outputDir);

      const res = await fetch(`${backendUrl}/api/download?${params}`);
      const data = await res.json().catch(() => ({ error: `Server error ${res.status}` }));

      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      const name = data.filename || "video";
      const displayName = name.length > 42 ? name.substring(0, 39) + "…" : name;
      setState("success");
      setStatusMsg(`Saved: ${displayName}`);
      setTimeout(() => { setState("idle"); setStatusMsg(""); }, 5000);
    } catch (err) {
      setState("error");
      setStatusMsg(err.message);
      setTimeout(() => { setState("idle"); setStatusMsg(""); }, 5000);
    }
  }

  return (
    <>
      <button
        className={`download-btn${state === "loading" ? " downloading" : ""}`}
        onClick={handleDownload}
        disabled={disabled || state === "loading"}
      >
        {state === "loading" ? (
          <span className="spinner" />
        ) : (
          <DownloadIcon />
        )}
        {state === "loading" ? "Downloading…" : `Download ${quality}p`}
      </button>
      {statusMsg && (
        <span className={`dl-status${state === "error" ? " error" : state === "success" ? " success" : ""}`}>
          {statusMsg}
        </span>
      )}
    </>
  );
}
