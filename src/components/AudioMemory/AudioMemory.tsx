import React from 'react';
import './AudioMemory.css';
import { audioMemoryData } from '../../content/audioMemory';
import { useAudioMemoryPlayer } from '../../hooks/useAudioMemoryPlayer';
import { useAudioAnalyser } from '../../hooks/useAudioAnalyser';
import { Medallion } from './Medallion';
import { CaptionFrame } from './CaptionFrame';
import { PlayerControls } from './PlayerControls';

export const AudioMemory: React.FC = () => {
  const {
    audioRef,
    playerState,
    currentTime,
    duration,
    volume,
    isMuted,
    isAudioError,
    togglePlayPause,
    seek,
    replay,
    toggleMute,
  } = useAudioMemoryPlayer(
    audioMemoryData.audioSrc,
    audioMemoryData.captionVideoSrc
  );

  const isPlaying = playerState === 'playing';

  const { amplitude, frequencyBars } = useAudioAnalyser(audioRef, isPlaying);

  return (
    <div className="audio-memory-root">
      {/* Hidden Master Clock HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={audioMemoryData.audioSrc}
        preload="metadata"
        aria-hidden="true"
      />

      {/* 1. Medallion Relic Hero */}
      <Medallion
        isPlaying={isPlaying}
        amplitude={amplitude}
        onClick={togglePlayPause}
      />

      {/* 2. Sound-Reactive Organic Equalizer */}
      <div className="equalizer-section">
        <div className="equalizer-header">
          <span className="equalizer-subtitle">IF I COULD PORTRAY YOU IN WORDS</span>
          <span
            className="equalizer-dot"
            style={{
              transform: `scale(${1 + amplitude * 0.4})`,
              backgroundColor: isPlaying ? '#ddc48b' : 'rgba(221,196,139,0.3)',
            }}
          />
        </div>

        {/* 15 Harmonic Equalizer Bars */}
        <div className="equalizer-bars-container" aria-hidden="true">
          {frequencyBars.map((barVal, idx) => {
            const barHeight = isPlaying ? Math.floor(barVal * 36 + 6) : 10;
            return (
              <span
                key={idx}
                className="eq-bar"
                style={{
                  height: `${barHeight}px`,
                  opacity: isPlaying ? 0.4 + barVal * 0.6 : 0.4,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* 3. Manuscript Poetic Testament Panel */}
      <CaptionFrame
        title={audioMemoryData.title}
        subHeader={audioMemoryData.subHeader}
        messageLines={audioMemoryData.messageLines}
      />

      {/* 4. Compact Archival Controls */}
      <PlayerControls
        playerState={playerState}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isAudioError={isAudioError}
        onPlayPause={togglePlayPause}
        onSeek={seek}
        onReplay={replay}
        onToggleMute={toggleMute}
      />
    </div>
  );
};
