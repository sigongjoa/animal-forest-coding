import { useState, useEffect, useCallback } from 'react';

export type Direction = 'down' | 'left' | 'right' | 'up';

interface Position {
    x: number;
    y: number;
}

interface UseCharacterMovementProps {
    initialPosition?: Position;
    stepSize?: number;
    bounds?: { width: number; height: number }; // 이동 가능 범위 (옵션)
}

export const useCharacterMovement = ({
    initialPosition = { x: 0, y: 0 },
    stepSize = 4,
}: UseCharacterMovementProps = {}) => {
    const [position, setPosition] = useState<Position>(initialPosition);
    const [direction, setDirection] = useState<Direction>('down');
    const [isMoving, setIsMoving] = useState(false);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            // 화살표 키 또는 WASD
            if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) return;

            e.preventDefault(); // 스크롤 방지
            setIsMoving(true);

            setPosition((prev) => {
                let newPos = { ...prev };

                switch (e.key) {
                    case 'ArrowUp':
                    case 'w':
                    case 'W':
                        setDirection('up');
                        newPos.y -= stepSize;
                        break;
                    case 'ArrowDown':
                    case 's':
                    case 'S':
                        setDirection('down');
                        newPos.y += stepSize;
                        break;
                    case 'ArrowLeft':
                    case 'a':
                    case 'A':
                        setDirection('left');
                        newPos.x -= stepSize;
                        break;
                    case 'ArrowRight':
                    case 'd':
                    case 'D':
                        setDirection('right');
                        newPos.x += stepSize;
                        break;
                }
                return newPos;
            });
        },
        [stepSize]
    );

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
            setIsMoving(false);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    return { position, direction, isMoving };
};
