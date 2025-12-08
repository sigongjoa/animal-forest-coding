import React from 'react';

interface StoryLogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StoryLogModal: React.FC<StoryLogModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    // Mock data for story logs
    const logs = [
        { id: 1, title: "Arrival at the Island", date: "2023-10-01", description: "You arrived at the Animal Forest island and met Tom Nook." },
        { id: 2, title: "First Coding Mission", date: "2023-10-02", description: "Successfully debugged the town hall system." },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl transform transition-all scale-100 max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">📖 Story Log</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {logs.map(log => (
                        <div key={log.id} className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-amber-900">{log.title}</h3>
                                <span className="text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded-md">{log.date}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{log.description}</p>
                        </div>
                    ))}

                    {/* Empty State Placeholder if no logs */}
                    {logs.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <div className="text-4xl mb-3">📜</div>
                            <p>No adventures recorded yet.</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-4 border-t px-1">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md transition-transform active:scale-95"
                    >
                        Close Journal
                    </button>
                </div>
            </div>
        </div>
    );
};
