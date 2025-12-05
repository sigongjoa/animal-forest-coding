import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import SceneManager from '../components/admin/SceneManager';
import MissionManager from '../components/admin/MissionManager';

type AdminTab = 'scenes' | 'missions' | 'episodes';

interface AdminDashboardProps {
  adminToken?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminToken: propToken }) => {
  // For testing: use a default token if not provided
  // Token = 'YWRtaW5Abm9vay5jb20=' (base64 encode of 'admin@nook.com')
  const adminToken = propToken || 'YWRtaW5Abm9vay5jb20=';

  const [activeTab, setActiveTab] = useState<AdminTab>('scenes');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setError(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'scenes':
        return <SceneManager adminToken={adminToken} />;
      case 'missions':
        return <MissionManager adminToken={adminToken} />;
      case 'episodes':
        return (
          <div className="admin-content">
            <h2>Episode 관리</h2>
            <p>Episode 관리 기능은 준비 중입니다.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🦁 Animal Forest Coding - Admin Dashboard</h1>
        <p>Scene과 Mission을 관리합니다</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'scenes' ? 'active' : ''}`}
          onClick={() => handleTabChange('scenes')}
        >
          📺 Scene 관리
        </button>
        <button
          className={`tab-button ${activeTab === 'missions' ? 'active' : ''}`}
          onClick={() => handleTabChange('missions')}
        >
          🎯 Mission 관리
        </button>
        <button
          className={`tab-button ${activeTab === 'episodes' ? 'active' : ''}`}
          onClick={() => handleTabChange('episodes')}
        >
          📚 Episode 관리
        </button>
      </div>

      {error && (
        <div className="admin-error">
          <p>❌ {error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="admin-loading">
          <p>로딩 중...</p>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default AdminDashboard;
