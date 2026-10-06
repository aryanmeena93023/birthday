import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Forbidden.css';
import { playDialClick, playUnlockChime, playArtifactChime } from '../../utils/archiveAudio';
import { markDiscovered, isDiscovered } from '../../utils/discoveryTracker';

const Forbidden: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => isDiscovered('forbidden'));
  const [dials, setDials] = useState<number[]>(() => isDiscovered('forbidden') ? [3, 0, 0, 0] : [0, 0, 0, 0]);

  const checkCombination = (newDials: number[]) => {
    const code = newDials.join('');
    // Unlocks on '3000' (from letter) or '1928' or '1047'
    if (code === '3000' || code === '1928' || code === '1047') {
      if (!isUnlocked) {
        setIsUnlocked(true);
        markDiscovered('forbidden');
        playUnlockChime();
      }
    } else {
      setIsUnlocked(false);
    }
  };

  const incrementDial = (index: number) => {
    const newDials = [...dials];
    newDials[index] = (newDials[index] + 1) % 10;
    setDials(newDials);
    playDialClick(300 + index * 40);
    checkCombination(newDials);
  };

  const decrementDial = (index: number) => {
    const newDials = [...dials];
    newDials[index] = (newDials[index] + 9) % 10;
    setDials(newDials);
    playDialClick(300 + index * 40);
    checkCombination(newDials);
  };

  const handleReturn = () => {
    playArtifactChime(392);
  };

  return (
    <main className="cipher-scene">
      <article className="cipher-container">
        <header className="cipher-header">
          <span className="cipher-badge">CLASSIFIED // HIGH SECURITY</span>
          <h1 className="cipher-title">DO NOT OPEN</h1>
          <p className="cipher-subtitle">Four-tumbler combination lock forged in reinforced iron.</p>
        </header>

        {/* 4-Tumbler Dials */}
        <div className="cipher-tumbler-box">
          {dials.map((val, idx) => (
            <div key={idx} className="tumbler-column">
              <button
                type="button"
                className="tumbler-arrow-btn"
                onClick={() => incrementDial(idx)}
                aria-label={`Increment dial ${idx + 1}`}
              >
                ▲
              </button>
              <div className={`tumbler-dial-digit ${isUnlocked ? 'unlocked' : ''}`}>
                {val}
              </div>
              <button
                type="button"
                className="tumbler-arrow-btn"
                onClick={() => decrementDial(idx)}
                aria-label={`Decrement dial ${idx + 1}`}
              >
                ▼
              </button>
            </div>
          ))}
        </div>

        {/* Status Feedback */}
        <p className={`cipher-status-text ${isUnlocked ? 'success' : 'locked'}`}>
          {isUnlocked
            ? '✦ SUCCESS: CIPHER UNLOCKED! DISCOVERY RECORDED.'
            : 'STATUS: MECHANISM LOCKED. ALIGN THE CIPHER.'}
        </p>

        {isUnlocked && (
          <div className="cipher-unlocked-reveal">
            <p className="cipher-reveal-text">
              The iron tumblers snap into place. Inside lies the confidential dossier containing the secret message: <em>"Happy Birthday, 3000"</em>.
            </p>
          </div>
        )}

        <div className="cipher-return-container">
          <Link to="/case" onClick={handleReturn} className="cipher-return-btn">
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

export default Forbidden;
