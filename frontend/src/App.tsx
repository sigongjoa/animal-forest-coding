import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EntryPage from './pages/EntryPage';
import LoginPage from './pages/LoginPage';
import StoryPage from './pages/StoryPage';
import IDEPage from './pages/IDEPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/entry" element={<EntryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/story" element={<StoryPage />} />
        <Route path="/ide" element={<IDEPage />} />
        <Route path="/" element={<Navigate to="/entry" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
