import React, { useState, useEffect, useRef, useCallback } from 'react';
import './IDEWindowManager.css';

// TypeScript 인터페이스
interface WindowPosition {
  x: number;
  y: number;
}

interface WindowSize {
  width: number;
  height: number;
}

interface IDEWindowState {
  isVisible: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: WindowPosition;
  size: WindowSize;
  previousPosition: WindowPosition;
  previousSize: WindowSize;
}

const DEFAULT_WINDOW_STATE: IDEWindowState = {
  isVisible: true,
  isMinimized: false,
  isMaximized: false,
  position: { x: 50, y: 50 },
  size: { width: 360, height: 600 },
  previousPosition: { x: 50, y: 50 },
  previousSize: { width: 360, height: 600 },
};

// 유틸리티 함수: 창 위치 제약
function constrainWindowPosition(
  position: WindowPosition,
  windowSize: WindowSize,
  screenSize: { width: number; height: number }
): WindowPosition {
  return {
    x: Math.max(0, Math.min(position.x, screenSize.width - windowSize.width)),
    y: Math.max(0, Math.min(position.y, screenSize.height - windowSize.height)),
  };
}

// 유틸리티 함수: 창 크기 제약
function constrainWindowSize(
  size: WindowSize,
  screenSize: { width: number; height: number }
): WindowSize {
  const MIN_WIDTH = 300;
  const MIN_HEIGHT = 500;
  const MAX_WIDTH = Math.min(screenSize.width - 20, 800);
  const MAX_HEIGHT = Math.min(screenSize.height - 20, 900);

  return {
    width: Math.max(MIN_WIDTH, Math.min(size.width, MAX_WIDTH)),
    height: Math.max(MIN_HEIGHT, Math.min(size.height, MAX_HEIGHT)),
  };
}

// localStorage 저장/복원
function saveWindowState(state: IDEWindowState): void {
  localStorage.setItem('ide_window_state', JSON.stringify(state));
}

function loadWindowState(): IDEWindowState | null {
  try {
    const saved = localStorage.getItem('ide_window_state');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Failed to load IDE window state:', e);
    return null;
  }
}

// 메인 컴포넌트
const IDEWindowManager: React.FC = () => {
  const [windowState, setWindowState] = useState<IDEWindowState>(() => {
    return loadWindowState() || DEFAULT_WINDOW_STATE;
  });

  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<
    'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | null
  >(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });

  const windowRef = useRef<HTMLDivElement>(null);

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 드래그 시작
  const handleTitleBarMouseDown = useCallback((e: React.MouseEvent) => {
    if (windowState.isMaximized || windowState.isMinimized) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - windowState.position.x,
      y: e.clientY - windowState.position.y,
    });
  }, [windowState.isMaximized, windowState.isMinimized, windowState.position]);

  // 리사이즈 시작
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, direction: typeof resizeDirection) => {
      if (windowState.isMaximized || windowState.isMinimized) return;
      e.preventDefault();

      setIsResizing(true);
      setResizeDirection(direction);
      setResizeStart({ x: e.clientX, y: e.clientY });
    },
    [windowState.isMaximized, windowState.isMinimized]
  );

  // 마우스 움직임
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;

      if (isDragging) {
        const newPosition = constrainWindowPosition(
          {
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y,
          },
          windowState.size,
          screenSize
        );

        setWindowState((prev) => ({
          ...prev,
          position: newPosition,
        }));
      }

      if (isResizing && resizeDirection) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        let newSize = { ...windowState.size };

        if (resizeDirection.includes('e')) {
          newSize.width += deltaX;
        }
        if (resizeDirection.includes('w')) {
          newSize.width -= deltaX;
        }
        if (resizeDirection.includes('s')) {
          newSize.height += deltaY;
        }
        if (resizeDirection.includes('n')) {
          newSize.height -= deltaY;
        }

        newSize = constrainWindowSize(newSize, screenSize);

        // 왼쪽/위쪽 리사이즈 시 위치도 조정
        let newPosition = { ...windowState.position };
        if (resizeDirection.includes('w')) {
          newPosition.x = Math.max(0, windowState.position.x + deltaX);
        }
        if (resizeDirection.includes('n')) {
          newPosition.y = Math.max(0, windowState.position.y + deltaY);
        }

        setWindowState((prev) => ({
          ...prev,
          size: newSize,
          position: newPosition,
        }));

        setResizeStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        setIsDragging(false);
        setIsResizing(false);
        setResizeDirection(null);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    dragOffset,
    windowState.position,
    windowState.size,
    resizeStart,
    resizeDirection,
    screenSize,
  ]);

  // 상태 저장
  useEffect(() => {
    const timer = setTimeout(() => {
      saveWindowState(windowState);
    }, 500);

    return () => clearTimeout(timer);
  }, [windowState]);

  // 최소화 토글
  const handleMinimize = () => {
    setWindowState((prev) => ({
      ...prev,
      isMinimized: !prev.isMinimized,
    }));
  };

  // 최대화 토글
  const handleMaximize = () => {
    if (windowState.isMaximized) {
      // 복원
      setWindowState((prev) => ({
        ...prev,
        isMaximized: false,
        position: prev.previousPosition,
        size: prev.previousSize,
      }));
    } else {
      // 최대화
      setWindowState((prev) => ({
        ...prev,
        isMaximized: true,
        previousPosition: { ...prev.position },
        previousSize: { ...prev.size },
        position: { x: 0, y: 0 },
        size: {
          width: screenSize.width,
          height: screenSize.height,
        },
      }));
    }
  };

  // 닫기
  const handleClose = () => {
    setWindowState((prev) => ({
      ...prev,
      isVisible: false,
    }));
  };

  // 재열기
  const handleReopen = () => {
    setWindowState((prev) => ({
      ...prev,
      isVisible: true,
      isMinimized: false,
    }));
  };

  // 창이 보이지 않으면 닫기 버튼만 표시
  if (!windowState.isVisible) {
    return (
      <div className="ide-closed-button">
        <button
          onClick={handleReopen}
          title="IDE 열기"
          className="ide-reopen-btn"
        >
          🚀 IDE
        </button>
      </div>
    );
  }

  // 최소화 상태
  if (windowState.isMinimized) {
    return (
      <div className="minimized-icons-bar">
        <div
          className="minimized-icon"
          onClick={handleMinimize}
          title="너굴포트 IDE 복원"
        >
          <div className="minimized-icon-label">너굴포트</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={windowRef}
      className={`ide-window ${windowState.isMaximized ? 'maximized' : ''}`}
      style={{
        left: `${windowState.position.x}px`,
        top: `${windowState.position.y}px`,
        width: `${windowState.size.width}px`,
        height: `${windowState.size.height}px`,
      }}
    >
      {/* 제목 표시줄 */}
      <div
        className="ide-window-titlebar"
        onMouseDown={handleTitleBarMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <span className="ide-window-title">너굴포트 IDE v2.0</span>
        <div className="ide-window-buttons">
          <button
            className="ide-window-btn"
            onClick={handleMinimize}
            title="최소화 (Alt+M)"
            aria-label="최소화"
          >
            −
          </button>
          <button
            className="ide-window-btn"
            onClick={handleMaximize}
            title={windowState.isMaximized ? '복원' : '최대화 (Alt+X)'}
            aria-label={windowState.isMaximized ? '복원' : '최대화'}
          >
            {windowState.isMaximized ? '🗗' : '□'}
          </button>
          <button
            className="ide-window-btn ide-close-btn"
            onClick={handleClose}
            title="닫기 (Esc)"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 창 콘텐츠 */}
      <div className="ide-window-content">
        <iframe
          src="/nookphone.html"
          className="ide-iframe"
          title="너굴포트 IDE"
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      </div>

      {/* 리사이즈 핸들들 */}
      {!windowState.isMaximized && (
        <>
          {/* 모서리 */}
          <div
            className="resize-handle resize-nw"
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
          />
          <div
            className="resize-handle resize-ne"
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
          />
          <div
            className="resize-handle resize-sw"
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
          />
          <div
            className="resize-handle resize-se"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />

          {/* 모서리 가운데 */}
          <div
            className="resize-handle resize-n"
            onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
          />
          <div
            className="resize-handle resize-s"
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
          />
          <div
            className="resize-handle resize-w"
            onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
          />
          <div
            className="resize-handle resize-e"
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          />
        </>
      )}
    </div>
  );
};

export default IDEWindowManager;
