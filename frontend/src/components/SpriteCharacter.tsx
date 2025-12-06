import React, { useEffect, useState } from 'react';
import { Direction } from '../hooks/useCharacterMovement';

interface SpriteCharacterProps {
    position: { x: number; y: number };
    direction: Direction;
    isMoving: boolean;
    spriteUrl?: string; // override default
    scale?: number;
}

const FRAME_COUNT = 4; // 가로 4프레임 가정
const ANIMATION_SPEED = 150; // ms per frame

// 스프라이트 시트의 행(Row) 매핑 (생성된 이미지에 따라 조절 필요)
// 보통: 0: Down, 1: Left, 2: Right, 3: Up
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

    // 스프라이트 크기 가정 (생성된 이미지가 1024x1024라면 4x4 -> 256x256)
    // 실제 이미지를 보고 조정해야 하지만, 일단 CSS background-size로 처리.
    // 4x4 그리드이므로, width/height는 전체의 25% (100% / 4)

    const spriteSize = 64; // 화면에 표시될 픽셀 크기

    // background-position 계산
    // x: frame index * 100% / (FRAME_COUNT - 1) ...? no.
    // CSS spritesheet calc:
    // width: 400% (4 frames), height: 400% (4 rows)
    // pos-x: frame * (100 / 3)% -> 0%, 33.3%, 66.6%, 100%
    // pos-y: row * (100 / 3)%

    // 더 쉬운 방법: 픽셀 단위 계산 (이미지 크기를 모를 때 곤란)
    // 퍼센트 단위 계산:
    // background-size: 400% 400% (전체 이미지가 컨테이너의 4배 크기)
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
                backgroundImage: `url(${spriteUrl})`,
                backgroundSize: '400% 400%', // 4 columns, 4 rows
                backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                backgroundRepeat: 'no-repeat',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                imageRendering: 'pixelated', // 픽셀 아트 선명하게
                zIndex: 10,
                transition: 'left 0.1s linear, top 0.1s linear', // 부드러운 위치 이동
            }}
        />
    );
};

export default SpriteCharacter;
