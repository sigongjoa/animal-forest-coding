import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-java';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme

interface FeedbackResult {
    passed: boolean;
    message: string;
    output: string[];
}

interface MissionIDEEditorProps {
    code: string;
    onChange: (code: string) => void;
    onValidate: () => void;
    isValidating: boolean;
    feedback?: FeedbackResult;
}

export const MissionIDEEditor: React.FC<MissionIDEEditorProps> = ({
    code,
    onChange,
    onValidate,
    isValidating,
    feedback
}) => {
    // Memoize the highlight function to prevent unnecessary re-renders
    const highlightCode = useCallback((code: string) => {
        return highlight(code, languages.java, 'java');
    }, []);

    // Memoize the reset handler
    const handleReset = useCallback(() => {
        onChange('');
    }, [onChange]);

    // Memoize the feedback output rendering
    const feedbackOutput = useMemo(() => {
        if (!feedback?.output || feedback.output.length === 0) {
            return <div className="text-gray-500 italic">No output generated.</div>;
        }

        return feedback.output.map((line: string, i: number) => (
            <div
                key={i}
                className={`${
                    line.startsWith('Error') ||
                    line.startsWith('Exception') ||
                    line.includes('error:')
                        ? 'text-red-400'
                        : 'text-gray-300'
                } whitespace-pre-wrap`}
            >
                <span className="opacity-50 mr-2 select-none">$</span>
                {line}
            </div>
        ));
    }, [feedback]);

    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden text-white shadow-2xl">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-gray-300">Solution.java</span>
                    <span className="text-xs bg-gray-700 text-yellow-400 px-1.5 py-0.5 rounded">Java</span>
                </div>
                <div className="flex space-x-2">
                    <button
                        className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
                        onClick={handleReset}
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Code Area */}
            <div className="flex-1 relative overflow-hidden bg-[#2d2d2d]">
                {/* Background color matches prism-tomorrow usually */}
                <div className="absolute inset-0 overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    <Editor
                        value={code}
                        onValueChange={onChange}
                        highlight={highlightCode}
                        padding={20}
                        className="min-h-full font-mono text-sm leading-6"
                        style={{
                            fontFamily: '"Fira Code", "Fira Mono", monospace',
                            fontSize: 14,
                        }}
                        textareaClassName="focus:outline-none"
                    />
                </div>
            </div>

            {/* Feedback & Console Area */}
            {(feedback || isValidating) && (
                <div className="border-t border-gray-700 bg-black flex flex-col max-h-60 shrink-0">
                    <div className="px-4 py-1 bg-gray-800 border-b border-gray-700 flex items-center justify-between sticky top-0 z-10">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Console Output</span>
                        {feedback && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${feedback.passed ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                {feedback.passed ? 'BUILD SUCCESS' : 'BUILD FAILED'}
                            </span>
                        )}
                    </div>

                    <div className="p-4 overflow-y-auto font-mono text-xs space-y-1 h-full scrollbar-thin scrollbar-thumb-gray-700">
                        {isValidating ? (
                            <div className="flex items-center text-yellow-400 animate-pulse">
                                <span className="mr-2">⚡</span> Compiling and running code...
                            </div>
                        ) : feedback ? (
                            <>
                                {feedbackOutput}

                                <div className={`mt-4 pt-2 border-t border-gray-800 ${feedback.passed ? 'text-green-400' : 'text-red-400'} font-semibold`}>
                                    {feedback.passed ? '✓' : '⚠'} {feedback.message}
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Action Bar */}
            <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-end">
                <button
                    onClick={onValidate}
                    disabled={isValidating}
                    className={`px-6 py-2 rounded-lg font-bold transition-all transform active:scale-95 ${isValidating
                        ? 'bg-gray-600 cursor-not-allowed opacity-50'
                        : 'bg-green-600 hover:bg-green-500 shadow-lg hover:shadow-green-500/20 text-white'
                        }`}
                >
                    {isValidating ? 'Executing...' : 'Run Code ▶'}
                </button>
            </div>
        </div>
    );
};
