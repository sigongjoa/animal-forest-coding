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
        {/* 엔트리 페이지: 앱 시작 */}
        <Route path="/entry" element={<EntryPage />} />

        {/* 로그인 페이지: 엔트리 후 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 스토리 페이지: 로그인 후 튜토리얼 */}
        <Route path="/story" element={<StoryPage />} />

        {/* IDE 페이지: Pyodide 기반 파이썬 IDE */}
        <Route path="/ide" element={<IDEPage />} />

        {/* 루트: 엔트리 페이지로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/entry" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
