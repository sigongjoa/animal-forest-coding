import React, { useState, useEffect } from 'react';
import { CharacterSelector } from './components/CharacterSelector';
import { ContentDisplay } from './components/ContentDisplay';
import { useContent } from './hooks/useContent';
import apiClient from './services/apiClient';
import './App.css';

interface Character {
  id: string;
  name: string;
  species: string;
  imageUrl: string;
}

function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('variables');
  const [charactersLoading, setCharactersLoading] = useState(true);
  const [charactersError, setCharactersError] = useState<Error | null>(null);

  const { content, loading: contentLoading, error: contentError } = useContent(
    selectedCharacter,
    selectedTopic
  );

  // 캐릭터 목록 로드
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        setCharactersLoading(true);
        setCharactersError(null);

        const response = await apiClient.get('/characters');

        if (response.data.success) {
          setCharacters(response.data.data);
          // 첫 번째 캐릭터 자동 선택
          if (response.data.data.length > 0) {
            setSelectedCharacter(response.data.data[0].name);
          }
        } else {
          throw new Error(response.data.error?.message || 'Failed to load characters');
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        setCharactersError(err);
        console.error('Failed to load characters:', err);
      } finally {
        setCharactersLoading(false);
      }
    };

    loadCharacters();
  }, []);

  const handleCharacterSelect = (character: string) => {
    setSelectedCharacter(character);
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTopic(e.target.value);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-container">
          <h1 className="app-title">
            🦁 동물 숲 코딩 학습 플랫폼
          </h1>
          <p className="app-subtitle">
            동물 친구들과 함께 코딩을 배워봅시다!
          </p>
        </div>
      </header>

      <main className="app-main">
        {charactersError && (
          <div className="error-banner">
            ❌ 캐릭터를 불러올 수 없습니다: {charactersError.message}
          </div>
        )}

        {charactersLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>캐릭터를 불러오는 중...</p>
          </div>
        ) : (
          <>
            <CharacterSelector
              characters={characters}
              selectedCharacter={selectedCharacter}
              onSelect={handleCharacterSelect}
              loading={charactersLoading}
            />

            <section className="topic-section">
              <label htmlFor="topic-select" className="topic-label">
                📚 학습 주제 선택:
              </label>
              <select
                id="topic-select"
                className="topic-select"
                value={selectedTopic}
                onChange={handleTopicChange}
              >
                <option value="variables">변수와 데이터 타입</option>
                <option value="control-flow">제어 흐름</option>
                <option value="loops">반복문</option>
                <option value="functions">함수와 스코프</option>
                <option value="arrays">배열과 객체</option>
                <option value="async">비동기 프로그래밍</option>
                <option value="oop">객체 지향 프로그래밍</option>
              </select>
            </section>

            <ContentDisplay
              content={content}
              loading={contentLoading}
              error={contentError}
            />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          🎓 Animal Forest Coding - 함께 배우는 즐거운 코딩 학습 플랫폼
        </p>
        <p>
          Made with ❤️ using React + Express
        </p>
      </footer>
    </div>
  );
}

export default App;
