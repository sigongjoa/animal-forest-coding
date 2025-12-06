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
  private isLoaded: boolean = false;

  constructor() {
    // backend/src/services/MissionService.ts -> ../data/missions/missions.json (in src/data)
    this.missionsPath = path.join(__dirname, '../data/missions/missions.json');
    console.log(`📚 MissionService initialized with file: ${this.missionsPath}`);
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
      // 404/500 에러를 방지하기 위해 빈 상태 유지하지 않도록 주의, 빈 배열이라도 로드된 것으로 처리할지 고민
      // 여기서는 일단 실패 로그만 남김
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
   * Get leaderboard data (mock)
   */
  async getLeaderboard(limit: number = 10, offset: number = 0) {
    const mockLeaderboard = [
      { rank: 1, studentId: 'student_001', studentName: 'Isabelle', points: 5200, badges: 12, missionsCompleted: 15 },
      { rank: 2, studentId: 'student_002', studentName: 'Tom Nook', points: 4800, badges: 10, missionsCompleted: 14 },
      { rank: 3, studentId: 'student_003', studentName: 'K.K. Slider', points: 4500, badges: 9, missionsCompleted: 12 },
      { rank: 4, studentId: 'student_004', studentName: 'Blathers', points: 4100, badges: 8, missionsCompleted: 11 },
      { rank: 5, studentId: 'student_005', studentName: 'Timmy', points: 3800, badges: 7, missionsCompleted: 10 },
      { rank: 6, studentId: 'student_006', studentName: 'Tommy', points: 3500, badges: 6, missionsCompleted: 9 },
      { rank: 7, studentId: 'student_007', studentName: 'Mabel', points: 3200, badges: 5, missionsCompleted: 8 },
      { rank: 8, studentId: 'student_008', studentName: 'Sable', points: 2900, badges: 4, missionsCompleted: 7 },
      { rank: 9, studentId: 'student_009', studentName: 'Raymond', points: 2600, badges: 3, missionsCompleted: 6 },
      { rank: 10, studentId: 'student_010', studentName: 'Marshal', points: 2300, badges: 2, missionsCompleted: 5 },
    ];

    return {
      data: mockLeaderboard.slice(offset, offset + limit),
      total: mockLeaderboard.length
    };
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
