import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Audio.css';
import { playArtifactChime } from '../../utils/archiveAudio';
import { markDiscovered } from '../../utils/discoveryTracker';

const Audio: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    markDiscovered('audio');
  }, []);

  const handlePlayTape = () => {
    playArtifactChime(587.33);
    setIsPlaying(true);
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  const handleReturn = () => {
    playArtifactChime(392);
  };

  return (
    <main className="audio-scene">
      <article className="audio-container">
        <header className="audio-header">
          <span className="audio-badge">CASE FILE // EVIDENCE 03</span>
          <h1 className="audio-title">AUDIO EVIDENCE</h1>
          <p className="audio-subtitle">Transceiver frequency intercepted across the archive chamber.</p>
        </header>

        {/* Player Chassis */}
        <div className="audio-chassis">
          <div className="audio-status-bar">
            <span className="station-info">STATION: 104.7 MHZ [ECHO]</span>
            <span className="signal-locked">
              <span className="signal-dot" /> SIGNAL LOCKED
            </span>
          </div>

          {/* Dynamic Waveform Display */}
          <div className="audio-waveform-container" aria-label="Audio Waveform">
            <span className={`waveform-bar bar-1 ${isPlaying ? 'active' : ''}`} />
            <span className={`waveform-bar bar-2 ${isPlaying ? 'active' : ''}`} />
            <span className={`waveform-bar bar-3 ${isPlaying ? 'active' : ''}`} />
            <span className={`waveform-bar bar-4 ${isPlaying ? 'active' : ''}`} />
            <span className={`waveform-bar bar-5 ${isPlaying ? 'active' : ''}`} />
            <span className={`waveform-bar bar-6 ${isPlaying ? 'active' : ''}`} />
            <span className={`waveform-bar bar-7 ${isPlaying ? 'active' : ''}`} />
            <span className={`waveform-bar bar-8 ${isPlaying ? 'active' : ''}`} />
          </div>

          {/* Interactive Play Trigger */}
          <div className="audio-controls-row">
            <button
              type="button"
              onClick={handlePlayTape}
              className="audio-play-btn"
              disabled={isPlaying}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
              <span>{isPlaying ? 'PLAYING BROADCAST...' : 'REPLAY RECORDING'}</span>
            </button>
            <span className="tape-duration">TAPE DURATION: 00:34</span>
          </div>
        </div>

        <div className="audio-return-container">
          <Link to="/case" onClick={handleReturn} className="audio-return-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            <span>RETURN TO ARCHIVE</span>
          </Link>
        </div>
      </article>
    </main>
  );
};

export default Audio;
