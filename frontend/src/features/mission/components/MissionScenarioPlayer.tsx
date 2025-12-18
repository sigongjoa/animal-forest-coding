import React, { useState, useEffect } from 'react';
import { MissionScenario, ScriptAction } from '../../../types/Mission';
import SpriteCharacter from '../../../components/SpriteCharacter';
import { Direction } from '../../../hooks/useCharacterMovement';
import { useAudio } from '../../../hooks/useAudio';
import { getAssetPath } from '../../../utils/assetUtils';

interface MissionScenarioPlayerProps {
    scenario: MissionScenario;
    onComplete: () => void;
}

const MissionScenarioPlayer: React.FC<MissionScenarioPlayerProps> = ({
    scenario,
    onComplete,
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [characters, setCharacters] = useState(scenario.setting.characters);
    const [currentDialogue, setCurrentDialogue] = useState<{ speaker: string; text: string } | null>(null);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [activeEmotes, setActiveEmotes] = useState<{ [key: string]: string }>({});
    const [movingCharacters, setMovingCharacters] = useState<Set<string>>(new Set());
    const [charTransitionTimes, setCharTransitionTimes] = useState<{ [key: string]: number }>({});
    const [activeAnimations, setActiveAnimations] = useState<{ [key: string]: string }>({});

    const { generateAudio, playAudio, stopAudio, audioRef } = useAudio();

    const processAction = async (action: ScriptAction) => {
        switch (action.type) {
            case 'wait':
                await new Promise((resolve) => setTimeout(resolve, action.duration));
                nextStep();
                break;

            case 'move':
                const duration = action.speed === 'run' ? 500 : 1000;

                // Start movement animation
                setCharTransitionTimes(prev => ({ ...prev, [action.target]: duration }));
                setMovingCharacters((prev) => {
                    const next = new Set(prev);
                    next.add(action.target);
                    return next;
                });

                // Update character position
                setCharacters((prev) =>
                    prev.map((char) => {
                        if (char.id === action.target) {
                            // Determine direction based on movement
                            const dx = action.to.x - char.initialPosition.x;
                            const dy = action.to.y - char.initialPosition.y;
                            let newDir: Direction = char.direction;
                            if (Math.abs(dx) > Math.abs(dy)) {
                                newDir = dx > 0 ? 'right' : 'left';
                            } else if (dy !== 0) {
                                newDir = dy > 0 ? 'down' : 'up';
                            }

                            return {
                                ...char,
                                initialPosition: action.to,
                                direction: newDir,
                            };
                        }
                        return char;
                    })
                );

                // Wait for movement to finish
                await new Promise((resolve) => setTimeout(resolve, duration));

                // Stop movement animation
                setMovingCharacters((prev) => {
                    const next = new Set(prev);
                    next.delete(action.target);
                    return next;
                });

                nextStep();
                break;

            case 'emote':
                setActiveEmotes((prev) => ({ ...prev, [action.target]: action.emoji }));
                await new Promise((resolve) => setTimeout(resolve, 1000));
                // Remove emote
                setActiveEmotes((prev) => {
                    const next = { ...prev };
                    delete next[action.target];
                    return next;
                });
                nextStep();
                break;

            case 'dialogue':
                setCurrentDialogue({ speaker: action.speaker, text: action.text });
                // User must click to advance
                break;

            case 'transition':
                if (action.mode === 'IDE') {
                    onComplete();
                }
                nextStep();
                break;

            case 'animation':
                setActiveAnimations((prev) => ({ ...prev, [action.target]: action.animation }));
                await new Promise((resolve) => setTimeout(resolve, action.duration || 1000));
                // Remove animation
                setActiveAnimations((prev) => {
                    const next = { ...prev };
                    delete next[action.target];
                    return next;
                });
                nextStep();
                break;

            case 'effect':
                console.log('Playing effect:', action.effectName);
                // TODO: Implement actual sound effect playback
                nextStep();
                break;
        }
    };

    // Skip on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                stopAudio();
                onComplete();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onComplete, stopAudio]);

    const nextStep = () => {
        setCurrentStep((prev) => prev + 1);
    };

    // Run script whenever step changes
    useEffect(() => {
        if (currentStep < scenario.script.length) {
            processAction(scenario.script[currentStep]);
        }
    }, [currentStep]);

    // Typewriter effect & Audio
    useEffect(() => {
        if (currentDialogue) {
            setDisplayedText('');
            setIsTyping(true);

            // Play audio
            const playDialogueAudio = async () => {
                const url = await generateAudio(currentDialogue.text, currentDialogue.speaker);
                if (url) {
                    playAudio(url);
                }
            };
            playDialogueAudio();

            let index = 0;
            const fullText = currentDialogue.text;

            const timer = setInterval(() => {
                if (index < fullText.length) {
                    index++;
                    setDisplayedText(fullText.slice(0, index));
                } else {
                    setIsTyping(false);
                    clearInterval(timer);
                }
            }, 30); // Speed: 30ms per char

            return () => {
                clearInterval(timer);
                stopAudio();
            };
        } else {
            setDisplayedText('');
            setIsTyping(false);
            stopAudio();
        }
    }, [currentDialogue, generateAudio, playAudio, stopAudio]);

    const handleDialogueClick = () => {
        if (currentDialogue) {
            if (isTyping) {
                // Instant complete
                setDisplayedText(currentDialogue.text);
                setIsTyping(false);
                // We keep audio playing even if text completes instantly, or we could stop it.
                // Animal crossing usually keeps sound unless next dialogue starts.
            } else {
                // Next
                setCurrentDialogue(null);
                nextStep();
            }
        }
    };

    return (
        <div
            className="relative w-full h-[600px] bg-cover bg-center overflow-hidden rounded-lg shadow-lg"
            style={{ backgroundImage: `url(${getAssetPath(scenario.setting.background)})` }}
        >
            <audio ref={audioRef} />
            {/* Characters */}
            {characters.map((char) => (
                <div key={char.id} className={`relative ${activeAnimations[char.id] ? getAnimationClass(activeAnimations[char.id]!) : ''}`}>
                    <SpriteCharacter
                        position={char.initialPosition}
                        direction={char.direction || 'down'}
                        isMoving={movingCharacters.has(char.id)}
                        spriteUrl={getAssetPath(char.sprite)}
                        scale={char.scale || 2}
                        transitionDuration={charTransitionTimes[char.id] || 100}
                    />
                    {/* Emote Bubble */}
                    {activeEmotes[char.id] && (
                        <div
                            className="absolute text-4xl animate-bounce"
                            style={{
                                left: char.initialPosition.x + 10,
                                top: char.initialPosition.y - 50,
                                zIndex: 50
                            }}
                        >
                            {activeEmotes[char.id]}
                        </div>
                    )}
                </div>
            ))}

            {/* Dialogue Box */}
            {currentDialogue && (
                <div
                    data-testid="dialogue-box"
                    className="absolute bottom-4 left-4 right-4 bg-white/90 border-4 border-amber-800 p-4 rounded-xl cursor-pointer hover:bg-white transition-colors"
                    onClick={handleDialogueClick}
                >
                    <div className="font-bold text-amber-900 mb-1 uppercase">
                        {currentDialogue.speaker}
                    </div>
                    <div className="text-lg text-gray-900 font-medium min-h-[1.75em]">
                        {displayedText}
                        {isTyping && <span className="animate-pulse">|</span>}
                    </div>
                    {!isTyping && (
                        <div className="absolute bottom-2 right-4 text-amber-600 animate-pulse">
                            ▼ Click to continue
                        </div>
                    )}
                </div>
            )}
            {/* Skip Button */}
            <button
                onClick={() => {
                    stopAudio();
                    onComplete();
                }}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold z-50 transition-colors"
            >
                SKIP ⏩
            </button>
        </div>

    );
};

const getAnimationClass = (anim: string) => {
    switch (anim) {
        case 'jump': return 'animate-bounce';
        case 'spin': return 'animate-spin';
        case 'shake': return 'animate-shake';
        case 'bounce': return 'animate-bounce';
        case 'wiggle': return 'animate-wiggle';
        default: return '';
    }
};

const styles = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    .animate-shake {
        animation: shake 0.5s ease-in-out infinite;
    }
    @keyframes wiggle {
        0%, 100% { transform: rotate(-3deg); }
        50% { transform: rotate(3deg); }
    }
    .animate-wiggle {
        animation: wiggle 0.3s ease-in-out infinite;
    }
`;

// Append styles to head if not exists (simple hack for this component)
if (typeof document !== 'undefined') {
    const styleId = 'mission-scenario-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = styles;
        document.head.appendChild(style);
    }
}

export default MissionScenarioPlayer;
