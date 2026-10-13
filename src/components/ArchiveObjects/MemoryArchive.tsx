import React from 'react';
import { useNavigate } from 'react-router-dom';
import { playArtifactChime, pauseAndResetArchiveSoundtrack } from '../../utils/archiveAudio';

const MemoryArchive: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    pauseAndResetArchiveSoundtrack();
    playArtifactChime(440.0);
    navigate('/memories');
  };

  return (
    <button
      type="button"
      className="archive-hotspot archive-hotspot-memory"
      aria-label="Open Memory Box"
      title="Open Memory Box"
      onClick={handleClick}
    >
      <div className="hotspot-content">
        <div className="beacon-core">
          <span className="beacon-dot" />
        </div>
        <div className="hotspot-tag">
          <span className="hotspot-icon">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/>
            </svg>
          </span>
          <span className="hotspot-title">Memory Box</span>
          <span className="hotspot-action">• Inspect</span>
        </div>
      </div>
    </button>
  );
};

export default MemoryArchive;
