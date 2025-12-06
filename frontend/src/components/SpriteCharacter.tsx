import React, { useEffect, useState } from 'react';
import { Direction } from '../hooks/useCharacterMovement';
import { makeImageTransparent } from '../utils/imageUtils';

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
    const [processedUrl, setProcessedUrl] = useState<string>(spriteUrl);

    // 이미지 투명화 처리
    useEffect(() => {
        let isMounted = true;

        // 기본 URL 먼저 설정 (로딩 중 깜빡임 방지용, 혹은 로딩 상태 표시)
        // setProcessedUrl(spriteUrl); 

        makeImageTransparent(spriteUrl)
            .then(url => {
                if (isMounted) setProcessedUrl(url);
            })
            .catch(err => {
                console.error('Failed to process sprite transparency:', err);
                if (isMounted) setProcessedUrl(spriteUrl); // Fallback
            });

        return () => { isMounted = false; };
    }, [spriteUrl]);

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

    // background-position 계산
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
                backgroundImage: `url(${processedUrl})`, // Use processedUrl
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
