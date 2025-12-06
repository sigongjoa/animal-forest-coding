import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { restoreGameState, selectProgression } from './store/slices/progressionSlice';
import { persistenceService } from './services/PersistenceService';
import { store } from './store';
import EntryPage from './pages/EntryPage';
import LoginPage from './pages/LoginPage';
import StoryPage from './pages/StoryPage';
import IDEPage from './pages/IDEPage';
import MissionPage from './pages/MissionPage';
import ProgressPage from './pages/ProgressPage';
import AdminDashboard from './pages/AdminDashboard';
import PlaygroundPage from './pages/PlaygroundPage';
import './App.css';

function AppWithPersistence() {
  const dispatch = useDispatch();
  const progression = useSelector(selectProgression);

  // Restore game state on app mount
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (userId && token) {
      console.log('[App] Restoring game state for user:', userId);
      dispatch(restoreGameState({ studentId: userId, token }) as any);
    }
  }, [dispatch]);

  // Set up auto-save when student is logged in
  useEffect(() => {
    if (progression.studentId) {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('[App] Starting auto-save for user:', progression.studentId);

        const unsubscribe = store.subscribe(() => {
          const currentState = store.getState().progression;
          persistenceService.startAutoSave(
            () => ({
              studentId: progression.studentId!,
              episodeId: currentState.episodeId || 'ep_1',
              completedMissions: currentState.completedMissions,
              currentMissionIndex: currentState.currentMissionIndex,
              points: currentState.points,
              badges: currentState.badges,
              lastModified: Date.now(),
            }),
            token
          );
        });

        return () => {
          persistenceService.stopAutoSave();
          unsubscribe();
        };
      }
    }
  }, [progression.studentId]);

  return (
    <Router>
      <Routes>
        <Route path="/entry" element={<EntryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/story" element={<StoryPage />} />
        <Route path="/ide" element={<IDEPage />} />
        <Route path="/mission/:missionId" element={<MissionPage />} />
        <Route path="/dashboard" element={<ProgressPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/" element={<Navigate to="/entry" replace />} />
      </Routes>
    </Router>
  );
}

export default AppWithPersistence;
