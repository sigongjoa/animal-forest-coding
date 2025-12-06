import React from 'react';
import SpriteCharacter from '../components/SpriteCharacter';
import { useCharacterMovement } from '../hooks/useCharacterMovement';

const PlaygroundPage: React.FC = () => {
    const { position, direction, isMoving } = useCharacterMovement({
        initialPosition: { x: 100, y: 100 },
        stepSize: 8,
    });

    return (
        <div className="w-full h-screen bg-green-200 relative overflow-hidden">
            <div className="absolute top-4 left-4 bg-white p-4 rounded shadow z-50">
                <h2 className="text-xl font-bold mb-2">🎮 Character Movement Test</h2>
                <p>Use Arrow Keys or WASD to move.</p>
                <div className="mt-2 text-sm text-gray-600">
                    <p>X: {Math.round(position.x)}, Y: {Math.round(position.y)}</p>
                    <p>Direction: {direction}</p>
                    <p>Moving: {isMoving ? 'Yes' : 'No'}</p>
                </div>
            </div>

            {/* Grid Pattern based background for depth */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }}
            />

            <SpriteCharacter
                position={position}
                direction={direction}
                isMoving={isMoving}
                scale={2}
            />
        </div>
    );
};

export default PlaygroundPage;
