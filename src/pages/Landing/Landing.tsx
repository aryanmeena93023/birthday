import React, { useState } from 'react';
import IntroVideo from '../../components/IntroVideo/IntroVideo';
import EntryGate from '../../components/EntryGate/EntryGate';

const INTRO_STORAGE_KEY = 'nluja_intro_completed';

/**
 * Landing Page: Primary entry point for the application route (/).
 * Orchestrates the startup experience:
 * 1. Intro Video on fresh session arrival (fills viewport, preserves aspect ratio)
 * 2. Existing Entry Gate upon video completion or error fallback
 * 3. Navigates to Archive Desk (/case)
 */
const Landing: React.FC = () => {
  const [introCompleted, setIntroCompleted] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(INTRO_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [shouldAnimateReveal, setShouldAnimateReveal] = useState<boolean>(false);

  const handleStartReveal = () => {
    setShouldAnimateReveal(true);
  };

  const handleIntroComplete = () => {
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, 'true');
    } catch {
      // Safe fallback if sessionStorage is restricted
    }
    setIntroCompleted(true);
  };

  return (
    <main className="landing-stage-root relative w-screen h-screen overflow-hidden bg-[#050506]">
      {/* 
        Always render EntryGate so that during video fadeout, the EntryGate
        is immediately visible beneath it and smoothly executes its cinematic reveal.
      */}
      <EntryGate 
        animateReveal={shouldAnimateReveal} 
        isActive={introCompleted || shouldAnimateReveal}
      />

      {!introCompleted && (
        <IntroVideo 
          onStartReveal={handleStartReveal} 
          onComplete={handleIntroComplete} 
        />
      )}
    </main>
  );
};

export default Landing;
