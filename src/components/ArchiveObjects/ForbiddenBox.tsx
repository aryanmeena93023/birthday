import React from 'react';
import { useNavigate } from 'react-router-dom';
import { playArtifactChime } from '../../utils/archiveAudio';
import { markDiscovered } from '../../utils/discoveryTracker';

const ForbiddenBox: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    playArtifactChime(293.66);
    markDiscovered('forbidden');
    navigate('/forbidden');
  };

  return (
    <button
      type="button"
      className="archive-hotspot archive-hotspot-forbidden"
      aria-label="Examine Cipher Box"
      title="Examine Cipher Box"
      onClick={handleClick}
    >
      <div className="hotspot-content">
        <div className="beacon-core">
          <span className="beacon-dot" />
        </div>
        <div className="hotspot-tag">
          <span className="hotspot-icon" style={{ color: '#f87171' }}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          </span>
          <span className="hotspot-title">Cipher Box</span>
          <span className="hotspot-action">• Examined</span>
        </div>
      </div>
    </button>
  );
};

export default ForbiddenBox;
