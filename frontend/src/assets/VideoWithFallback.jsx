import React, { useRef, useState, useEffect } from "react";

const VideoWithFallback = ({
  src,
  poster,
  style = {},
  ariaLabel = "video",
  className = "",
}) => {
  const ref = useRef(null);
  const [error, setError] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const handleCanPlay = async () => {
    try {
      await ref.current.play();
    } catch {
      // Autoplay blocked by browser, show play button
      setAutoplayBlocked(true);
      console.warn(
        "Video autoplay blocked, awaiting user interaction to play.",
      );
    }
  };

  const handleError = () => {
    console.error("Failed to load video:", src);
    setError(true);
  };

  const handlePlayClick = async () => {
    try {
      await ref.current.play();
      setAutoplayBlocked(false);
    } catch (err) {
      console.error("Play failed:", err);
    }
  };

  useEffect(() => {
    // Do a quick HEAD fetch to surface a network error early in DevTools if file missing
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(src, { method: "HEAD" });
        if (!cancelled && !res.ok) {
          console.error("Video HEAD check failed with status", res.status);
          setError(true);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Video HEAD fetch error", e);
          setError(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (error) {
    // Fallback to poster image
    return (
      <img
        src={poster}
        alt="video fallback"
        style={style}
        className={className}
      />
    );
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <video
        ref={ref}
        src={src}
        aria-label={ariaLabel}
        style={style}
        muted
        loop
        playsInline
        preload="auto"
        poster={poster}
        onCanPlay={handleCanPlay}
        onError={handleError}
      />

      {autoplayBlocked && (
        <button
          onClick={handlePlayClick}
          aria-label="Play video"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0,0,0,0.6)",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Play
        </button>
      )}
    </div>
  );
};

export default VideoWithFallback;
