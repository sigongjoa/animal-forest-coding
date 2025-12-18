export interface MissionStep {
  id: number;
  title: string;
  description: string;
  prompt: string;
  template: string;
  solution: string;
  prerequisites: string[]; // IDs of missions that must be completed first
  scenario?: MissionScenario;
}

// 스크립트 액션 타입 정의
export type ScriptAction =
  | { type: 'dialogue'; speaker: 'nook' | 'player' | 'system' | 'justin' | 'daisy'; text: string; emotion?: 'happy' | 'angry' | 'shocked' | 'normal' | 'sad' | 'neutral' | 'thinking' | 'concerned'; }
  | { type: 'move'; target: 'player' | 'nook' | 'justin' | 'daisy'; to: { x: number; y: number }; speed?: 'walk' | 'run'; }
  | { type: 'emote'; target: 'player' | 'nook' | 'justin' | 'daisy'; emoji: string; }
  | { type: 'animation'; target: string; animation: 'jump' | 'spin' | 'shake' | 'bounce' | 'wiggle'; duration?: number; }
  | { type: 'transition'; mode: 'IDE' | 'STORY'; }
  | { type: 'wait'; duration: number; }
  | { type: 'effect'; effectName: string; };

export interface MissionScenario {
  setting: {
    background: string;
    bgm?: string;
    characters: {
      id: 'player' | 'nook' | 'justin' | 'daisy';
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
