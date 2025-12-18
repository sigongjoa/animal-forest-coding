import React, { useEffect, useState } from 'react';
import { useAudio } from '../../../hooks/useAudio';
import SpriteCharacter from '../../../components/SpriteCharacter';
import { getAssetPath } from '../../../utils/assetUtils';

interface NookCompanionProps {
    status: 'idle' | 'thinking' | 'talking' | 'happy' | 'concerned';
    message?: string;
    visible: boolean;
}

const NookCompanion: React.FC<NookCompanionProps> = ({ status, message, visible }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Using the same audio hook as in MissionScenarioPlayer
    const { generateAudio, playAudio, stopAudio } = useAudio();

    // Reset when message changes
    useEffect(() => {
        if (message && visible) {
            setDisplayedText('');
            setIsTyping(true);

            // Generate and play audio for the feedback
            const playFeedbackAudio = async () => {
                // Determine tone based on status
                let characterId = 'nook'; // Default
                if (status === 'happy') characterId = 'nook'; // Logic could be expanded

                const url = await generateAudio(message, characterId);
                if (url) {
                    playAudio(url);
                }
            };
            playFeedbackAudio();

            let index = 0;
            const timer = setInterval(() => {
                if (index < message.length) {
                    index++;
                    setDisplayedText(message.slice(0, index));
                } else {
                    setIsTyping(false);
                    clearInterval(timer);
                    stopAudio(); // Stop audio when typing ends (optional choice)
                }
            }, 30); // 30ms typing speed

            return () => {
                clearInterval(timer);
                stopAudio();
            };
        } else {
            setDisplayedText('');
            setIsTyping(false);
        }
    }, [message, visible, generateAudio, playAudio, stopAudio, status]);

    if (!visible) return null;

    // Determine sprite image based on status
    const getSpriteUrl = () => {
        // Assuming sprite sheet logic or static images. For now using static asset.
        return getAssetPath('/assets/character/nook.png');
    };

    // Determine emotion/animation class
    const getAnimationClass = () => {
        switch (status) {
            case 'thinking': return 'animate-pulse';
            case 'happy': return 'animate-bounce';
            case 'concerned': return 'animate-shake'; // minimal shake custom keyframes needed or simple wiggle
            case 'talking': return 'animate-pulse'; // subtle pulse
            default: return '';
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none">
            {/* Dialogue Bubble */}
            {message && (
                <div className="bg-white border-4 border-amber-800 rounded-xl p-4 mb-2 max-w-xs shadow-xl relative animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
                    <div className="text-amber-900 font-bold mb-1 text-sm">TOM NOOK</div>
                    <div className="text-gray-800 text-sm leading-relaxed">
                        {displayedText}
                        {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-amber-600 animate-blink align-middle"></span>}
                    </div>
                    {/* Speech Bubble Tail */}
                    <div className="absolute -bottom-3 right-8 w-4 h-4 bg-white border-b-4 border-r-4 border-amber-800 transform rotate-45"></div>
                </div>
            )}
            {/* Avatar using SpriteCharacter for animation */}
            <div className={`relative w-32 h-32 transition-transform duration-300 ${getAnimationClass()}`}>
                {/* Shadow */}
                <div className="absolute bottom-6 w-16 h-4 bg-black/20 rounded-full blur-sm left-8"></div>

                <div className="absolute top-0 left-4">
                    <SpriteCharacter
                        position={{ x: 0, y: 0 }}
                        direction='left'
                        isMoving={status === 'talking' || isTyping} // Walk/Move animation when talking
                        spriteUrl={getAssetPath('/assets/character/nook.png')}
                        scale={2} // Adjust scale as needed
                    />
                </div>

                {/* Status Indicator (Optional) */}
                {status === 'thinking' && (
                    <div className="absolute top-0 right-8 text-3xl animate-bounce">💭</div>
                )}
                {status === 'happy' && (
                    <div className="absolute top-0 right-8 text-3xl animate-bounce">💰</div>
                )}
                {status === 'concerned' && (
                    <div className="absolute top-0 right-8 text-3xl animate-pulse">💦</div>
                )}
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out infinite;
                }
                .animate-blink {
                    animation: blink 1s step-end infinite;
                }
                @keyframes blink {
                    50% { opacity: 0; }
                }
            `}</style>
        </div >
    );
};

export default NookCompanion;
