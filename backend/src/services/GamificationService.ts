/**
 * GamificationService
 *
 * Manages the gamification system:
 * - Points calculation and tracking
 * - Badge earning and unlocking
 * - Leaderboard management
 * - Achievement milestones
 * - Reward notifications
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  conditions: BadgeCondition[];
  unlockedAt?: string;
}

export interface BadgeCondition {
  type:
    | 'missions_completed'
    | 'perfect_attempts'
    | 'speed_completion'
    | 'difficulty_streak'
    | 'consecutive_days'
    | 'total_points'
    | 'specific_mission'
    | 'learning_path_complete';
  value: number | string;
}

export interface StudentProgress {
  studentId: string;
  totalPoints: number;
  badges: Badge[];
  missionsCompleted: number;
  currentStreak: number; // consecutive days
  lastMissionCompletedAt: string;
  rankPercentile: number; // 0-100
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  points: number;
  badges: number;
  missionsCompleted: number;
  avatar?: string;
}

class GamificationService {
  private badges: Map<string, Badge> = new Map();
  private leaderboardCache: Map<string, { data: LeaderboardEntry[]; timestamp: number }> =
    new Map();
  private cacheMaxAge: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeBadges();
  }

  /**
   * Initialize all available badges
   */
  private initializeBadges(): void {
    const allBadges: Badge[] = [
      // Achievement Badges
      {
        id: 'beginner_graduate',
        name: 'Beginner Graduate',
        description: 'Complete all 6 beginner missions',
        icon: '🌱',
        points: 250,
        rarity: 'common',
        conditions: [
          {
            type: 'missions_completed',
            value:
              'mission-001,mission-002,mission-003,mission-004,mission-005,mission-006',
          },
        ],
      },
      {
        id: 'intermediate_expert',
        name: 'Intermediate Expert',
        description: 'Complete all 4 intermediate missions',
        icon: '🌿',
        points: 500,
        rarity: 'rare',
        conditions: [
          {
            type: 'missions_completed',
            value: 'mission-007,mission-008,mission-009,mission-010',
          },
        ],
      },
      {
        id: 'master_programmer',
        name: 'Master Programmer',
        description: 'Complete all 12 missions',
        icon: '🌳',
        points: 1000,
        rarity: 'legendary',
        conditions: [{ type: 'missions_completed', value: '12' }],
      },

      // Speed Badges
      {
        id: 'speed_runner',
        name: 'Speed Runner',
        description: 'Complete a mission in less than 50% of estimated time',
        icon: '⚡',
        points: 100,
        rarity: 'common',
        conditions: [{ type: 'speed_completion', value: '0.5' }],
      },
      {
        id: 'lightning_fast',
        name: 'Lightning Fast',
        description: 'Complete 5 missions under 50% time',
        icon: '💥',
        points: 300,
        rarity: 'rare',
        conditions: [{ type: 'speed_completion', value: '5' }],
      },

      // Perfect Performance
      {
        id: 'perfect_student',
        name: 'Perfect Student',
        description: 'Get a mission right on first try',
        icon: '💯',
        points: 50,
        rarity: 'common',
        conditions: [{ type: 'perfect_attempts', value: '1' }],
      },
      {
        id: 'flawless',
        name: 'Flawless',
        description: 'Get 5 missions right on first try',
        icon: '✨',
        points: 250,
        rarity: 'epic',
        conditions: [{ type: 'perfect_attempts', value: '5' }],
      },

      // Streak Badges
      {
        id: 'on_a_roll',
        name: 'On a Roll',
        description: 'Complete 3 missions in a row without hints',
        icon: '🔥',
        points: 150,
        rarity: 'common',
        conditions: [{ type: 'difficulty_streak', value: '3' }],
      },
      {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Complete 10 consecutive missions without hints',
        icon: '🚀',
        points: 500,
        rarity: 'epic',
        conditions: [{ type: 'difficulty_streak', value: '10' }],
      },

      // Milestone Badges
      {
        id: 'milestone_1k',
        name: '1K Champion',
        description: 'Earn 1,000 points',
        icon: '🏆',
        points: 100,
        rarity: 'common',
        conditions: [{ type: 'total_points', value: '1000' }],
      },
      {
        id: 'milestone_5k',
        name: '5K Legend',
        description: 'Earn 5,000 points',
        icon: '👑',
        points: 500,
        rarity: 'epic',
        conditions: [{ type: 'total_points', value: '5000' }],
      },

      // Consistency
      {
        id: 'consistent_learner',
        name: 'Consistent Learner',
        description: 'Complete missions on 5 consecutive days',
        icon: '📅',
        points: 200,
        rarity: 'rare',
        conditions: [{ type: 'consecutive_days', value: '5' }],
      },
    ];

    allBadges.forEach(badge => {
      this.badges.set(badge.id, badge);
    });
  }

  /**
   * Calculate points for a mission completion
   */
  calculatePointsForMission(
    basPoints: number,
    speedBonus: number,
    perfectBonus: number,
    hintsUsedCount: number
  ): number {
    const hintPenalty = hintsUsedCount * 10;
    const totalPoints = Math.max(basPoints + speedBonus + perfectBonus - hintPenalty, basPoints);
    return totalPoints;
  }

  /**
   * Check if student earned a badge
   */
  checkBadgeEarned(
    badgeId: string,
    studentProgress: StudentProgress,
    completedMissions: string[]
  ): boolean {
    const badge = this.badges.get(badgeId);
    if (!badge) return false;

    for (const condition of badge.conditions) {
      if (!this.evaluateCondition(condition, studentProgress, completedMissions)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate a single badge condition
   */
  private evaluateCondition(
    condition: BadgeCondition,
    studentProgress: StudentProgress,
    completedMissions: string[]
  ): boolean {
    switch (condition.type) {
      case 'missions_completed': {
        const missionIds = (condition.value as string).split(',');
        return missionIds.every(id => completedMissions.includes(id));
      }

      case 'total_points': {
        return studentProgress.totalPoints >= Number(condition.value);
      }

      case 'perfect_attempts': {
        // This would need to be tracked in student progress
        // For now, simplified check
        return Number(condition.value) <= studentProgress.missionsCompleted / 2;
      }

      case 'difficulty_streak': {
        return studentProgress.currentStreak >= Number(condition.value);
      }

      case 'consecutive_days': {
        // Would need proper implementation with date tracking
        return studentProgress.currentStreak >= Number(condition.value);
      }

      case 'speed_completion': {
        // Would need proper implementation
        return true;
      }

      case 'specific_mission': {
        return completedMissions.includes(condition.value as string);
      }

      default:
        return false;
    }
  }

  /**
   * Get all available badges
   */
  getAllBadges(): Badge[] {
    return Array.from(this.badges.values());
  }

  /**
   * Get badges by rarity
   */
  getBadgesByRarity(rarity: 'common' | 'rare' | 'epic' | 'legendary'): Badge[] {
    return Array.from(this.badges.values()).filter(badge => badge.rarity === rarity);
  }

  /**
   * Calculate leaderboard ranking
   */
  calculateRankPercentile(studentPoints: number, allStudentPoints: number[]): number {
    const sortedPoints = allStudentPoints.sort((a, b) => b - a);
    const rank = sortedPoints.findIndex(p => p <= studentPoints);
    return Math.round(((allStudentPoints.length - rank) / allStudentPoints.length) * 100);
  }

  /**
   * Generate leaderboard
   */
  generateLeaderboard(
    studentProgressMap: Map<string, StudentProgress>,
    studentNames: Map<string, string>
  ): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = Array.from(studentProgressMap.values()).map(
      (progress, index) => ({
        rank: index + 1,
        studentId: progress.studentId,
        studentName: studentNames.get(progress.studentId) || 'Anonymous',
        points: progress.totalPoints,
        badges: progress.badges.length,
        missionsCompleted: progress.missionsCompleted,
        avatar: undefined, // Could be added later
      })
    );

    // Sort by points descending
    entries.sort((a, b) => b.points - a.points);

    // Update ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  }

  /**
   * Get student progress summary
   */
  getProgressSummary(progress: StudentProgress): {
    level: 'Novice' | 'Apprentice' | 'Expert' | 'Master';
    nextMilestone: number;
    pointsToNextMilestone: number;
    progressPercentage: number;
  } {
    const milestones = [1000, 3000, 5000, 8700];

    let level: 'Novice' | 'Apprentice' | 'Expert' | 'Master' = 'Novice';
    if (progress.totalPoints >= 5000) {
      level = 'Master';
    } else if (progress.totalPoints >= 3000) {
      level = 'Expert';
    } else if (progress.totalPoints >= 1000) {
      level = 'Apprentice';
    }

    const nextMilestoneIndex = milestones.findIndex(m => m > progress.totalPoints);
    const nextMilestone = nextMilestoneIndex >= 0 ? milestones[nextMilestoneIndex] : 8700;

    const pointsToNextMilestone = Math.max(0, nextMilestone - progress.totalPoints);
    const progressPercentage = Math.round(
      ((nextMilestone - pointsToNextMilestone) / nextMilestone) * 100
    );

    return {
      level,
      nextMilestone,
      pointsToNextMilestone,
      progressPercentage,
    };
  }

  /**
   * Get achievement statistics
   */
  getAchievementStats(
    badgesEarned: Badge[]
  ): {
    totalBadges: number;
    commonBadges: number;
    rareBadges: number;
    epicBadges: number;
    legendaryBadges: number;
    totalBadgePoints: number;
  } {
    return {
      totalBadges: badgesEarned.length,
      commonBadges: badgesEarned.filter(b => b.rarity === 'common').length,
      rareBadges: badgesEarned.filter(b => b.rarity === 'rare').length,
      epicBadges: badgesEarned.filter(b => b.rarity === 'epic').length,
      legendaryBadges: badgesEarned.filter(b => b.rarity === 'legendary').length,
      totalBadgePoints: badgesEarned.reduce((sum, b) => sum + b.points, 0),
    };
  }
}

export const gamificationService = new GamificationService();
