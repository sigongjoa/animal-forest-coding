import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsModal } from '../components/SettingsModal';
import { StoryLogModal } from '../components/StoryLogModal';

const MainPage: React.FC = () => {
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isStoryLogOpen, setIsStoryLogOpen] = useState(false);
    const [userName, setUserName] = useState('Traveler');

    useEffect(() => {
        // Attempt to get user info from localStorage or session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed.name) setUserName(parsed.name);
            } catch (e) {
                // Invalid JSON, ignore
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-300 to-green-200 flex flex-col items-center justify-center p-4">
            {/* Title / Logo Area */}
            <div className="mb-12 text-center animate-bounce-slow">
                <h1 className="text-6xl font-extrabold text-white drop-shadow-lg tracking-wider mb-2"
                    style={{ textShadow: '4px 4px 0px #059669' }}>
                    Animal Forest
                </h1>
                <span className="bg-white/90 text-green-700 px-4 py-1 rounded-full text-sm font-bold shadow-md">
                    Coding Adventure
                </span>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                {/* 1. Adventure Mode (Main Story) */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="group relative bg-white/80 hover:bg-white p-8 rounded-3xl shadow-xl transition-all transform hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center"
                >
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🗺️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Start Adventure</h2>
                    <p className="text-gray-600 text-center">
                        Explore the island, solve coding puzzles, and help the villagers!
                    </p>
                    <div className="absolute inset-0 border-4 border-transparent group-hover:border-green-400 rounded-3xl transition-colors pointer-events-none" />
                </button>

                {/* 2. Free Coding (IDE) */}
                <button
                    onClick={() => navigate('/ide')}
                    className="group relative bg-white/80 hover:bg-white p-8 rounded-3xl shadow-xl transition-all transform hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center"
                >
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">💻</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Creative Lab</h2>
                    <p className="text-gray-600 text-center">
                        Open the IDE to practice coding freely and experiment.
                    </p>
                    <div className="absolute inset-0 border-4 border-transparent group-hover:border-blue-400 rounded-3xl transition-colors pointer-events-none" />
                </button>

                {/* 3. Settings */}
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="group relative bg-white/60 hover:bg-white/80 p-6 rounded-3xl shadow-lg transition-all transform hover:-translate-y-1 flex flex-col items-center"
                >
                    <div className="text-4xl mb-2">⚙️</div>
                    <h3 className="text-xl font-bold text-gray-700">Settings</h3>
                </button>

                {/* 4. Story Log */}
                <button
                    onClick={() => setIsStoryLogOpen(true)}
                    className="group relative bg-white/60 hover:bg-white/80 p-6 rounded-3xl shadow-lg transition-all transform hover:-translate-y-1 flex flex-col items-center"
                >
                    <div className="text-4xl mb-2">📖</div>
                    <h3 className="text-xl font-bold text-gray-700">Story Log</h3>
                </button>
            </div>

            {/* Mission Selection Area */}
            <div className="mt-12 w-full max-w-4xl">
                <h2 className="text-2xl font-bold text-green-900 mb-4 text-center">Available Missions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Unit 1 */}
                    <button
                        onClick={() => navigate('/mission/unit-1-economics')}
                        className="bg-white/90 p-6 rounded-2xl shadow-md hover:shadow-xl hover:bg-white transition-all text-left flex items-start space-x-4 border-l-8 border-yellow-400"
                    >
                        <div className="bg-yellow-100 p-3 rounded-full text-2xl">💰</div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Unit 1: Economics 101</h3>
                            <p className="text-sm text-gray-600 mt-1">Learn basic arithmetic operators with Tom Nook.</p>
                            <span className="inline-block mt-2 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">Beginner</span>
                        </div>
                    </button>


                    {/* Unit 2 */}
                    <button
                        onClick={() => navigate('/mission/unit-2-fishing')}
                        className="bg-white/90 p-6 rounded-2xl shadow-md hover:shadow-xl hover:bg-white transition-all text-left flex items-start space-x-4 border-l-8 border-blue-400"
                    >
                        <div className="bg-blue-100 p-3 rounded-full text-2xl">🎣</div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Unit 2: King of Fishing</h3>
                            <p className="text-sm text-gray-600 mt-1">Master loops & conditionals with Justin.</p>
                            <span className="inline-block mt-2 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Intermediate</span>
                        </div>
                    </button>

                    {/* Unit 3 */}
                    <button
                        onClick={() => navigate('/mission/unit-3-variable-world')}
                        className="bg-white/90 p-6 rounded-2xl shadow-md hover:shadow-xl hover:bg-white transition-all text-left flex items-start space-x-4 border-l-8 border-purple-400"
                    >
                        <div className="bg-purple-100 p-3 rounded-full text-2xl">📦</div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Unit 3: Java Variables</h3>
                            <p className="text-sm text-gray-600 mt-1">Learn variables & types with Isabelle.</p>
                            <span className="inline-block mt-2 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">Advanced</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* User Info / Footer */}
            <div className="mt-12 text-center text-green-800 font-medium">
                <p>Welcome back, {userName}!</p>
            </div>

            {/* Modals */}
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <StoryLogModal isOpen={isStoryLogOpen} onClose={() => setIsStoryLogOpen(false)} />
        </div >
    );
};

export default MainPage;
