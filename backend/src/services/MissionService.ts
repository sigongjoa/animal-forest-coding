import fs from 'fs/promises';
import path from 'path';
import { Mission, MissionAttempt, MissionCompletion } from '../models/Mission';

/**
 * MissionService
 *
 * Manages the complete mission lifecycle:
 * - Load mission definitions from data files
 * - Track student mission attempts
 * - Record mission completions and rewards
 * - Provide mission progression and analytics
 */
class MissionService {
  private missionsPath: string;
  private missionsCache: Map<string, Mission> = new Map();
  private maxCacheSize: number = 20;

  constructor() {
    // Fix: Remove double 'backend' in path
    const cwd = process.cwd();
    const basePath = cwd.endsWith('backend')
      ? path.join(cwd, 'data', 'missions')
      : path.join(cwd, 'backend', 'data', 'missions');
    this.missionsPath = basePath;
    console.log(`📚 MissionService initialized with path: ${this.missionsPath}`);
  }

  /**
   * Load mission by ID with LRU caching
   */
  async getMission(missionId: string): Promise<Mission | null> {
    try {
      // Check cache first
      if (this.missionsCache.has(missionId)) {
        console.log(`📦 Mission ${missionId} loaded from cache`);
        return this.missionsCache.get(missionId) || null;
      }

      // Load from file system
      const filePath = path.join(this.missionsPath, `${missionId}.json`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const mission: Mission = JSON.parse(fileContent);

      // Validate mission structure
      this.validateMission(mission);

      // Add to cache with LRU eviction
      if (this.missionsCache.size >= this.maxCacheSize) {
        const firstKey = this.missionsCache.keys().next().value as string;
        this.missionsCache.delete(firstKey);
        console.log(`♻️ Evicted ${firstKey} from cache`);
      }
      this.missionsCache.set(missionId, mission);

      console.log(`✅ Loaded mission ${missionId}`);
      return mission;
    } catch (error) {
      console.error(`❌ Failed to load mission ${missionId}:`, error);
      return null;
    }
  }

  /**
   * Load all missions from directory
   * Sorted by order field
   */
  async getAllMissions(): Promise<Mission[]> {
    try {
      const files = await fs.readdir(this.missionsPath);
      const jsonFiles = files
        .filter(f => f.startsWith('mission-') && f.endsWith('.json'))
        .sort();

      const missions: Mission[] = [];
      for (const file of jsonFiles) {
        const missionId = file.replace('.json', '');
        const mission = await this.getMission(missionId);
        if (mission) {
          missions.push(mission);
        }
      }

      // Sort by order field
      missions.sort((a, b) => a.order - b.order);

      console.log(`✅ Loaded ${missions.length} missions total`);
      return missions;
    } catch (error) {
      console.error('❌ Failed to load missions:', error);
      return [];
    }
  }

  /**
   * Get missions by difficulty level
   */
  async getMissionsByDifficulty(
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<Mission[]> {
    const allMissions = await this.getAllMissions();
    return allMissions.filter(m => m.difficulty === difficulty);
  }

  /**
   * Get mission prerequisites (missions that must be completed first)
   */
  async getMissionPrerequisites(missionId: string): Promise<Mission[]> {
    const mission = await this.getMission(missionId);
    if (!mission || mission.prerequisites.length === 0) {
      return [];
    }

    const prerequisites: Mission[] = [];
    for (const prereqId of mission.prerequisites) {
      const prereq = await this.getMission(prereqId);
      if (prereq) {
        prerequisites.push(prereq);
      }
    }

    return prerequisites;
  }

  /**
   * Check if student has completed all prerequisites
   */
  async canStartMission(
    studentId: string,
    missionId: string,
    completedMissions: string[]
  ): Promise<boolean> {
    const mission = await this.getMission(missionId);
    if (!mission) {
      return false;
    }

    // Check if all prerequisites are completed
    for (const prereqId of mission.prerequisites) {
      if (!completedMissions.includes(prereqId)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate rewards for mission completion
   */
  calculateRewards(
    mission: Mission,
    timeSpentSeconds: number,
    isFirstAttempt: boolean,
    hintsUsed: number
  ): {
    basePoints: number;
    speedBonus: number;
    perfectBonus: number;
    totalPoints: number;
  } {
    const { basePoints, speedBonus, perfectBonus } = mission.rewards;

    // Calculate speed bonus
    const estimatedTimeSeconds = mission.steps.reduce(
      (sum, step) => sum + step.estimatedTimeMinutes * 60,
      0
    );
    const speedBonusEarned =
      timeSpentSeconds < estimatedTimeSeconds * 1.5 ? speedBonus : 0;

    // Calculate perfect bonus (first attempt, no hints)
    const perfectBonusEarned = isFirstAttempt && hintsUsed === 0 ? perfectBonus : 0;

    // Penalty for hints
    const hintPenalty = hintsUsed * 10;

    const totalPoints = Math.max(
      basePoints + speedBonusEarned + perfectBonusEarned - hintPenalty,
      basePoints // Minimum: base points
    );

    return {
      basePoints,
      speedBonus: speedBonusEarned,
      perfectBonus: perfectBonusEarned,
      totalPoints,
    };
  }

  /**
   * Get recommended next mission based on progress
   */
  async getNextMissionRecommendation(
    completedMissions: string[],
    currentDifficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<Mission | null> {
    const allMissions = await this.getAllMissions();

    // Find next uncompleted mission in same or higher difficulty
    for (const mission of allMissions) {
      if (completedMissions.includes(mission.id)) {
        continue; // Skip completed missions
      }

      if (mission.difficulty === currentDifficulty || mission.difficulty === 'advanced') {
        const canStart = await this.canStartMission(
          '', // studentId not needed for this check
          mission.id,
          completedMissions
        );
        if (canStart) {
          return mission;
        }
      }
    }

    return null;
  }

  /**
   * Get curriculum summary statistics
   */
  async getCurriculumStats(): Promise<{
    totalMissions: number;
    beginnerMissions: number;
    intermediateMissions: number;
    advancedMissions: number;
    totalPoints: number;
  }> {
    const allMissions = await this.getAllMissions();

    return {
      totalMissions: allMissions.length,
      beginnerMissions: allMissions.filter(m => m.difficulty === 'beginner').length,
      intermediateMissions: allMissions.filter(m => m.difficulty === 'intermediate')
        .length,
      advancedMissions: allMissions.filter(m => m.difficulty === 'advanced').length,
      totalPoints: allMissions.reduce((sum, m) => sum + m.points, 0),
    };
  }

  /**
   * Validate mission structure
   */
  private validateMission(mission: Mission): void {
    if (!mission.id || !mission.title || !mission.steps || mission.steps.length === 0) {
      throw new Error(`Invalid mission structure: ${mission.id}`);
    }

    if (!['beginner', 'intermediate', 'advanced'].includes(mission.difficulty)) {
      throw new Error(`Invalid difficulty level: ${mission.difficulty}`);
    }

    if (!['python', 'java', 'javascript'].includes(mission.language)) {
      throw new Error(`Invalid language: ${mission.language}`);
    }
  }
}

export const missionService = new MissionService();
