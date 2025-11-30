import React, { useEffect } from 'react';
import { Content } from '../hooks/useContent';
import { AudioPlayer } from './AudioPlayer';
import { useAudio } from '../hooks/useAudio';
import './ContentDisplay.css';

interface Props {
  content: Content | null;
  loading?: boolean;
  error?: Error | null;
}

export const ContentDisplay: React.FC<Props> = ({ content, loading = false, error = null }) => {
  const audio = useAudio();

  // 콘텐츠가 변경되면 자동으로 음성 생성
  useEffect(() => {
    if (content && content.text) {
      audio.generateAudio(content.text, content.character);
    }
  }, [content, audio]);

  if (loading) {
    return (
      <div className="content-display loading">
        <div className="spinner"></div>
        <p>콘텐츠 로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-display error">
        <p>❌ {error.message}</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="content-display empty">
        <p>콘텐츠를 선택해주세요</p>
      </div>
    );
  }

  const difficultyColor = {
    beginner: '#4CAF50',
    intermediate: '#FF9800',
    advanced: '#F44336',
  };

  return (
    <div className="content-display">
      <div className="content-header">
        <div className="header-top">
          <h1 className="content-title">{content.title}</h1>
          <div className="header-meta">
            <span
              className="difficulty-badge"
              style={{ backgroundColor: difficultyColor[content.difficulty] }}
            >
              {content.difficulty === 'beginner'
                ? '초급'
                : content.difficulty === 'intermediate'
                ? '중급'
                : '고급'}
            </span>
            <span className="time-badge">⏱️ {content.estimatedTime}분</span>
          </div>
        </div>
        <p className="content-description">{content.description}</p>
      </div>

      <div className="content-body">
        <div className="content-image-section">
          <div className="content-image">
            <img
              src={`/api/images/${content.imageId}`}
              alt={content.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="%23999" text-anchor="middle" dominant-baseline="middle"%3E이미지 로드 실패%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
          <AudioPlayer
            audioUrl={audio.audioUrl}
            character={content.character}
            loading={audio.loading}
            isPlaying={audio.isPlaying}
            onPlay={() => audio.playAudio(audio.audioUrl)}
            onStop={audio.stopAudio}
            audioRef={audio.audioRef}
            onAudioEnded={audio.handleAudioEnded}
            error={audio.error}
          />
        </div>

        <div className="content-text-section">
          <div className="content-text">
            <h2>📖 학습 내용</h2>
            <p>{content.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
