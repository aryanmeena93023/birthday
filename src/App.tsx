import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import Case from './pages/Case/Case';
import Letter from './pages/Letter/Letter';
import Memories from './pages/Memories/Memories';
import Audio from './pages/Audio/Audio';
import Raven from './pages/Raven/Raven';
import MemoryOne from './pages/Raven/MemoryOne';
import MemoryTwo from './pages/Raven/MemoryTwo';
import Drawer from './pages/Drawer/Drawer';
import Forbidden from './pages/Forbidden/Forbidden';
import PersonalRecord from './pages/PersonalRecord/PersonalRecord';
import KeyAcquisition from './pages/KeyAcquisition/KeyAcquisition';
import { playHedwigAmbience, stopHedwigAmbience } from './utils/archiveAudio';

function HedwigContinuousAudio() {
  const location = useLocation();
  const wasInHedwigRef = useRef(false);

  useEffect(() => {
    const isHedwigSection = location.pathname.startsWith('/raven');

    if (isHedwigSection) {
      if (!wasInHedwigRef.current) {
        // First entry into the File No. 3 section from outside
        wasInHedwigRef.current = true;
        playHedwigAmbience(true, true);
      } else {
        // Navigating between pages within the section: keep playing, do NOT restart
        playHedwigAmbience(false, false);
      }
    } else {
      // Unconditionally stop Hedwig audio when on any route outside /raven
      wasInHedwigRef.current = false;
      stopHedwigAmbience();
    }
  }, [location.pathname]);

  // Autoplay fallback: if user's first interaction happens while inside Hedwig section
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (window.location.pathname.startsWith('/raven')) {
        playHedwigAmbience(true, false);
      }
    };
    window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <HedwigContinuousAudio />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/case" element={<Case />} />
        <Route path="/letter" element={<Letter />} />
        <Route path="/memories" element={<Memories />} />


        <Route path="/audio" element={<Audio />} />
        <Route path="/personal-record" element={<PersonalRecord />} />
        <Route path="/key-acquisition" element={<KeyAcquisition />} />
        <Route path="/raven" element={<Raven />} />
        <Route path="/raven/memory-1" element={<MemoryOne />} />
        <Route path="/raven/memory-2" element={<MemoryTwo />} />
        <Route path="/drawer" element={<Drawer />} />
        <Route path="/forbidden" element={<Forbidden />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


