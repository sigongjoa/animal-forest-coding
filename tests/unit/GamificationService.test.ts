/**
 * GamificationService Unit Tests
 * Tests for points, badges, and leaderboard functionality
 */

import { gamificationService } from '../../backend/src/services/GamificationService';

describe('GamificationService', () => {
  describe('Points Calculation', () => {
    test('should calculate base points', () => {
      const points = gamificationService.calculatePointsForMission(500, 0, 0, 0);
      expect(points).toBe(500);
    });

    test('should add speed bonus', () => {
      const points = gamificationService.calculatePointsForMission(500, 50, 0, 0);
      expect(points).toBe(550);
    });

    test('should add perfect bonus', () => {
      const points = gamificationService.calculatePointsForMission(500, 0, 100, 0);
      expect(points).toBe(600);
    });

    test('should add both bonuses', () => {
      const points = gamificationService.calculatePointsForMission(500, 50, 100, 0);
      expect(points).toBe(650);
    });

    test('should deduct points for hints', () => {
      const points = gamificationService.calculatePointsForMission(500, 50, 100, 3);
      expect(points).toBe(650 - 30); // 620
    });

    test('should not go below base points', () => {
      const points = gamificationService.calculatePointsForMission(500, 0, 0, 100);
      expect(points).toBeGreaterThanOrEqual(500);
    });

    test('should calculate max points correctly', () => {
      const points = gamificationService.calculatePointsForMission(1000, 50, 100, 0);
      expect(points).toBe(1150);
    });
  });

  describe('Badges', () => {
    test('should have 12 badges available', () => {
      const badges = gamificationService.getAllBadges();
      expect(badges.length).toBe(12);
    });

    test('should have badges of all rarity levels', () => {
      const badges = gamificationService.getAllBadges();
      const rarities = new Set(badges.map(b => b.rarity));

      expect(rarities.has('common')).toBe(true);
      expect(rarities.has('rare')).toBe(true);
      expect(rarities.has('epic')).toBe(true);
      expect(rarities.has('legendary')).toBe(true);
    });

    test('should get badges by rarity', () => {
      const commonBadges = gamificationService.getBadgesByRarity('common');
      const rareBadges = gamificationService.getBadgesByRarity('rare');
      const epicBadges = gamificationService.getBadgesByRarity('epic');
      const legendaryBadges = gamificationService.getBadgesByRarity('legendary');

      expect(commonBadges.length).toBe(5);
      expect(rareBadges.length).toBe(3);
      expect(epicBadges.length).toBe(3);
      expect(legendaryBadges.length).toBe(1);
    });

    test('should have all badges with required fields', () => {
      const badges = gamificationService.getAllBadges();

      badges.forEach(badge => {
        expect(badge.id).toBeDefined();
        expect(badge.name).toBeDefined();
        expect(badge.description).toBeDefined();
        expect(badge.icon).toBeDefined();
        expect(badge.points).toBeGreaterThan(0);
        expect(badge.rarity).toBeDefined();
        expect(badge.conditions.length).toBeGreaterThan(0);
      });
    });

    test('should check badge earned for missions completed', () => {
      const studentProgress = {
        studentId: 'student-1',
        totalPoints: 5000,
        badges: [],
        missionsCompleted: 6,
        currentStreak: 0,
        lastMissionCompletedAt: new Date().toISOString(),
        rankPercentile: 50,
      };

      const completedMissions = [
        'mission-001',
        'mission-002',
        'mission-003',
        'mission-004',
        'mission-005',
        'mission-006',
      ];

      const earned = gamificationService.checkBadgeEarned(
        'beginner_graduate',
        studentProgress,
        completedMissions
      );

      expect(earned).toBe(true);
    });

    test('should not earn badge if conditions not met', () => {
      const studentProgress = {
        studentId: 'student-1',
        totalPoints: 1000,
        badges: [],
        missionsCompleted: 3,
        currentStreak: 0,
        lastMissionCompletedAt: new Date().toISOString(),
        rankPercentile: 50,
      };

      const completedMissions = ['mission-001', 'mission-002'];

      const earned = gamificationService.checkBadgeEarned(
        'beginner_graduate',
        studentProgress,
        completedMissions
      );

      expect(earned).toBe(false);
    });
  });

  describe('Leaderboard', () => {
    test('should generate leaderboard correctly', () => {
      const studentProgressMap = new Map([
        [
          'student-1',
          {
            studentId: 'student-1',
            totalPoints: 5000,
            badges: [],
            missionsCompleted: 10,
            currentStreak: 3,
            lastMissionCompletedAt: new Date().toISOString(),
            rankPercentile: 90,
          },
        ],
        [
          'student-2',
          {
            studentId: 'student-2',
            totalPoints: 3000,
            badges: [],
            missionsCompleted: 6,
            currentStreak: 1,
            lastMissionCompletedAt: new Date().toISOString(),
            rankPercentile: 50,
          },
        ],
        [
          'student-3',
          {
            studentId: 'student-3',
            totalPoints: 7000,
            badges: [],
            missionsCompleted: 12,
            currentStreak: 5,
            lastMissionCompletedAt: new Date().toISOString(),
            rankPercentile: 95,
          },
        ],
      ]);

      const studentNames = new Map([
        ['student-1', 'Alice'],
        ['student-2', 'Bob'],
        ['student-3', 'Charlie'],
      ]);

      const leaderboard = gamificationService.generateLeaderboard(
        studentProgressMap,
        studentNames
      );

      expect(leaderboard.length).toBe(3);
      expect(leaderboard[0].studentId).toBe('student-3'); // Highest points first
      expect(leaderboard[0].points).toBe(7000);
      expect(leaderboard[0].rank).toBe(1);
    });

    test('should rank students by points descending', () => {
      const studentProgressMap = new Map([
        [
          'student-1',
          {
            studentId: 'student-1',
            totalPoints: 1000,
            badges: [],
            missionsCompleted: 1,
            currentStreak: 0,
            lastMissionCompletedAt: new Date().toISOString(),
            rankPercentile: 0,
          },
        ],
        [
          'student-2',
          {
            studentId: 'student-2',
            totalPoints: 5000,
            badges: [],
            missionsCompleted: 5,
            currentStreak: 0,
            lastMissionCompletedAt: new Date().toISOString(),
            rankPercentile: 0,
          },
        ],
      ]);

      const studentNames = new Map([
        ['student-1', 'Alice'],
        ['student-2', 'Bob'],
      ]);

      const leaderboard = gamificationService.generateLeaderboard(
        studentProgressMap,
        studentNames
      );

      expect(leaderboard[0].rank).toBe(1);
      expect(leaderboard[0].points).toBe(5000);
      expect(leaderboard[1].rank).toBe(2);
      expect(leaderboard[1].points).toBe(1000);
    });
  });

  describe('Progress Summary', () => {
    test('should return novice level for low points', () => {
      const progress = {
        studentId: 'student-1',
        totalPoints: 500,
        badges: [],
        missionsCompleted: 1,
        currentStreak: 0,
        lastMissionCompletedAt: new Date().toISOString(),
        rankPercentile: 10,
      };

      const summary = gamificationService.getProgressSummary(progress);

      expect(summary.level).toBe('Novice');
      expect(summary.nextMilestone).toBe(1000);
      expect(summary.pointsToNextMilestone).toBe(500);
    });

    test('should return apprentice level for 1000+ points', () => {
      const progress = {
        studentId: 'student-1',
        totalPoints: 1500,
        badges: [],
        missionsCompleted: 3,
        currentStreak: 0,
        lastMissionCompletedAt: new Date().toISOString(),
        rankPercentile: 30,
      };

      const summary = gamificationService.getProgressSummary(progress);

      expect(summary.level).toBe('Apprentice');
      expect(summary.nextMilestone).toBe(3000);
    });

    test('should return expert level for 3000+ points', () => {
      const progress = {
        studentId: 'student-1',
        totalPoints: 4000,
        badges: [],
        missionsCompleted: 8,
        currentStreak: 0,
        lastMissionCompletedAt: new Date().toISOString(),
        rankPercentile: 70,
      };

      const summary = gamificationService.getProgressSummary(progress);

      expect(summary.level).toBe('Expert');
      expect(summary.nextMilestone).toBe(5000);
    });

    test('should return master level for 5000+ points', () => {
      const progress = {
        studentId: 'student-1',
        totalPoints: 6000,
        badges: [],
        missionsCompleted: 12,
        currentStreak: 0,
        lastMissionCompletedAt: new Date().toISOString(),
        rankPercentile: 90,
      };

      const summary = gamificationService.getProgressSummary(progress);

      expect(summary.level).toBe('Master');
      expect(summary.nextMilestone).toBe(8700);
    });
  });

  describe('Achievement Statistics', () => {
    test('should calculate achievement stats correctly', () => {
      const badges = gamificationService.getAllBadges().slice(0, 5);

      const stats = gamificationService.getAchievementStats(badges);

      expect(stats.totalBadges).toBe(5);
      expect(stats.commonBadges).toBeGreaterThanOrEqual(0);
      expect(stats.rareBadges).toBeGreaterThanOrEqual(0);
      expect(stats.epicBadges).toBeGreaterThanOrEqual(0);
      expect(stats.totalBadgePoints).toBeGreaterThan(0);
    });

    test('should sum all badge points', () => {
      const allBadges = gamificationService.getAllBadges();
      const stats = gamificationService.getAchievementStats(allBadges);

      const expectedTotal = allBadges.reduce((sum, b) => sum + b.points, 0);
      expect(stats.totalBadgePoints).toBe(expectedTotal);
    });
  });

  describe('Rank Percentile Calculation', () => {
    test('should calculate correct percentile', () => {
      const allPoints = [1000, 2000, 3000, 4000, 5000];
      const studentPoints = 3000;

      const percentile = gamificationService.calculateRankPercentile(
        studentPoints,
        allPoints
      );

      expect(percentile).toBeGreaterThan(0);
      expect(percentile).toBeLessThanOrEqual(100);
      // Student with 3000 points should be in middle
      expect(percentile).toBeGreaterThanOrEqual(40);
      expect(percentile).toBeLessThanOrEqual(60);
    });
  });
});
