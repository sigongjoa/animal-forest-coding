import React, { useEffect, useState } from 'react';
import { Direction } from '../hooks/useCharacterMovement';

interface SpriteCharacterProps {
    position: { x: number; y: number };
    direction: Direction;
    isMoving: boolean;
    spriteUrl?: string; // override default
    scale?: number;
    transitionDuration?: number;
}

const FRAME_COUNT = 4; // 가로 4프레임 가정
const ANIMATION_SPEED = 150; // ms per frame

// 스프라이트 시트의 행(Row) 매핑
const DIRECTION_ROW: Record<Direction, number> = {
    down: 0,
    left: 1,
    right: 2,
    up: 3,
};

const SpriteCharacter: React.FC<SpriteCharacterProps> = ({
    position,
    direction,
    isMoving,
    spriteUrl = '/assets/character/player.png',
    scale = 2,
    transitionDuration = 100,
}) => {
    const [frame, setFrame] = useState(0);

    // 애니메이션 루프
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isMoving) {
            interval = setInterval(() => {
                setFrame((prev) => (prev + 1) % FRAME_COUNT);
            }, ANIMATION_SPEED);
        } else {
            setFrame(0); // 멈추면 첫 프레임(정지 자세)
        }
        return () => clearInterval(interval);
    }, [isMoving]);

    const spriteSize = 64; // 화면에 표시될 픽셀 크기
    const bgPosX = frame * (100 / (FRAME_COUNT - 1));
    const bgPosY = DIRECTION_ROW[direction] * (100 / 3);

    return (
        <div
            style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                width: `${spriteSize}px`,
                height: `${spriteSize}px`,
                backgroundImage: `url(${spriteUrl})`, // Direct URL usage
                backgroundSize: '400% 400%',
                backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                backgroundRepeat: 'no-repeat',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                imageRendering: 'pixelated',
                zIndex: 10,
                transition: `left ${transitionDuration}ms linear, top ${transitionDuration}ms linear`,
            }}
        />
    );
};

export default SpriteCharacter;
