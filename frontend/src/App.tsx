import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EntryPage from './pages/EntryPage';
import LoginPage from './pages/LoginPage';
import StoryPage from './pages/StoryPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/entry" element={<EntryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/story" element={<StoryPage />} />
        <Route path="/ide" element={<div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800 text-white"><h1 className="text-4xl font-bold">🦝 너굴 코딩 IDE (Pyodide Python Engine)</h1></div>} />
        <Route path="/" element={<Navigate to="/entry" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
