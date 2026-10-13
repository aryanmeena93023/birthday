import React from 'react';
import { useNavigate } from 'react-router-dom';
import { playArtifactChime, pauseAndResetArchiveSoundtrack } from '../../utils/archiveAudio';
import { markDiscovered } from '../../utils/discoveryTracker';

const Raven: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    pauseAndResetArchiveSoundtrack();
    markDiscovered('raven');
    playArtifactChime(329.63);
    navigate('/raven');
  };

  return (
    <button
      type="button"
      className="archive-hotspot archive-hotspot-raven"
      aria-label="Examine The Owl"
      title="Examine The Owl"
      onClick={handleClick}
    >
      <div className="hotspot-content">
        <div className="beacon-core beacon-core-raven">
          <span className="beacon-dot" />
        </div>
        <div className="hotspot-tag hotspot-tag-raven">
          <span className="hotspot-icon hotspot-icon-raven">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
          </span>
          <span className="hotspot-title">The Owl</span>
          <span className="hotspot-action" style={{ color: 'rgba(125, 211, 252, 0.85)' }}>• Inspect</span>
        </div>
      </div>
    </button>
  );
};

export default Raven;
