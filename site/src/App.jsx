import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <footer style={{ textAlign: 'center', padding: '2rem', color: '#4b5563', fontSize: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        © 2024 RAG-QA Intelligence. All rights reserved.
      </footer>
    </Router>
  );
}

export default App;
