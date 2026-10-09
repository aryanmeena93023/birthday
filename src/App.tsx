import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import Case from './pages/Case/Case';
import Letter from './pages/Letter/Letter';
import Memories from './pages/Memories/Memories';
import Audio from './pages/Audio/Audio';
import Raven from './pages/Raven/Raven';
import Drawer from './pages/Drawer/Drawer';
import Forbidden from './pages/Forbidden/Forbidden';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/case" element={<Case />} />
        <Route path="/letter" element={<Letter />} />
        <Route path="/memories" element={<Memories />} />
        <Route path="/audio" element={<Audio />} />
        <Route path="/raven" element={<Raven />} />
        <Route path="/drawer" element={<Drawer />} />
        <Route path="/forbidden" element={<Forbidden />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

