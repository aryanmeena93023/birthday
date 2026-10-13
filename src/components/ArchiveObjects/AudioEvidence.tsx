import React from 'react';
import { useNavigate } from 'react-router-dom';
import { playArtifactChime, pauseAndResetArchiveSoundtrack } from '../../utils/archiveAudio';

const AudioEvidence: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    pauseAndResetArchiveSoundtrack();
    playArtifactChime(587.33);
    navigate('/audio');
  };

  return (
    <button
      type="button"
      className="archive-hotspot archive-hotspot-audio"
      aria-label="Tune Radio Transceiver"
      title="Tune Radio Transceiver"
      onClick={handleClick}
    >
      <div className="hotspot-content">
        <div className="beacon-core">
          <span className="beacon-dot" />
        </div>
        <div className="hotspot-tag">
          <span className="hotspot-icon">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2H8.3l8.26-3.34L15.88 1 3.24 6.15zM7 20c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-8h-2v-2h-2v2H4V8h16v4z"/>
            </svg>
          </span>
          <span className="hotspot-title">Radio Audio</span>
          <span className="hotspot-action">• Inspect</span>
        </div>
      </div>
    </button>
  );
};

export default AudioEvidence;
