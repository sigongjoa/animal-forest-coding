import React, { useEffect, useState } from 'react';
import './AudioPlayer.css';

interface Props {
  audioUrl: string;
  character: string;
  loading?: boolean;
  isPlaying?: boolean;
  onPlay: () => void;
  onStop: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  onAudioEnded: () => void;
  error?: Error | null;
}

export const AudioPlayer: React.FC<Props> = ({
  audioUrl,
  character,
  loading = false,
  isPlaying = false,
  onPlay,
  onStop,
  audioRef,
  onAudioEnded,
  error = null,
}) => {
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = onAudioEnded;
    }
  }, [audioRef, onAudioEnded]);

  useEffect(() => {
    if (audioRef.current) {
      const updateTime = () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      };

      const updateDuration = () => {
        setDuration(audioRef.current?.duration || 0);
      };

      audioRef.current.addEventListener('timeupdate', updateTime);
      audioRef.current.addEventListener('loadedmetadata', updateDuration);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', updateTime);
          audioRef.current.removeEventListener('loadedmetadata', updateDuration);
        }
      };
    }
  }, [audioRef]);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-player">
      <audio ref={audioRef} />

      <div className="audio-content">
        <h3 className="audio-title">🎙️ {character}의 음성</h3>

        {error && <div className="audio-error">{error.message}</div>}

        <div className="audio-controls">
          <button
            className={`play-button ${isPlaying ? 'playing' : ''} ${loading ? 'loading' : ''}`}
            onClick={isPlaying ? onStop : onPlay}
            disabled={loading || !audioUrl}
            title={isPlaying ? '일시정지' : '재생'}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                음성 생성 중...
              </>
            ) : isPlaying ? (
              <>
                <span className="pause-icon">⏸️</span>
                일시정지
              </>
            ) : (
              <>
                <span className="play-icon">▶️</span>
                재생
              </>
            )}
          </button>

          {audioUrl && !loading && (
            <div className="progress-section">
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <div className="time-display">
                <span className="current-time">{formatTime(currentTime)}</span>
                <span className="duration">{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {loading && (
            <div className="loading-text">음성을 생성하고 있습니다...</div>
          )}

          {!audioUrl && !loading && !error && (
            <div className="loading-text">음성 로드 준비 중...</div>
          )}
        </div>

        <div className="audio-info">
          <p>🦁 {character}의 Animalese 목소리로 학습 내용을 들어보세요!</p>
        </div>
      </div>
    </div>
  );
};
