export interface MissionStep {
  id: number;
  title: string;
  description: string;
  prompt: string;
  template: string;
  solution: string;
  prerequisites: string[]; // IDs of missions that must be completed first
}

// 스크립트 액션 타입 정의
export type ScriptAction =
  | { type: 'dialogue'; speaker: 'nook' | 'player' | 'system'; text: string; emotion?: 'happy' | 'angry' | 'shocked' | 'normal'; }
  | { type: 'move'; target: 'player' | 'nook'; to: { x: number; y: number }; speed?: 'walk' | 'run'; }
  | { type: 'emote'; target: 'player' | 'nook'; emoji: string; }
  | { type: 'transition'; mode: 'IDE' | 'STORY'; }
  | { type: 'wait'; duration: number; };

export interface MissionScenario {
  setting: {
    background: string;
    bgm?: string;
    characters: {
      id: 'player' | 'nook';
      initialPosition: { x: number; y: number };
      sprite: string;
      direction: 'down' | 'left' | 'right' | 'up';
      scale?: number;
    }[];
  };
  script: ScriptAction[];
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  steps: MissionStep[];
  rewards: {
    basePoints: number;
    speedBonus: number;
    perfectBonus: number;
  };
  unlocks: string[];
  prerequisites: string[];
  // New Scenario Field (Optional for backward compatibility)
  scenario?: MissionScenario;
  // Deprecated legacy story context (keep for now or transition)
  storyContext?: {
    introImage: string;
    introDialogue: string[];
    successDialogue: string[];
    failureDialogue: string[];
  };
}
