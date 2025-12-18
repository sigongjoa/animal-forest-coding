import { getAssetPath } from '../../../utils/assetUtils';

// ... (inside component) ...

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
                    spriteUrl={char.sprite}
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
