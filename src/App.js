// src/App.js

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import logo from './logo.svg';

function Home() {
  return (
    <div>
      <h1>🏠 Home Page</h1>
      <p>আমি এখন একই কোডে Web, Desktop এবং Mobile এ কাজ করছি!</p>
    </div>
  );
}

function About() {
  return (
    <div>
      <h1>ℹ️ About Page</h1>
      <p>এই অ্যাপটি React দিয়ে বানানো হয়েছে এবং সব জায়গায় চলে!</p>

      
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          
          <nav style={{ margin: '20px' }}>
            <Link to="/" style={{ marginRight: '20px', color: 'white' }}>Home</Link>
            <Link to="/about" style={{ color: 'white' }}>About</Link>
          </nav>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
