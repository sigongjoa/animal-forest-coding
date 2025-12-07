import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { Mission, MissionAttempt, MissionCompletion } from '../models/Mission';
import { databaseService } from './DatabaseService';

/**
 * MissionService
 *
 * Manages the complete mission lifecycle:
 * - Load mission definitions from data files
 * - Track student mission attempts
 * - Record mission completions and rewards
 * - Provide mission progression and analytics
 */
export class MissionService {
  private missionsPath: string;
  private missionsCache: Map<string, Mission> = new Map();
  private isLoaded: boolean = false;

  constructor() {
    // backend/src/services/MissionService.ts -> ../data/missions/missions.json (in src/data)

    // Explicitly check possible paths
    const pathsToCheck = [
      // 1. Source directory (most likely in dev/local)
      path.join(process.cwd(), 'src', 'data', 'missions', 'missions.json'),
      // 2. Root data directory
      path.join(process.cwd(), 'data', 'missions', 'missions.json'),
      // 3. Dist directory (if copied)
      path.join(process.cwd(), 'dist', 'data', 'missions', 'missions.json'),
      // 4. Relative to file (fallback)
      path.join(__dirname, '../../data/missions/missions.json')
    ];


    let foundPath = '';
    for (const p of pathsToCheck) {
      if (fsSync.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (foundPath) {
      this.missionsPath = foundPath;
      console.log(`📚 MissionService initialized with file: ${this.missionsPath}`);
    } else {
      console.error(`❌ Mission file not found! Checked:`, pathsToCheck);
      // Default fallback even if valid path not found to prevent immediate crash, though loading will fail
      this.missionsPath = pathsToCheck[0];
    }
  }

  /**
   * Ensure missions are loaded from the single JSON file
   */
  private async ensureLoaded(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const fileContent = await fs.readFile(this.missionsPath, 'utf-8');
      const missions: Mission[] = JSON.parse(fileContent);

      this.missionsCache.clear();
      for (const mission of missions) {
        this.validateMission(mission);
        this.missionsCache.set(mission.id, mission);
      }

      this.isLoaded = true;
      console.log(`✅ Loaded ${this.missionsCache.size} missions from ${this.missionsPath}`);
    } catch (error) {
      console.error(`❌ Failed to load missions from ${this.missionsPath}:`, error);
      throw error;
    }
  }

  /**
   * Load mission by ID
   */
  async getMission(missionId: string): Promise<Mission | null> {
    await this.ensureLoaded();
    return this.missionsCache.get(missionId) || null;
  }

  /**
   * Get leaderboard data (Real DB)
   */
  async getLeaderboard(limit: number = 10, offset: number = 0) {
    try {
      const topPlayers = await databaseService.getTopPlayers(limit + offset);

      // Slice for pagination (though limit is usually small)
      const data = topPlayers.slice(offset, offset + limit);

      return {
        data,
        total: topPlayers.length
      };
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      return { data: [], total: 0 };
    }
  }

  async getAllMissions(): Promise<Mission[]> {
    await this.ensureLoaded();
    const missions = Array.from(this.missionsCache.values());
    // Sort by order field
    return missions.sort((a, b) => a.order - b.order);
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
