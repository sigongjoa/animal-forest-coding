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
        {/* 엔트리 페이지: 앱 시작 */}
        <Route path="/entry" element={<EntryPage />} />

        {/* 로그인 페이지: 엔트리 후 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 스토리 페이지: 로그인 후 튜토리얼 */}
        <Route path="/story" element={<StoryPage />} />

        {/* IDE 페이지: 아직 구현 안 됨 */}
        <Route path="/ide" element={<div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800 text-white"><h1 className="text-4xl font-bold">IDE 페이지 (구현 예정)</h1></div>} />

        {/* 루트: 엔트리 페이지로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/entry" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
