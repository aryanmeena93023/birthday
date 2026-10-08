import React from 'react';
import './AudioMemory.css';
import type { PlayerState } from '../../hooks/useAudioMemoryPlayer';


interface PlayerControlsProps {
  playerState: PlayerState;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isAudioError: boolean;
  onPlayPause: () => void;
  onSeek: (targetTime: number) => void;
  onReplay: () => void;
  onToggleMute: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  playerState,
  currentTime,
  duration,
  volume,
  isMuted,
  isAudioError,
  onPlayPause,
  onSeek,
  onReplay,
  onToggleMute,
}) => {
  const isPlaying = playerState === 'playing';
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSeek(val);
  };

  return (
    <section className="player-controls-section">
      {/* Inline Audio Error Warning if file missing */}
      {isAudioError && (
        <div className="audio-error-notice" role="alert">
          <span className="notice-icon">!</span>
          <span className="notice-text">
            Audio file unavailable at configured path. Controls in standby mode.
          </span>
        </div>
      )}

      {/* Time Scrubber & Indicators */}
      <div className="scrubber-wrapper">
        <div className="scrubber-labels">
          <span className="time-current">{formatTime(currentTime)}</span>
          <span className="scrubber-title">FOLIO PROGRESS</span>
          <span className="time-total">{formatTime(duration)}</span>
        </div>

        <div className="scrubber-input-container">
          <div
            className="scrubber-track-fill"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleScrubberChange}
            disabled={duration <= 0 || isAudioError}
            className="scrubber-range-input"
            aria-label="Audio progress scrubber"
          />
        </div>
      </div>

      {/* Playback Buttons Dock: Three Symmetrical Controls */}
      <div className="controls-dock" aria-label="Playback controls">
        {/* 1. Volume Mute/Unmute Icon Button */}
        <button
          type="button"
          onClick={onToggleMute}
          disabled={isAudioError}
          className="control-icon-btn volume-icon-btn"
          title={isMuted || volume === 0 ? 'Unmute Volume' : 'Mute Volume'}
          aria-label={isMuted || volume === 0 ? 'Unmute Volume' : 'Mute Volume'}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            {isMuted || volume === 0 ? (
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            ) : (
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            )}
          </svg>
        </button>

        {/* 2. Primary Brass Play/Pause Button */}
        <button
          type="button"
          onClick={onPlayPause}
          disabled={isAudioError}
          className={`btn-main-play ${isPlaying ? 'playing' : ''}`}
          aria-label={isPlaying ? 'Pause Audio' : 'Play Audio'}
          aria-pressed={isPlaying}
        >
          <div className="btn-main-play-inner">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="play-icon">
              {isPlaying ? (
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              ) : (
                <path d="M8 5v14l11-7z" />
              )}
            </svg>
          </div>
        </button>

        {/* 3. Replay Button */}
        <button
          type="button"
          onClick={onReplay}
          disabled={isAudioError}
          className="control-icon-btn replay-icon-btn"
          title="Replay from Commencement"
          aria-label="Replay from Commencement"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
          </svg>
        </button>
      </div>
    </section>
  );
};

