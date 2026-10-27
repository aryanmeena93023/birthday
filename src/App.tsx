import { useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import { playHedwigAmbience, stopHedwigAmbience } from './utils/archiveAudio';

const Case = lazy(() => import('./pages/Case/Case'));
const Letter = lazy(() => import('./pages/Letter/Letter'));
const Memories = lazy(() => import('./pages/Memories/Memories'));
const Audio = lazy(() => import('./pages/Audio/Audio'));
const Raven = lazy(() => import('./pages/Raven/Raven'));
const MemoryOne = lazy(() => import('./pages/Raven/MemoryOne'));
const MemoryTwo = lazy(() => import('./pages/Raven/MemoryTwo'));
const Drawer = lazy(() => import('./pages/Drawer/Drawer'));
const Forbidden = lazy(() => import('./pages/Forbidden/Forbidden'));
const PersonalRecord = lazy(() => import('./pages/PersonalRecord/PersonalRecord'));
const KeyAcquisition = lazy(() => import('./pages/KeyAcquisition/KeyAcquisition'));

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
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050506' }} />}>
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;


