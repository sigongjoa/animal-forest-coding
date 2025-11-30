import React from 'react';
import './CharacterSelector.css';

interface Character {
  id: string;
  name: string;
  species: string;
  imageUrl: string;
}

interface Props {
  characters: Character[];
  selectedCharacter?: string;
  onSelect: (character: string) => void;
  loading?: boolean;
}

export const CharacterSelector: React.FC<Props> = ({
  characters,
  selectedCharacter,
  onSelect,
  loading = false,
}) => {
  return (
    <div className="character-selector">
      <h2 className="character-title">🦁 캐릭터를 선택하세요</h2>
      <div className="character-grid">
        {characters.map((character) => (
          <div
            key={character.id}
            className={`character-card ${selectedCharacter === character.name ? 'selected' : ''}`}
            onClick={() => onSelect(character.name)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelect(character.name);
              }
            }}
          >
            <div className="character-avatar">
              <span className="character-emoji">
                {character.name.includes('Tom') ? '🦝' :
                 character.name.includes('Isabelle') ? '🐕' :
                 character.name.includes('Blathers') ? '🦉' :
                 character.name.includes('Celeste') ? '🦉' :
                 character.name.includes('Tim') ? '🐱' :
                 '🐶'}
              </span>
            </div>
            <h3 className="character-name">{character.name}</h3>
            <p className="character-species">{character.species}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
