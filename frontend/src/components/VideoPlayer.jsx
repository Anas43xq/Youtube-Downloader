import { useEffect, useRef, useState } from "react";

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

let ytApiLoaded = false;
let ytApiCallbacks = [];

function loadYTApi(cb) {
  if (window.YT && window.YT.Player) { cb(); return; }
  ytApiCallbacks.push(cb);
  if (!ytApiLoaded) {
    ytApiLoaded = true;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      ytApiCallbacks.forEach((fn) => fn());
      ytApiCallbacks = [];
    };
  }
}

export default function VideoPlayer({ videoId, playerRef, onTimeUpdate, onDurationChange }) {
  const containerRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const timerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!videoId) {
      setReady(false);
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
      clearInterval(timerRef.current);
      return;
    }

    const mountId = "yt-player-mount";

    function initPlayer() {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }

      const mount = document.createElement("div");
      mount.id = mountId;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(mount);
      }

      ytPlayerRef.current = new window.YT.Player(mountId, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady(e) {
            setReady(true);
            const dur = e.target.getDuration();
            onDurationChange(dur);

            if (playerRef) playerRef.current = { seekTo: (t) => e.target.seekTo(t, true) };

            clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
              if (ytPlayerRef.current?.getCurrentTime) {
                onTimeUpdate(ytPlayerRef.current.getCurrentTime());
              }
            }, 500);
          },
          onStateChange(e) {
            if (e.data === window.YT.PlayerState.ENDED) {
              clearInterval(timerRef.current);
            }
          },
        },
      });
    }

    loadYTApi(initPlayer);

    return () => clearInterval(timerRef.current);
  }, [videoId]);

  return (
    <div className="player-container">
      {!videoId && (
        <div className="player-placeholder">
          <div className="player-placeholder-icon">
            <PlayIcon />
          </div>
          <div className="player-placeholder-text">Paste a URL above to preview</div>
        </div>
      )}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
