/**
 * Mission Model
 *
 * Defines the structure for coding missions in the Animal Forest Coding platform.
 * Missions can be beginner, intermediate, or advanced level.
 * Each mission has multiple steps, validation rules, and story context.
 */

/**
 * Validation rule for a mission step
 * Supports regex patterns, execution output, or AST analysis
 */
export interface ValidationRule {
  type: 'regex' | 'execution' | 'contains' | 'ast';
  pattern?: string; // For regex/contains validation
  expectedOutput?: string | number | boolean; // For execution validation
  errorMessage?: string;
}

/**
 * A single step within a mission
 * Missions can have 1-3 steps of progressive difficulty
 */
export interface MissionStep {
  id: number;
  title: string;
  prompt: string; // What the student needs to do
  template: string; // Starter code
  validation: ValidationRule[];
  hints: string[]; // Progressive hints (show only on request)
  successMessage: string;
  estimatedTimeMinutes: number;
}

/**
 * Story context for a mission
 * Connects the coding task to the game narrative
 */
export interface MissionStoryContext {
  character: string; // NPC name (Nook, etc.)
  narrative: string; // Why this mission matters
  sceneImages: string[]; // Image URLs for story scenes
  initialDialogue: string;
  completionDialogue: string;
}

/**
 * Rewards for mission completion
 */
export interface MissionRewards {
  basePoints: number; // 500-1000
  speedBonus: number; // +50 if < 1.5x estimated time
  perfectBonus: number; // +100 if first attempt successful
  badge?: string; // Optional badge ID for specific achievements
}

/**
 * Core mission definition
 * Represents a single coding mission with story context and validation
 */
export interface Mission {
  // Identity
  id: string; // e.g., 'mission-001', 'mission-012'
  title: string; // e.g., 'Variables: Declaring an Integer'
  description: string; // Brief explanation of learning objectives
  category: string; // e.g., 'variables', 'loops', 'functions'

  // Structure
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number; // Position in curriculum (1-12)
  prerequisites: string[]; // Mission IDs that must be completed first
  steps: MissionStep[]; // 1-3 steps per mission

  // Context & Narrative
  storyContext: MissionStoryContext;

  // Rewards & Progression
  points: number;
  rewards: MissionRewards;
  unlocks?: string[]; // Mission IDs that become available after this

  // Metadata
  language: 'python' | 'java' | 'javascript';
  createdAt: string; // ISO timestamp
  updatedAt: string;
  version: number;
}

/**
 * Mission attempt tracking
 * Records each student's attempt on a mission
 */
export interface MissionAttempt {
  studentId: string;
  missionId: string;
  stepId: number;
  code: string;
  isSuccessful: boolean;
  feedback: string;
  attemptNumber: number;
  timeSpentSeconds: number;
  hintsUsed: number;
  timestamp: string; // ISO timestamp
}

/**
 * Mission completion record
 * Summary of a student's completion of a mission
 */
export interface MissionCompletion {
  studentId: string;
  missionId: string;
  completedAt: string; // ISO timestamp
  pointsEarned: number;
  totalAttempts: number;
  totalTimeSeconds: number;
  perfectAttempt: boolean; // true if successful on first try
  speedBonus: boolean; // true if completed in < 1.5x estimated time
  badge?: string; // Badge earned if any
}

/**
 * Curriculum structure
 * Defines the complete set of missions
 */
export interface Curriculum {
  episodes: Episode[];
  totalMissions: number;
  totalPoints: number;
}

/**
 * Episode grouping missions into themed sets
 */
export interface Episode {
  id: string;
  title: string;
  description: string;
  order: number;
  missions: Mission[];
}
