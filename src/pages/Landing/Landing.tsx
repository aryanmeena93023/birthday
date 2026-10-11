import React, { useState } from 'react';
import IntroVideo from '../../components/IntroVideo/IntroVideo';
import EntryGate from '../../components/EntryGate/EntryGate';

const INTRO_STORAGE_KEY = 'nluja_intro_completed';

/**
 * Landing Page: Primary entry point for the application route (/).
 * Orchestrates the complete startup experience:
 * 1. Introductory Video (on fresh session arrival)
 * 2. Approved Google Stitch Entry Gate
 *
 * Preserves session state so internal navigation between the Entry Gate,
 * Archive Desk, and other pages does not restart the video.
 */
const Landing: React.FC = () => {
  const [introCompleted, setIntroCompleted] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(INTRO_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleIntroComplete = () => {
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, 'true');
    } catch {
      // Safe fallback if sessionStorage is restricted
    }
    setIntroCompleted(true);
  };

  return (
    <main className="landing-stage-root">
      {!introCompleted ? (
        <IntroVideo onComplete={handleIntroComplete} />
      ) : (
        <EntryGate />
      )}
    </main>
  );
};

export default Landing;
