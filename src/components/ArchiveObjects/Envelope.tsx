import React from 'react';
import { useNavigate } from 'react-router-dom';
import { pauseAndResetArchiveSoundtrack, playLetterOpeningSound } from '../../utils/archiveAudio';

const Envelope: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    playLetterOpeningSound();
    pauseAndResetArchiveSoundtrack();
    navigate('/letter');
  };

  return (
    <button
      type="button"
      className="archive-hotspot archive-hotspot-envelope"
      aria-label="Examine Sealed Letter"
      title="Examine Sealed Letter"
      onClick={handleClick}
    >
      <div className="hotspot-content">
        <div className="beacon-core">
          <span className="beacon-dot" />
        </div>
        <div className="hotspot-tag">
          <span className="hotspot-icon">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </span>
          <span className="hotspot-title">Sealed Letter</span>
          <span className="hotspot-action">• Inspect</span>
        </div>
      </div>
    </button>
  );
};

export default Envelope;
