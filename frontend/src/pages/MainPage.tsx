import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainPage: React.FC = () => {
    const navigate = useNavigate();

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

                {/* 3. Settings (Placeholder) */}
                <button
                    onClick={() => alert('Settings coming soon!')}
                    className="group relative bg-white/60 hover:bg-white/80 p-6 rounded-3xl shadow-lg transition-all transform hover:-translate-y-1 flex flex-col items-center"
                >
                    <div className="text-4xl mb-2">⚙️</div>
                    <h3 className="text-xl font-bold text-gray-700">Settings</h3>
                </button>

                {/* 4. Story Log (Placeholder) */}
                <button
                    onClick={() => alert('Story Log coming soon!')}
                    className="group relative bg-white/60 hover:bg-white/80 p-6 rounded-3xl shadow-lg transition-all transform hover:-translate-y-1 flex flex-col items-center"
                >
                    <div className="text-4xl mb-2">📖</div>
                    <h3 className="text-xl font-bold text-gray-700">Story Log</h3>
                </button>
            </div>

            {/* User Info / Footer */}
            <div className="mt-12 text-center text-green-800 font-medium">
                <p>Welcome back, Traveler!</p>
            </div>
        </div>
    );
};

export default MainPage;
