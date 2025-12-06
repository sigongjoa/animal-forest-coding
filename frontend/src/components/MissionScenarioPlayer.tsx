import React, { useState, useEffect } from 'react';
import { MissionScenario, ScriptAction } from '../types/Mission';
import SpriteCharacter from './SpriteCharacter';
import { Direction } from '../hooks/useCharacterMovement';

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
    const [activeEmotes, setActiveEmotes] = useState<{ [key: string]: string }>({});

    const processAction = async (action: ScriptAction) => {
        switch (action.type) {
            case 'wait':
                await new Promise((resolve) => setTimeout(resolve, action.duration));
                nextStep();
                break;

            case 'move':
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
                // movement duration simulation (simple)
                await new Promise((resolve) => setTimeout(resolve, 800));
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
        }
    };

    // Skip on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onComplete();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onComplete]);

    const nextStep = () => {
        setCurrentStep((prev) => prev + 1);
    };

    // Run script whenever step changes
    useEffect(() => {
        if (currentStep < scenario.script.length) {
            processAction(scenario.script[currentStep]);
        }
    }, [currentStep]);

    const handleDialogueClick = () => {
        if (currentDialogue) {
            setCurrentDialogue(null);
            nextStep();
        }
    };

    return (
        <div
            className="relative w-full h-[600px] bg-cover bg-center overflow-hidden rounded-lg shadow-lg"
            style={{ backgroundImage: `url(${scenario.setting.background})` }}
        >
            {/* Characters */}
            {characters.map((char) => (
                <div key={char.id} className="relative">
                    <SpriteCharacter
                        position={char.initialPosition}
                        direction={char.direction || 'down'}
                        isMoving={false} // Script based movement is snappy for now, or use css transition wrapper
                        spriteUrl={char.sprite}
                        scale={char.scale || 2}
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
                    <div className="text-lg text-gray-900 font-medium">
                        {currentDialogue.text}
                    </div>
                    <div className="absolute bottom-2 right-4 text-amber-600 animate-pulse">
                        ▼ Click to continue
                    </div>
                </div>
            )}
            {/* Skip Button */}
            <button
                onClick={onComplete}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold z-50 transition-colors"
            >
                SKIP ⏩
            </button>
        </div>
    );
};

export default MissionScenarioPlayer;
