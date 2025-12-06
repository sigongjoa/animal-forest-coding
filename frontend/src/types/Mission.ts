export interface MissionStep {
  id: number;
  title: string;
  description: string;
  prompt: string;
  template: string;
  solution: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  steps: MissionStep[];
  storyContext?: {
    introImage: string;
    introDialogue: string[];
    successDialogue: string[];
    failureDialogue: string[];
  };
}
