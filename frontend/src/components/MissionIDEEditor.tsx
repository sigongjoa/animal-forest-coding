import React, { useRef, useEffect } from 'react';

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
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const cursorPositionRef = useRef<number | null>(null);

    // Restore cursor position after state update
    useEffect(() => {
        if (cursorPositionRef.current !== null && textareaRef.current) {
            textareaRef.current.selectionStart = cursorPositionRef.current;
            textareaRef.current.selectionEnd = cursorPositionRef.current;
            cursorPositionRef.current = null;
        }
    }, [code]);

    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden text-white">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-sm font-mono text-gray-300">script.js</span>
                <div className="flex space-x-2">
                    <button
                        className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                        onClick={() => onChange('')}
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Code Area */}
            <div className="flex-1 relative">
                <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Tab') {
                            e.preventDefault();
                            const target = e.currentTarget;
                            const start = target.selectionStart;
                            const end = target.selectionEnd;
                            const value = target.value;

                            // Insert 4 spaces for tab
                            const newValue = value.substring(0, start) + '    ' + value.substring(end);

                            // Save desired cursor position
                            cursorPositionRef.current = start + 4;

                            onChange(newValue);
                        }
                    }}
                    className="w-full h-full bg-gray-900 text-gray-100 font-mono p-4 resize-none focus:outline-none text-sm leading-6"
                    spellCheck={false}
                    placeholder="// Write your code here..."
                />
            </div>

            {/* Feedback & Console Area */}
            {(feedback || isValidating) && (
                <div className="border-t border-gray-700 bg-black flex flex-col max-h-60">
                    <div className="px-4 py-1 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Console Output</span>
                        {feedback && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${feedback.passed ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                {feedback.passed ? 'BUILD SUCCESS' : 'BUILD FAILED'}
                            </span>
                        )}
                    </div>

                    <div className="p-4 overflow-y-auto font-mono text-xs space-y-1">
                        {isValidating ? (
                            <div className="text-yellow-400 animate-pulse">Compiling and running code...</div>
                        ) : (
                            <>
                                {feedback?.output && feedback.output.length > 0 ? (
                                    feedback.output.map((line: string, i: number) => (
                                        <div key={i} className={`${line.startsWith('Error') || line.startsWith('Exception') ? 'text-red-400' : 'text-gray-300'}`}>
                                            <span className="opacity-50 mr-2">$</span>
                                            {line}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500 italic">No output generated.</div>
                                )}

                                <div className={`mt-4 pt-2 border-t border-gray-800 ${feedback.passed ? 'text-green-400' : 'text-red-400'}`}>
                                    {feedback.passed ? '✓' : '⚠'} {feedback.message}
                                </div>
                            </>
                        )}
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
