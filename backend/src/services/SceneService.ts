import fs from 'fs/promises';
import path from 'path';
import {
  Scene,
  Episode,
  SceneWithMetadata,
  SceneMetadata,
  CreateSceneRequest,
  ReorderScenesRequest,
} from '../models/Scene';

/**
 * SceneService
 *
 * Manages scenes and episodes:
 * - Create, read, update, delete scenes within episodes
 * - Manage episode structure and scene ordering
 * - Track scene metadata (creator, timestamps, etc.)
 */
class SceneService {
  private dataPath: string;
  private episodesPath: string;
  private scenesPath: string;
  private episodeCache: Map<string, Episode> = new Map();
  private sceneCache: Map<string, SceneWithMetadata> = new Map();
  private maxCacheSize: number = 50;

  constructor() {
    // Fix: Handle both root and backend directories
    const cwd = process.cwd();
    const basePath = cwd.endsWith('backend')
      ? path.join(cwd, 'data')
      : path.join(cwd, 'backend', 'data');

    this.dataPath = basePath;
    this.episodesPath = path.join(this.dataPath, 'episodes');
    this.scenesPath = path.join(this.dataPath, 'scenes');
    console.log(`📺 SceneService initialized with path: ${this.scenesPath}`);
  }

  /**
   * Initialize data directories if they don't exist
   */
  async initializeDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.episodesPath, { recursive: true });
      await fs.mkdir(this.scenesPath, { recursive: true });
      console.log('✅ Scene data directories initialized');
    } catch (error) {
      console.error('❌ Failed to initialize scene directories:', error);
      throw error;
    }
  }

  /**
   * Get episode by ID
   */
  async getEpisode(episodeId: string): Promise<Episode | null> {
    try {
      // Check cache first
      if (this.episodeCache.has(episodeId)) {
        return this.episodeCache.get(episodeId) || null;
      }

      const filePath = path.join(this.episodesPath, `${episodeId}.json`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const episode: Episode = JSON.parse(fileContent);

      // Add to cache
      if (this.episodeCache.size >= this.maxCacheSize) {
        const firstKey = this.episodeCache.keys().next().value as string;
        this.episodeCache.delete(firstKey);
      }
      this.episodeCache.set(episodeId, episode);

      console.log(`✅ Loaded episode ${episodeId}`);
      return episode;
    } catch (error) {
      console.error(`❌ Failed to load episode ${episodeId}:`, error);
      return null;
    }
  }

  /**
   * Get all episodes
   */
  async getAllEpisodes(): Promise<Episode[]> {
    try {
      const files = await fs.readdir(this.episodesPath);
      const jsonFiles = files
        .filter(f => f.startsWith('episode-') && f.endsWith('.json'))
        .sort();

      const episodes: Episode[] = [];
      for (const file of jsonFiles) {
        const episodeId = file.replace('.json', '');
        const episode = await this.getEpisode(episodeId);
        if (episode) {
          episodes.push(episode);
        }
      }

      episodes.sort((a, b) => a.order - b.order);
      console.log(`✅ Loaded ${episodes.length} episodes`);
      return episodes;
    } catch (error) {
      console.error('❌ Failed to load episodes:', error);
      return [];
    }
  }

  /**
   * Create new episode
   */
  async createEpisode(
    title: string,
    description: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    order: number
  ): Promise<Episode> {
    try {
      const id = `episode-${String(order).padStart(3, '0')}`;
      const now = new Date().toISOString();

      const episode: Episode = {
        id,
        title,
        description,
        difficulty,
        order,
        sceneOrder: [],
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const filePath = path.join(this.episodesPath, `${id}.json`);
      await fs.writeFile(filePath, JSON.stringify(episode, null, 2));

      this.episodeCache.set(id, episode);
      console.log(`✅ Created episode ${id}`);
      return episode;
    } catch (error) {
      console.error('❌ Failed to create episode:', error);
      throw error;
    }
  }

  /**
   * Update episode
   */
  async updateEpisode(
    episodeId: string,
    updates: Partial<Omit<Episode, 'id' | 'createdAt' | 'version'>>
  ): Promise<Episode | null> {
    try {
      const episode = await this.getEpisode(episodeId);
      if (!episode) {
        console.error(`❌ Episode ${episodeId} not found`);
        return null;
      }

      const updatedEpisode: Episode = {
        ...episode,
        ...updates,
        id: episode.id,
        createdAt: episode.createdAt,
        version: episode.version + 1,
        updatedAt: new Date().toISOString(),
      };

      const filePath = path.join(this.episodesPath, `${episodeId}.json`);
      await fs.writeFile(filePath, JSON.stringify(updatedEpisode, null, 2));

      this.episodeCache.set(episodeId, updatedEpisode);
      console.log(`✅ Updated episode ${episodeId}`);
      return updatedEpisode;
    } catch (error) {
      console.error(`❌ Failed to update episode ${episodeId}:`, error);
      throw error;
    }
  }

  /**
   * Get scene by ID
   */
  async getScene(sceneId: string): Promise<SceneWithMetadata | null> {
    try {
      // Check cache first
      if (this.sceneCache.has(sceneId)) {
        return this.sceneCache.get(sceneId) || null;
      }

      const filePath = path.join(this.scenesPath, `${sceneId}.json`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const sceneData = JSON.parse(fileContent);

      if (this.sceneCache.size >= this.maxCacheSize) {
        const firstKey = this.sceneCache.keys().next().value as string;
        this.sceneCache.delete(firstKey);
      }
      this.sceneCache.set(sceneId, sceneData);

      return sceneData;
    } catch (error) {
      console.error(`❌ Failed to load scene ${sceneId}:`, error);
      return null;
    }
  }

  /**
   * Get all scenes in an episode
   */
  async getEpisodeScenes(episodeId: string): Promise<SceneWithMetadata[]> {
    try {
      const episode = await this.getEpisode(episodeId);
      if (!episode) {
        console.error(`❌ Episode ${episodeId} not found`);
        return [];
      }

      const scenes: SceneWithMetadata[] = [];
      for (const sceneId of episode.sceneOrder) {
        const scene = await this.getScene(sceneId);
        if (scene) {
          scenes.push(scene);
        }
      }

      console.log(`✅ Loaded ${scenes.length} scenes from episode ${episodeId}`);
      return scenes;
    } catch (error) {
      console.error(`❌ Failed to load scenes for episode ${episodeId}:`, error);
      return [];
    }
  }

  /**
   * Create scene in episode
   */
  async createScene(
    episodeId: string,
    sceneRequest: CreateSceneRequest,
    adminId: string
  ): Promise<SceneWithMetadata | null> {
    try {
      const episode = await this.getEpisode(episodeId);
      if (!episode) {
        console.error(`❌ Episode ${episodeId} not found`);
        return null;
      }

      // Generate scene ID
      const sceneId = `${episodeId}-scene-${String(episode.sceneOrder.length + 1).padStart(3, '0')}`;
      const now = new Date().toISOString();

      // Build scene data based on type
      let sceneData: Scene;

      switch (sceneRequest.type) {
        case 'story':
          sceneData = {
            type: 'story',
            imageUrl: sceneRequest.imageUrl || '',
            dialogues: sceneRequest.dialogues || [],
            character: sceneRequest.character,
            npcName: sceneRequest.npcName,
          };
          break;

        case 'ide':
          sceneData = {
            type: 'ide',
            missionId: sceneRequest.missionId || '',
            title: sceneRequest.title || '',
            description: sceneRequest.description || '',
            imageUrl: sceneRequest.imageUrl,
            character: sceneRequest.character,
            npcName: sceneRequest.npcName,
          };
          break;

        case 'choice':
          sceneData = {
            type: 'choice',
            question: sceneRequest.question || '',
            imageUrl: sceneRequest.imageUrl,
            options: sceneRequest.options || [],
            character: sceneRequest.character,
            npcName: sceneRequest.npcName,
          };
          break;

        default:
          throw new Error(`Invalid scene type: ${sceneRequest.type}`);
      }

      // Create metadata
      const metadata: SceneMetadata = {
        id: sceneId,
        episodeId,
        order: episode.sceneOrder.length + 1,
        type: sceneRequest.type,
        title: sceneRequest.title,
        createdAt: now,
        updatedAt: now,
        createdBy: adminId,
        lastEditedBy: adminId,
      };

      // Write scene file
      const sceneWithMetadata: SceneWithMetadata = {
        data: sceneData,
        metadata,
      };

      const filePath = path.join(this.scenesPath, `${sceneId}.json`);
      await fs.writeFile(filePath, JSON.stringify(sceneWithMetadata, null, 2));

      // Update episode with new scene order
      const updatedSceneOrder = [...episode.sceneOrder, sceneId];
      await this.updateEpisode(episodeId, { sceneOrder: updatedSceneOrder });

      this.sceneCache.set(sceneId, sceneWithMetadata);
      console.log(`✅ Created scene ${sceneId} in episode ${episodeId}`);
      return sceneWithMetadata;
    } catch (error) {
      console.error(`❌ Failed to create scene in episode ${episodeId}:`, error);
      throw error;
    }
  }

  /**
   * Update scene
   */
  async updateScene(
    sceneId: string,
    sceneRequest: Partial<CreateSceneRequest>,
    adminId: string
  ): Promise<SceneWithMetadata | null> {
    try {
      const sceneWithMetadata = await this.getScene(sceneId);
      if (!sceneWithMetadata) {
        console.error(`❌ Scene ${sceneId} not found`);
        return null;
      }

      const now = new Date().toISOString();
      const { data, metadata } = sceneWithMetadata;

      // Update scene data based on type
      let updatedData: Scene = data;

      if (sceneRequest.type === 'story' || data.type === 'story') {
        updatedData = {
          type: 'story',
          imageUrl: sceneRequest.imageUrl || (data as any).imageUrl || '',
          dialogues: sceneRequest.dialogues || (data as any).dialogues || [],
          character: sceneRequest.character || data.character,
          npcName: sceneRequest.npcName || data.npcName,
        };
      } else if (sceneRequest.type === 'ide' || data.type === 'ide') {
        updatedData = {
          type: 'ide',
          missionId: sceneRequest.missionId || (data as any).missionId || '',
          title: sceneRequest.title || (data as any).title || '',
          description: sceneRequest.description || (data as any).description || '',
          imageUrl: sceneRequest.imageUrl || (data as any).imageUrl,
          character: sceneRequest.character || data.character,
          npcName: sceneRequest.npcName || data.npcName,
        };
      } else if (sceneRequest.type === 'choice' || data.type === 'choice') {
        updatedData = {
          type: 'choice',
          question: sceneRequest.question || (data as any).question || '',
          imageUrl: sceneRequest.imageUrl || (data as any).imageUrl,
          options: sceneRequest.options || (data as any).options || [],
          character: sceneRequest.character || data.character,
          npcName: sceneRequest.npcName || data.npcName,
        };
      }

      const updatedMetadata: SceneMetadata = {
        ...metadata,
        title: sceneRequest.title || metadata.title,
        updatedAt: now,
        lastEditedBy: adminId,
      };

      const updatedScene: SceneWithMetadata = {
        data: updatedData,
        metadata: updatedMetadata,
      };

      const filePath = path.join(this.scenesPath, `${sceneId}.json`);
      await fs.writeFile(filePath, JSON.stringify(updatedScene, null, 2));

      this.sceneCache.set(sceneId, updatedScene);
      console.log(`✅ Updated scene ${sceneId}`);
      return updatedScene;
    } catch (error) {
      console.error(`❌ Failed to update scene ${sceneId}:`, error);
      throw error;
    }
  }

  /**
   * Delete scene from episode
   */
  async deleteScene(sceneId: string): Promise<boolean> {
    try {
      const sceneWithMetadata = await this.getScene(sceneId);
      if (!sceneWithMetadata) {
        console.error(`❌ Scene ${sceneId} not found`);
        return false;
      }

      const { metadata } = sceneWithMetadata;
      const episodeId = metadata.episodeId;

      // Remove scene file
      const filePath = path.join(this.scenesPath, `${sceneId}.json`);
      await fs.unlink(filePath);

      // Update episode scene order
      const episode = await this.getEpisode(episodeId);
      if (episode) {
        const updatedSceneOrder = episode.sceneOrder.filter(id => id !== sceneId);
        await this.updateEpisode(episodeId, { sceneOrder: updatedSceneOrder });
      }

      this.sceneCache.delete(sceneId);
      console.log(`✅ Deleted scene ${sceneId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to delete scene ${sceneId}:`, error);
      throw error;
    }
  }

  /**
   * Reorder scenes in episode
   */
  async reorderScenes(
    episodeId: string,
    sceneOrder: string[]
  ): Promise<Episode | null> {
    try {
      const episode = await this.getEpisode(episodeId);
      if (!episode) {
        console.error(`❌ Episode ${episodeId} not found`);
        return null;
      }

      // Validate that all scene IDs exist in episode
      const existingSceneIds = new Set(episode.sceneOrder);
      for (const sceneId of sceneOrder) {
        if (!existingSceneIds.has(sceneId)) {
          throw new Error(`Scene ${sceneId} not found in episode`);
        }
      }

      // Update episode with new scene order
      const updatedEpisode = await this.updateEpisode(episodeId, {
        sceneOrder,
      });

      console.log(`✅ Reordered scenes in episode ${episodeId}`);
      return updatedEpisode;
    } catch (error) {
      console.error(`❌ Failed to reorder scenes in episode ${episodeId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const sceneService = new SceneService();
export default SceneService;
