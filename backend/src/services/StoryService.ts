import fs from 'fs/promises';
import path from 'path';

/**
 * Scene definition for a story sequence
 */
interface Scene {
  id: number;
  imageUrl: string;
  character: string;
  characterName: string;
  dialogues: string[];
  duration: number;
}

/**
 * Reward configuration for episode completion
 */
interface StoryRewards {
  basePoints: number;
  completionBonus: number;
  skipPenalty: number;
  badges: string[];
}

/**
 * Complete episode definition
 */
interface Episode {
  id: string;
  title: string;
  description: string;
  order: number;
  scenes: Scene[];
  rewards: StoryRewards;
}

/**
 * StoryService
 *
 * Manages story/episode content from data-driven JSON files
 * - Loads episodes from backend/data/stories/
 * - Implements LRU caching for performance
 * - Supports hot reload for content updates
 * - Provides fallback for missing episodes
 */
class StoryService {
  private storiesPath: string;
  private episodesCache: Map<string, Episode> = new Map();
  private maxCacheSize: number = 20; // Max episodes to keep in cache

  constructor() {
    this.storiesPath = path.join(process.cwd(), 'data', 'stories');
    console.log(`📖 StoryService initialized with path: ${this.storiesPath}`);
  }

  /**
   * Load episode by ID with LRU caching
   * Returns null if episode not found
   */
  async getEpisode(episodeId: string): Promise<Episode | null> {
    try {
      // Check cache first
      if (this.episodesCache.has(episodeId)) {
        console.log(`📦 Episode ${episodeId} loaded from cache`);
        return this.episodesCache.get(episodeId) || null;
      }

      // Load from file system
      const filePath = path.join(this.storiesPath, `${episodeId}.json`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const episode: Episode = JSON.parse(fileContent);

      // Validate episode structure
      this.validateEpisode(episode);

      // Add to cache with LRU eviction
      if (this.episodesCache.size >= this.maxCacheSize) {
        const firstKey = this.episodesCache.keys().next().value as string;
        this.episodesCache.delete(firstKey);
        console.log(`♻️ Evicted ${firstKey} from cache`);
      }
      this.episodesCache.set(episodeId, episode);

      console.log(`✅ Loaded episode ${episodeId} from file: ${filePath}`);
      return episode;
    } catch (error) {
      console.error(`❌ Failed to load episode ${episodeId}:`, error);
      return null;
    }
  }

  /**
   * Load all episodes from stories directory
   * Sorted by order field
   */
  async getAllEpisodes(): Promise<Episode[]> {
    try {
      const files = await fs.readdir(this.storiesPath);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      const episodes: Episode[] = [];
      for (const file of jsonFiles) {
        const episodeId = file.replace('.json', '');
        const episode = await this.getEpisode(episodeId);
        if (episode) {
          episodes.push(episode);
        }
      }

      // Sort by order field
      episodes.sort((a, b) => a.order - b.order);

      console.log(`✅ Loaded ${episodes.length} episodes total`);
      return episodes;
    } catch (error) {
      console.error('❌ Failed to load episodes:', error);
      return [];
    }
  }

  /**
   * Validate episode structure
   * Ensures required fields exist
   */
  private validateEpisode(episode: Episode): void {
    const required = ['id', 'title', 'description', 'order', 'scenes', 'rewards'];
    for (const field of required) {
      if (!(field in episode)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate scenes
    if (!Array.isArray(episode.scenes) || episode.scenes.length === 0) {
      throw new Error('Episode must have at least one scene');
    }

    for (const scene of episode.scenes) {
      const sceneRequired = ['id', 'imageUrl', 'character', 'characterName', 'dialogues', 'duration'];
      for (const field of sceneRequired) {
        if (!(field in scene)) {
          throw new Error(`Scene missing required field: ${field}`);
        }
      }
    }

    // Validate rewards
    const rewardsRequired = ['basePoints', 'completionBonus', 'skipPenalty', 'badges'];
    for (const field of rewardsRequired) {
      if (!(field in episode.rewards)) {
        throw new Error(`Rewards missing required field: ${field}`);
      }
    }
  }

  /**
   * Calculate total rewards for episode completion
   * Can be enhanced with student-specific logic (difficulty, performance, etc.)
   */
  calculateRewards(
    episodeId: string,
    completed: boolean,
    skipped: boolean,
    episodeData?: Episode
  ): number {
    // Default rewards if episode not found
    let basePoints = 100;
    let completionBonus = 50;
    let skipPenalty = -20;

    // Use actual episode data if provided
    if (episodeData) {
      basePoints = episodeData.rewards.basePoints;
      completionBonus = episodeData.rewards.completionBonus;
      skipPenalty = episodeData.rewards.skipPenalty;
    }

    const points = basePoints + (completed ? completionBonus : 0) + (skipped ? skipPenalty : 0);
    console.log(`🎯 Calculated rewards for ${episodeId}: ${points} points`);

    return Math.max(points, 0); // Never negative
  }

  /**
   * Get badges for episode completion
   */
  getBadges(episodeId: string, episodeData?: Episode): string[] {
    if (episodeData) {
      return episodeData.rewards.badges;
    }

    // Default badges
    const defaultBadges: Record<string, string[]> = {
      ep_1: ['story-complete'],
      ep_2: ['intermediate-complete'],
      ep_3: ['advanced-complete'],
    };

    return defaultBadges[episodeId] || ['episode-complete'];
  }

  /**
   * Invalidate cache (for hot reload in development)
   * Call this when story files are updated
   */
  invalidateCache(): void {
    this.episodesCache.clear();
    console.log('✅ Story cache invalidated');
  }

  /**
   * Clear specific episode from cache
   */
  invalidateEpisode(episodeId: string): void {
    this.episodesCache.delete(episodeId);
    console.log(`✅ Invalidated cache for episode ${episodeId}`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; episodes: string[] } {
    return {
      size: this.episodesCache.size,
      episodes: Array.from(this.episodesCache.keys()),
    };
  }
}

// Export singleton instance
export const storyService = new StoryService();

// Export types for use in other files
export type { Episode, Scene, StoryRewards };
