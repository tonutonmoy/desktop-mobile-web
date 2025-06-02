// src/App.js

import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import Home from './Componant/Home/Home';
import About from './Componant/About/About';
import BlogDetails from './Componant/Blog/BlogDetails';
import Blog from './Componant/Blog/Blog';




function App() {
  return (
    <Router>
      <div style={{ padding: '20px' }}>
        <nav style={{ marginBottom: '20px' }}>
          <Link to="/" style={{ marginRight: '15px' }}>🏠 Home</Link>
          <Link to="/about" style={{ marginRight: '15px' }}>ℹ️ About</Link>
          <Link to="/blog">📝 Blog</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
