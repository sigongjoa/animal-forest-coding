import React from 'react';

interface MissionIDEEditorProps {
    code: string;
    onChange: (code: string) => void;
    onValidate: () => void;
    isValidating: boolean;
    feedback?: any;
}

export const MissionIDEEditor: React.FC<MissionIDEEditorProps> = ({
    code,
    onChange,
    onValidate,
    isValidating,
    feedback
}) => {
    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden text-white">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-sm font-mono text-gray-300">script.js</span>
                <div className="flex space-x-2">
                    <button
                        className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                        onClick={() => onChange('')} // Reset logic could be better
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Code Area */}
            <div className="flex-1 relative">
                <textarea
                    value={code}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-full bg-gray-900 text-gray-100 font-mono p-4 resize-none focus:outline-none text-sm leading-6"
                    spellCheck={false}
                    placeholder="// Write your code here..."
                />
            </div>

            {/* Feedback Area (if exists) */}
            {feedback && (
                <div className={`p-4 border-t ${feedback.passed ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'}`}>
                    <div className="flex items-start">
                        <span className={`text-xl mr-2 ${feedback.passed ? 'text-green-400' : 'text-red-400'}`}>
                            {feedback.passed ? '✓' : '⚠'}
                        </span>
                        <div>
                            <h4 className={`font-bold ${feedback.passed ? 'text-green-400' : 'text-red-400'}`}>
                                {feedback.passed ? 'Success!' : 'Needs Improvement'}
                            </h4>
                            <p className="text-sm text-gray-300 mt-1">{feedback.message}</p>
                            {feedback.suggestions && (
                                <ul className="mt-2 list-disc list-inside text-xs text-gray-400">
                                    {feedback.suggestions.map((s: string, i: number) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Action Bar */}
            <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-end">
                <button
                    onClick={onValidate}
                    disabled={isValidating}
                    className={`px-6 py-2 rounded-lg font-bold transition-all ${isValidating
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-500 shadow-lg hover:shadow-green-500/20'
                        }`}
                >
                    {isValidating ? 'Checking...' : 'Run Code ▶'}
                </button>
            </div>
        </div>
    );
};
