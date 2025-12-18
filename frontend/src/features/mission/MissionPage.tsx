import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMissionProgress } from '../../hooks/useMissionProgress';
import { MissionStoryDisplay } from './components/MissionStoryDisplay';
import { MissionIDEEditor } from './components/MissionIDEEditor';
import MissionScenarioPlayer from './components/MissionScenarioPlayer';
import NookCompanion from './components/NookCompanion';
import { selectProgression } from '../../store/slices/progressionSlice';
import { MissionScenario, ScriptAction } from '../../types/Mission';
import { TileGridRenderer } from '../../components/TileGridRenderer';

const MissionPage: React.FC = () => {
    const { missionId } = useParams<{ missionId: string }>();
    const navigate = useNavigate();
    const progression = useSelector(selectProgression);
    const studentId = progression.studentId || 'guest';

    const {
        mission,
        currentStep,
        currentStepIndex,
        code,
        setCode,
        feedback,
        loading,
        validating,
        error,
        submitCode,
        nextStep,
        isLastStep
    } = useMissionProgress({ missionId: missionId || '', studentId });

    const [viewMode, setViewMode] = useState<'story' | 'ide'>('story');
    const [leftTab, setLeftTab] = useState<'info' | 'island'>('info');
    const [activeScenario, setActiveScenario] = useState<MissionScenario | null>(null);

    // Scenario Management (Intro & Per-Step)
    React.useEffect(() => {
        const isCompleted = progression.completedMissions.includes(missionId || '');

        // Priority 1: Current Step Scenario (triggers on step change)
        if (currentStep?.scenario) {
            setActiveScenario(currentStep.scenario);
            setViewMode('story');
            return;
        }

        // Priority 2: Mission Global Intro (only on first step/load)
        if (mission?.scenario && !isCompleted && currentStepIndex === 0) {
            setActiveScenario(mission.scenario);
            setViewMode('story');
        }
    }, [mission, currentStep, currentStepIndex, progression.completedMissions, missionId]);

    // Feedback Reaction System
    React.useEffect(() => {
        if (feedback && mission?.scenario?.setting) {
            const isSuccess = feedback.passed;
            const dialogues = isSuccess
                ? mission.storyContext?.successDialogue
                : mission.storyContext?.failureDialogue;

            if (dialogues && dialogues.length > 0) {
                const feedbackScript: ScriptAction[] = [
                    { type: 'wait', duration: 500 },
                    { type: 'move', target: 'nook', to: { x: 300, y: 200 }, speed: 'run' },
                    { type: 'emote', target: 'nook', emoji: isSuccess ? '😊' : '😱' },
                    ...dialogues.map(text => ({
                        type: 'dialogue',
                        speaker: 'nook',
                        text: text,
                        emotion: isSuccess ? 'happy' : 'shocked'
                    } as ScriptAction)),
                    { type: 'transition', mode: 'IDE' }
                ];

                setActiveScenario({
                    setting: mission.scenario.setting,
                    script: feedbackScript
                });
                setViewMode('story');
            }
        }
    }, [feedback, mission]);

    const getNookStatus = () => {
        if (validating) return 'thinking';
        if (feedback?.passed) return 'happy';
        if (feedback && !feedback.passed) return 'concerned';
        return 'idle';
    };

    const getNookMessage = () => {
        if (validating) return "Let me check your code, yes, yes...";
        if (feedback?.passed) return "Wonderful! That's exactly right!";
        if (feedback && !feedback.passed) return feedback.message || "Hmm... something is not quite right.";
        return undefined;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-green-50">
                <div className="text-2xl font-bold text-green-600 animate-pulse">Loading Mission...</div>
            </div>
        );
    }

    if (error || !mission) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-red-50">
                <div className="text-xl text-red-600 mb-4">{error || 'Mission not found'}</div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                    Back to Map
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between z-10">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">
                        ← Back
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">{mission.title}</h1>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full uppercase font-semibold">
                        {mission.difficulty}
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                        Step {currentStepIndex + 1} / {mission.steps.length}
                    </div>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${((currentStepIndex + 1) / mission.steps.length) * 100}%` }}
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden relative">
                {viewMode === 'story' && activeScenario ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                        <div className="w-full max-w-4xl p-4">
                            <MissionScenarioPlayer
                                scenario={activeScenario}
                                onComplete={() => setViewMode('ide')}
                            />
                        </div>
                    </div>
                ) : viewMode === 'story' && mission?.storyContext ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                        <MissionStoryDisplay
                            introImage={mission.storyContext.introImage}
                            dialogue={mission.storyContext.introDialogue}
                            onComplete={() => setViewMode('ide')}
                        />
                    </div>
                ) : null}

                {viewMode === 'ide' ? (
                    <div className="flex h-full relative">
                        {/* Left Panel */}
                        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col z-10">
                            {/* Tabs */}
                            <div className="flex border-b border-gray-200">
                                <button
                                    onClick={() => setLeftTab('info')}
                                    className={`flex-1 py-3 text-sm font-bold ${leftTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Mission Info
                                </button>
                                <button
                                    onClick={() => setLeftTab('island')}
                                    className={`flex-1 py-3 text-sm font-bold ${leftTab === 'island' ? 'text-green-600 border-b-2 border-green-600 bg-green-50' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    My Island 🏝️
                                </button>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-y-auto p-6 pb-40">
                                {leftTab === 'island' ? (
                                    <div className="flex flex-col items-center justify-center min-h-[300px]">
                                        <TileGridRenderer />
                                        <p className="mt-4 text-xs text-gray-400 text-center">
                                            Your code affects this island.<br />Try running code to see changes!
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                            {currentStep?.title}
                                        </h2>
                                        {/* Rich Chat-Style Description Renderer */}
                                        <div className="space-y-4 mb-8">
                                            {currentStep?.description.split('\n\n').map((line, idx) => {
                                                const dialogueMatch = line.match(/^\*\*(.+?):\*\*\s*(.*)$/);
                                                if (dialogueMatch) {
                                                    const speaker = dialogueMatch[1].trim();
                                                    const text = dialogueMatch[2].replace(/^"|"$/g, '');
                                                    const isPlayer = speaker === 'Noob' || speaker === 'Me';

                                                    return (
                                                        <div key={idx} className={`flex ${isPlayer ? 'justify-end' : 'justify-start'}`}>
                                                            {!isPlayer && (
                                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 text-xs font-bold shrink-0 shadow-sm border border-gray-300">
                                                                    {speaker[0]}
                                                                </div>
                                                            )}
                                                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${isPlayer
                                                                ? 'bg-blue-100 text-blue-900 rounded-tr-none'
                                                                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                                                }`}>
                                                                <div className="font-bold text-xs mb-1 opacity-70">{speaker}</div>
                                                                <div>{text}</div>
                                                            </div>
                                                            {isPlayer && (
                                                                <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center ml-2 text-xs font-bold shrink-0 shadow-sm border border-blue-300">
                                                                    N
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                }

                                                const sceneMatch = line.match(/^\*\*\((.+?)\)\*\*$/);
                                                if (sceneMatch) {
                                                    return (
                                                        <div key={idx} className="text-center text-xs text-gray-400 italic my-4 bg-gray-50 py-1 rounded-full">
                                                            {sceneMatch[1]}
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <p key={idx} className="text-gray-600 text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                        {line}
                                                    </p>
                                                );
                                            })}
                                        </div>

                                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                                            <h3 className="font-bold text-blue-700 mb-2">Mission Goal</h3>
                                            <p className="text-blue-600 text-sm">
                                                {currentStep?.prompt}
                                            </p>
                                        </div>

                                        {feedback?.passed && (
                                            <div className="mt-8">
                                                <button
                                                    onClick={isLastStep ? () => navigate('/dashboard') : nextStep}
                                                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg transform transition hover:-translate-y-1"
                                                >
                                                    {isLastStep ? 'Complete Mission 🎉' : 'Next Step →'}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right Panel: IDE */}
                        <div className="w-2/3 p-4 bg-gray-900">
                            <MissionIDEEditor
                                code={code}
                                onChange={setCode}
                                onValidate={submitCode}
                                isValidating={validating}
                                feedback={feedback}
                            />
                        </div>

                    </div>
                ) : null}

                {/* Nook Companion Overlay */}
                {viewMode === 'ide' && (
                    <NookCompanion
                        visible={true}
                        status={getNookStatus()}
                        message={getNookMessage()}
                    />
                )}
            </main>
        </div>
    );
};

export default MissionPage;
