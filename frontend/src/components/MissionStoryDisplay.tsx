import React from 'react';

interface MissionStoryDisplayProps {
    introImage?: string;
    dialogue?: string[];
    characterName?: string;
    onComplete?: () => void;
}

export const MissionStoryDisplay: React.FC<MissionStoryDisplayProps> = ({
    introImage,
    dialogue = [],
    characterName = 'Tom Nook',
    onComplete
}) => {
    const [dialogueIndex, setDialogueIndex] = React.useState(0);

    const handleNext = () => {
        if (dialogueIndex < dialogue.length - 1) {
            setDialogueIndex(prev => prev + 1);
        } else {
            onComplete?.();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
            {introImage ? (
                <div className="mb-6 w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                        src={introImage}
                        alt="Mission Scene"
                        className="object-cover w-full h-full"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-amber-100', 'to-amber-200');
                            e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<div class="text-4xl">🏝️</div>');
                        }}
                    />
                </div>
            ) : (
                <div className="mb-6 w-full h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <div className="text-6xl">🌲</div>
                </div>
            )}

            <div className="w-full bg-amber-50 border-2 border-amber-200 rounded-lg p-4 relative">
                <div className="absolute -top-3 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {characterName}
                </div>

                <p className="mt-2 text-lg text-gray-800 min-h-[3rem]">
                    {dialogue[dialogueIndex]}
                </p>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleNext}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-medium"
                    >
                        {dialogueIndex < dialogue.length - 1 ? 'Next ▶' : 'Start Mission 🚀'}
                    </button>
                </div>
            </div>
        </div>
    );
};
