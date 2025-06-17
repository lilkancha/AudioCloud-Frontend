
import React, { useContext, useState, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import { PlayerContext } from "../context/PlayerContext";

const Player = () => {
  const {
    track,
    seekBar,
    seekBg,
    playStatus,
    play,
    pause,
    time,
    previous,
    next,
    seekSong,
    volume,
    toggleMute,
    scrollVolume,
    setVol,
  } = useContext(PlayerContext);

  // State for expanded overlay
  const [isExpanded, setIsExpanded] = useState(false);
  const overlayRef = useRef(null);

  if (!track) return null;

  // Global Space toggles play/pause when focus not in input/select/textarea/button
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        const tag = document.activeElement?.tagName;
        if (
          tag !== "INPUT" &&
          tag !== "TEXTAREA" &&
          tag !== "SELECT" &&
          tag !== "BUTTON"
        ) {
          e.preventDefault();
          if (playStatus) pause();
          else play();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playStatus, play, pause]);

  // Close overlay on Escape
  useEffect(() => {
    if (!isExpanded) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isExpanded]);

  // Close overlay on click outside
  useEffect(() => {
    if (!isExpanded) return;
    const handleClickOutside = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  // Volume wheel handler
  const onWheelVolume = (e) => {
    e.preventDefault();
    scrollVolume(e.deltaY);
  };

  // Volume slider change
  const onSliderChange = (e) => {
    const v = Number(e.target.value) / 100;
    setVol(v);
  };

  // Compute seek percentage
  const getSeekPercent = () => {
    const curSec = time.currentTime.minute * 60 + time.currentTime.second;
    const totSec = time.totalTime.minute * 60 + time.totalTime.second;
    if (!totSec) return 0;
    return (curSec / totSec) * 100;
  };

  // Seek click handler
  const handleSeekClick = (e) => {
    const rect = seekBg.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const pct = offsetX / rect.width;
    // Directly set audio currentTime via context's seekSong or write a small function:
    seekSong({ nativeEvent: { offsetX } });
  };

  return (
    <>
      {/* Normal player bar */}
      <div className="h-[10%] bg-black flex justify-between items-center text-white px-4">
        {/* Left: thumbnail + meta */}
        <div className="hidden lg:flex items-center gap-4">
          <img
            className="w-12 h-12 object-cover rounded"
            src={track.image}
            alt="artwork"
          />
          <div>
            <p className="truncate max-w-[150px]">{track.name}</p>
            <p className="text-sm text-gray-400 truncate max-w-[150px]">
              {track.desc}
            </p>
          </div>
        </div>

        {/* Center: playback controls + seek bar */}
        <div className="flex flex-col items-center gap-1 m-auto">
          <div className="flex gap-4">
            <button
              type="button"
              className="p-0 focus:outline-none"
              aria-label="Previous"
              onClick={previous}
            >
              <img
                className="w-4 cursor-pointer"
                src={assets.prev_icon}
                alt="previous"
              />
            </button>

            <button
              type="button"
              className="p-0 focus:outline-none"
              aria-label={playStatus ? "Pause" : "Play"}
              onClick={() => {
                if (playStatus) pause();
                else play();
              }}
            >
              {playStatus ? (
                <img
                  className="w-4 cursor-pointer"
                  src={assets.pause_icon}
                  alt="pause"
                />
              ) : (
                <img
                  className="w-4 cursor-pointer"
                  src={assets.play_icon}
                  alt="play"
                />
              )}
            </button>

            <button
              type="button"
              className="p-0 focus:outline-none"
              aria-label="Next"
              onClick={next}
            >
              <img
                className="w-4 cursor-pointer"
                src={assets.next_icon}
                alt="next"
              />
            </button>
          </div>
          <div className="flex items-center gap-5">
            <p className="text-sm">
              {time.currentTime.minute}:
              {time.currentTime.second.toString().padStart(2, "0")}
            </p>
            <div
              ref={seekBg}
              onClick={handleSeekClick}
              className="w-[60vw] max-w-[500px] bg-gray-700 rounded-full cursor-pointer"
            >
              <hr
                ref={seekBar}
                className="h-1 border-none w-0 bg-green-500 rounded-full"
                style={{ width: `${getSeekPercent()}%` }}
              />
            </div>
            <p className="text-sm">
              {time.totalTime.minute}:
              {time.totalTime.second.toString().padStart(2, "0")}
            </p>
          </div>
        </div>

        {/* Right: utility icons including volume and zoom */}
        <div className="hidden lg:flex items-center gap-2 opacity-75">

          {/* Volume icon + always-visible slider */}
          <div
            className="flex items-center"
            onWheel={onWheelVolume}
          >
            <button
              type="button"
              onClick={toggleMute}
              className="p-0 focus:outline-none"
              aria-label={volume === 0 ? "Unmute" : "Mute"}
            >
              <img
                src={assets.volume_icon}
                className={`w-4 cursor-pointer transition-opacity duration-150 ${
                  volume === 0 ? "opacity-40" : ""
                }`}
                alt="volume"
              />
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(volume * 100)}
              onChange={onSliderChange}
              onWheel={(e) => {
                e.preventDefault();
                scrollVolume(e.deltaY);
              }}
              className="w-20 h-1 ml-2 cursor-pointer"
            />
          </div>

          {/* Zoom / Expand icon */}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="p-0 focus:outline-none"
            aria-label="Expand"
          >
            <img
              className="w-4 cursor-pointer"
              src={assets.zoom_icon}
              alt="expand"
            />
          </button>
        </div>
      </div>

      {/* Expanded overlay */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center text-white z-50">
          {/* Content wrapper */}
          <div
            ref={overlayRef}
            className="relative flex flex-col items-center px-4 py-6 max-w-[90%] w-full"
          >
            {/* Close button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>

            {/* Large artwork */}
            <img
              src={track.image}
              alt="artwork"
              className="w-64 h-64 object-cover mb-4 rounded"
            />

            {/* Track info */}
            <p className="text-2xl font-semibold mb-1 truncate text-center">
              {track.name}
            </p>
            <p className="text-gray-400 mb-4 truncate text-center">{track.desc}</p>

            {/* Large controls */}
            <div className="flex items-center gap-6 mb-4">
              <button
                type="button"
                className="p-0 focus:outline-none"
                aria-label="Previous"
                onClick={previous}
              >
                <img
                  className="w-6 cursor-pointer"
                  src={assets.prev_icon}
                  alt="previous"
                />
              </button>
              <button
                type="button"
                className="p-0 focus:outline-none"
                aria-label={playStatus ? "Pause" : "Play"}
                onClick={() => {
                  if (playStatus) pause();
                  else play();
                }}
              >
                {playStatus ? (
                  <img
                    className="w-6 cursor-pointer"
                    src={assets.pause_icon}
                    alt="pause"
                  />
                ) : (
                  <img
                    className="w-6 cursor-pointer"
                    src={assets.play_icon}
                    alt="play"
                  />
                )}
              </button>
              <button
                type="button"
                className="p-0 focus:outline-none"
                aria-label="Next"
                onClick={next}
              >
                <img
                  className="w-6 cursor-pointer"
                  src={assets.next_icon}
                  alt="next"
                />
              </button>
            </div>

            {/* Seek bar in overlay */}
            <div className="w-full max-w-[600px] mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  {time.currentTime.minute}:
                  {time.currentTime.second.toString().padStart(2, "0")}
                </span>
                <div
                  onClick={handleSeekClick}
                  className="flex-1 bg-gray-700 h-2 rounded cursor-pointer relative"
                  ref={seekBg}
                >
                  <div
                    style={{ width: `${getSeekPercent()}%` }}
                    className="bg-green-500 h-2 rounded"
                  />
                </div>
                <span className="text-sm">
                  {time.totalTime.minute}:
                  {time.totalTime.second.toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Volume slider in overlay */}
            <div className="flex items-center gap-3 mt-2" onWheel={onWheelVolume}>
              <button
                type="button"
                onClick={toggleMute}
                className="p-0 focus:outline-none"
                aria-label={volume === 0 ? "Unmute" : "Mute"}
              >
                <img
                  src={assets.volume_icon}
                  className={`w-5 cursor-pointer ${
                    volume === 0 ? "opacity-40" : ""
                  }`}
                  alt="volume"
                />
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(volume * 100)}
                onChange={onSliderChange}
                className="w-40 h-1 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Player;