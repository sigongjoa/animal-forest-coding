import React from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">⚙️ Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Sound Settings */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-700">Audio</h3>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">Background Music</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">Sound Effects</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-700">Account</h3>
                        <button className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors font-medium text-left px-4 flex justify-between items-center">
                            <span>Reset Progress</span>
                            <span className="text-sm opacity-70">⚠️ Irreversible</span>
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="mt-8 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-md transition-transform active:scale-95"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};
