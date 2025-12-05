/**
 * Scene Model
 *
 * Defines the structure for story scenes in episodes.
 * A scene can be one of three types:
 * 1. Story (image + narrative text)
 * 2. IDE Mission (coding problem with template and validation)
 * 3. Choice (branching narrative with options)
 */

/**
 * Story scene - displays image and narrative dialogue
 */
export interface StoryScene {
  type: 'story';
  imageUrl: string; // Path to scene image (e.g., /episode/1/opening.jpg)
  dialogues: string[]; // Array of dialogue lines
  character: string; // NPC character name (tom_nook, etc.)
  npcName: string; // Display name for NPC
}

/**
 * IDE mission scene - coding problem embedded in story
 */
export interface IDEScene {
  type: 'ide';
  missionId: string; // Reference to mission-xxx
  title: string; // Mission title
  description: string; // Narrative context for the mission
  imageUrl?: string; // Optional scene image before/after mission
  character: string; // NPC giving the mission
  npcName: string;
}

/**
 * Choice scene - branching narrative
 */
export interface ChoiceScene {
  type: 'choice';
  question: string; // Narrative question
  imageUrl?: string; // Optional scene image
  options: Array<{
    text: string; // Choice text
    nextSceneId: string; // Scene to navigate to if selected
    narrativeDescription?: string; // Short story text for this choice
  }>;
  character: string; // NPC presenting the choice
  npcName: string;
}

/**
 * Union type for all scene types
 */
export type Scene = StoryScene | IDEScene | ChoiceScene;

/**
 * Episode - collection of related scenes
 */
export interface Episode {
  id: string; // e.g., 'episode-001'
  title: string; // e.g., 'Java 기초 (Java Basics)'
  description: string; // Episode description
  order: number; // Position in curriculum (1-12)
  sceneOrder: string[]; // Array of scene IDs in order
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string; // ISO timestamp
  updatedAt: string;
  version: number;
}

/**
 * Scene metadata for management
 */
export interface SceneMetadata {
  id: string; // e.g., 'episode-001-scene-001'
  episodeId: string; // Reference to parent episode
  order: number; // Position in episode
  type: 'story' | 'ide' | 'choice';
  title?: string; // For IDE and choice scenes
  createdAt: string;
  updatedAt: string;
  createdBy: string; // Admin ID who created
  lastEditedBy: string; // Admin ID who last edited
}

/**
 * Scene with metadata (for management APIs)
 */
export interface SceneWithMetadata {
  data: Scene;
  metadata: SceneMetadata;
}

/**
 * Request body for creating/updating a scene
 */
export interface CreateSceneRequest {
  type: 'story' | 'ide' | 'choice';
  imageUrl?: string;
  dialogues?: string[];
  missionId?: string;
  title?: string;
  description?: string;
  question?: string;
  options?: Array<{
    text: string;
    nextSceneId: string;
    narrativeDescription?: string;
  }>;
  character: string;
  npcName: string;
}

/**
 * Request body for reordering scenes
 */
export interface ReorderScenesRequest {
  sceneOrder: string[]; // Array of scene IDs in new order
}
