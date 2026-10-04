import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import Case from './pages/Case/Case';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/case" element={<Case />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
