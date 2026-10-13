import React from 'react';
import { useNavigate } from 'react-router-dom';
import { playArtifactChime, pauseAndResetArchiveSoundtrack } from '../../utils/archiveAudio';

const LockedDrawer: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    pauseAndResetArchiveSoundtrack();
    playArtifactChime(369.99);
    navigate('/drawer');
  };

  return (
    <button
      type="button"
      className="archive-hotspot archive-hotspot-drawer"
      aria-label="Inspect Locked Desk Drawer"
      title="Inspect Locked Desk Drawer"
      onClick={handleClick}
    >
      <div className="hotspot-content">
        <div className="beacon-core">
          <span className="beacon-dot" />
        </div>
        <div className="hotspot-tag">
          <span className="hotspot-icon">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
            </svg>
          </span>
          <span className="hotspot-title">Desk Drawer</span>
          <span className="hotspot-action">• Inspect</span>
        </div>
      </div>
    </button>
  );
};

export default LockedDrawer;
