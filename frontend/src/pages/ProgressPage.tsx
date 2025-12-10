import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectProgression, selectLevelStats } from '../store/slices/progressionSlice';
import apiClient from '../services/apiClient';

interface LeaderboardEntry {
    rank: number;
    studentId: string;
    studentName: string;
    points: number;
    badges: number;
    missionsCompleted: number;
}

const ProgressPage: React.FC = () => {
    const progression = useSelector(selectProgression);
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await apiClient.get('/missions/leaderboard?limit=5');
                if (response.data.success) {
                    setLeaderboard(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoadingLeaderboard(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const levelStats = useSelector(selectLevelStats);

    const stats = {
        totalPoints: progression.points || 0,
        completedMissions: progression.completedMissions?.length || 0,
        level: levelStats.level,
        nextLevelPoints: levelStats.nextLevelPoints
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Coding Journey</h1>
                        <p className="text-gray-600 mt-2">Welcome back, {progression.studentId || 'Student'}!</p>
                    </div>
                    <button
                        onClick={() => navigate('/mission/mission-001')}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow"
                    >
                        Continue Adventure
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-sm font-medium uppercase">Total Points</div>
                        <div className="text-4xl font-bold text-amber-500 mt-2">{stats.totalPoints}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-sm font-medium uppercase">Missions Done</div>
                        <div className="text-4xl font-bold text-blue-500 mt-2">{stats.completedMissions}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-sm font-medium uppercase">Current Level</div>
                        <div className="text-2xl font-bold text-purple-600 mt-2">{stats.level}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-sm font-medium uppercase">Badges</div>
                        <div className="text-4xl font-bold text-pink-500 mt-2">{progression.badges?.length || 0}</div>
                    </div>
                </div>

                {/* Badges Section */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-10">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="mr-2">🏆</span> Badge Collection
                    </h2>

                    {(!progression.badges || progression.badges.length === 0) ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <p className="text-gray-500">No badges earned yet. Complete your first mission!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            {progression.badges.map((badge: string, idx: number) => (
                                <div key={idx} className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center text-2xl shadow-md mb-3">
                                        ⭐
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 text-center">{badge}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Mission Mission Board */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-10">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="mr-2">🗺️</span> Mission Board
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Unit 1 Card */}
                        <div
                            onClick={() => navigate('/mission/unit-1-economics')}
                            className="group cursor-pointer border rounded-2xl p-6 hover:shadow-lg transition-all hover:bg-yellow-50 border-yellow-200 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-2 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-bl-xl">
                                BEGINNER
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="text-4xl">💰</div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-yellow-700">Unit 1: Economics 101</h3>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Tom Nook needs help managing his bells! Learn basic variables and arithmetic in this economy simulation.
                                    </p>
                                    <button className="mt-4 px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        Start Mission
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Unit 2 Card */}
                        <div
                            onClick={() => navigate('/mission/unit-2-fishing')}
                            className="group cursor-pointer border rounded-2xl p-6 hover:shadow-lg transition-all hover:bg-blue-50 border-blue-200 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-2 bg-blue-200 text-blue-800 text-xs font-bold rounded-bl-xl">
                                INTERMEDIATE
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="text-4xl">🎣</div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700">Unit 2: King of Fishing</h3>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Join Justin's fishing tournament! Master `if-else` logic and `loops` to catch the legendary Gyarados.
                                    </p>
                                    <button className="mt-4 px-4 py-2 bg-blue-400 text-blue-900 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        Start Mission
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recent Activity / Leaderboard Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            <div className="flex items-center text-sm text-gray-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                                Logged in just now
                            </div>
                            {/* More items would go here */}
                        </div>
                    </section>

                    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Leaderboard (Top 5)</h2>
                        {loadingLeaderboard ? (
                            <div className="text-center py-4 text-gray-500">Loading rankings...</div>
                        ) : (
                            <div className="space-y-3">
                                {leaderboard.map((entry) => (
                                    <div key={entry.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mr-3 ${entry.rank === 1 ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                {entry.rank}
                                            </span>
                                            <span className="font-medium text-gray-700">{entry.studentName}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-500">{entry.points} pts</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ProgressPage;
