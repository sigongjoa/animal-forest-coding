/**
 * FeedbackContextService Unit Tests
 * Tests for personalized feedback generation context
 */

import { feedbackContextService } from '../../backend/src/services/FeedbackContextService';
import { missionService } from '../../backend/src/services/MissionService';
import { FeedbackContext } from '../../backend/src/services/FeedbackContextService';

describe('FeedbackContextService', () => {
  describe('Skill Level Determination', () => {
    test('should determine beginner level for new students', () => {
      const level = feedbackContextService.determineSkillLevel(0);
      expect(level).toBe('beginner');
    });

    test('should determine beginner level for <3 missions', () => {
      const level = feedbackContextService.determineSkillLevel(2);
      expect(level).toBe('beginner');
    });

    test('should determine intermediate level for 3-7 missions', () => {
      const level = feedbackContextService.determineSkillLevel(5);
      expect(level).toBe('intermediate');
    });

    test('should determine advanced level for 8+ missions', () => {
      const level = feedbackContextService.determineSkillLevel(10);
      expect(level).toBe('advanced');
    });
  });

  describe('Error Pattern Analysis', () => {
    test('should identify recurring error patterns', () => {
      const errorHistory = [
        'syntax_error',
        'syntax_error',
        'logic_error',
        'logic_error',
        'logic_error',
        'undefined_variable',
      ];

      const patterns = feedbackContextService.analyzeErrorPatterns(errorHistory);

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0]).toBe('logic_error'); // Most common
    });

    test('should only return patterns that appear 2+ times', () => {
      const errorHistory = [
        'syntax_error',
        'syntax_error',
        'logic_error', // only 1
        'type_error', // only 1
      ];

      const patterns = feedbackContextService.analyzeErrorPatterns(errorHistory);

      expect(patterns).toContain('syntax_error');
      expect(patterns).not.toContain('logic_error');
    });

    test('should return empty array for no patterns', () => {
      const errorHistory = ['error1', 'error2', 'error3'];
      const patterns = feedbackContextService.analyzeErrorPatterns(errorHistory);

      expect(patterns.length).toBe(0);
    });
  });

  describe('Feedback Guidance Generation', () => {
    test('should use encouraging tone for first attempt', async () => {
      const missions = await missionService.getAllMissions();
      const mission = missions[0];
      if (!mission) throw new Error('Mission not found');

      const context: FeedbackContext = {
        studentContext: {
          studentId: 'student-1',
          skillLevel: 'beginner',
          completedMissions: [],
          totalPointsEarned: 0,
          averageAttemptsPerMission: 1,
          commonErrorPatterns: [],
          preferredLearningStyle: 'example-driven',
          lastMissionCompletedAt: undefined,
        },
        mission,
        currentStep: 1,
        previousAttempts: 1,
        timeSinceLastAttempt: 2,
        hintsUsed: [],
        errorHistory: [],
      };

      const guidance = feedbackContextService.generateFeedbackGuidance(context);

      expect(guidance.tone).toBe('encouraging');
    });

    test('should use explicit hints for beginners on beginner missions', async () => {
      const missions = await missionService.getAllMissions();
      const mission = missions[0];
      if (!mission) throw new Error('Mission not found');

      const context: FeedbackContext = {
        studentContext: {
          studentId: 'student-1',
          skillLevel: 'beginner',
          completedMissions: [],
          totalPointsEarned: 0,
          averageAttemptsPerMission: 1.5,
          commonErrorPatterns: [],
          preferredLearningStyle: 'example-driven',
          lastMissionCompletedAt: undefined,
        },
        mission,
        currentStep: 1,
        previousAttempts: 2,
        timeSinceLastAttempt: 5,
        hintsUsed: ['hint1'],
        errorHistory: ['logic_error'],
      };

      const guidance = feedbackContextService.generateFeedbackGuidance(context);

      expect(guidance.hintLevel).toBe('explicit');
    });

    test('should use suggestive hints for advanced students', async () => {
      const missions = await missionService.getAllMissions();
      const mission = missions[0];
      if (!mission) throw new Error('Mission not found');

      const context: FeedbackContext = {
        studentContext: {
          studentId: 'student-1',
          skillLevel: 'advanced',
          completedMissions: Array.from({ length: 10 }, (_, i) => `mission-${i + 1}`),
          totalPointsEarned: 5000,
          averageAttemptsPerMission: 1.1,
          commonErrorPatterns: [],
          preferredLearningStyle: 'challenge-driven',
          lastMissionCompletedAt: new Date().toISOString(),
        },
        mission,
        currentStep: 1,
        previousAttempts: 1,
        timeSinceLastAttempt: 1,
        hintsUsed: [],
        errorHistory: [],
      };

      const guidance = feedbackContextService.generateFeedbackGuidance(context);

      expect(guidance.hintLevel).toBe('suggestive');
    });

    test('should show code examples for struggling students', () => {
      const mission = {
        id: 'mission-001',
        title: 'Test',
        description: 'Test',
        category: 'test',
        difficulty: 'beginner' as const,
        order: 1,
        prerequisites: [],
        language: 'python' as const,
        points: 500,
        steps: [
          {
            id: 1,
            title: 'Test',
            prompt: 'Test',
            template: 'Test',
            validation: [],
            hints: ['Test'],
            successMessage: 'Test',
            estimatedTimeMinutes: 2,
          },
        ],
        storyContext: {
          character: 'Test',
          narrative: 'Test',
          sceneImages: [],
          initialDialogue: 'Test',
          completionDialogue: 'Test',
        },
        rewards: {
          basePoints: 500,
          speedBonus: 50,
          perfectBonus: 100,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };

      const context: FeedbackContext = {
        studentContext: {
          studentId: 'student-1',
          skillLevel: 'beginner',
          completedMissions: [],
          totalPointsEarned: 0,
          averageAttemptsPerMission: 3.5,
          commonErrorPatterns: [],
          preferredLearningStyle: 'example-driven',
          lastMissionCompletedAt: undefined,
        },
        mission,
        currentStep: 1,
        previousAttempts: 3,
        timeSinceLastAttempt: 10,
        hintsUsed: ['hint1', 'hint2'],
        errorHistory: ['error1', 'error2', 'error3'],
      };

      const guidance = feedbackContextService.generateFeedbackGuidance(context);

      expect(guidance.codeExamplesShown).toBe(true);
    });
  });

  describe('Learning Recommendations', () => {
    test('should recommend review for beginners', () => {
      const recommendations = feedbackContextService.generateLearningRecommendations(
        {
          studentId: 'student-1',
          skillLevel: 'beginner',
          completedMissions: [],
          totalPointsEarned: 0,
          averageAttemptsPerMission: 1,
          commonErrorPatterns: [],
          preferredLearningStyle: 'example-driven',
          lastMissionCompletedAt: undefined,
        },
        {} as any,
        []
      );

      expect(recommendations.length).toBeGreaterThan(0);
      expect(
        recommendations.some(r =>
          r.toLowerCase().includes('tutorial') || r.toLowerCase().includes('simpler')
        )
      ).toBe(true);
    });

    test('should recommend challenges for advanced students', () => {
      const recommendations = feedbackContextService.generateLearningRecommendations(
        {
          studentId: 'student-1',
          skillLevel: 'advanced',
          completedMissions: Array.from({ length: 10 }, (_, i) => `mission-${i + 1}`),
          totalPointsEarned: 5000,
          averageAttemptsPerMission: 1.1,
          commonErrorPatterns: [],
          preferredLearningStyle: 'challenge-driven',
          lastMissionCompletedAt: new Date().toISOString(),
        },
        {} as any,
        []
      );

      expect(recommendations.length).toBeGreaterThan(0);
      expect(
        recommendations.some(r => r.toLowerCase().includes('challenge') || r.toLowerCase().includes('harder'))
      ).toBe(true);
    });

    test('should recommend syntax help for students with syntax errors', () => {
      const recommendations = feedbackContextService.generateLearningRecommendations(
        {
          studentId: 'student-1',
          skillLevel: 'beginner',
          completedMissions: [],
          totalPointsEarned: 0,
          averageAttemptsPerMission: 1,
          commonErrorPatterns: ['syntax_error'],
          preferredLearningStyle: 'example-driven',
          lastMissionCompletedAt: undefined,
        },
        {} as any,
        ['syntax_error']
      );

      expect(recommendations.length).toBeGreaterThan(0);
      expect(
        recommendations.some(r => r.toLowerCase().includes('syntax') || r.toLowerCase().includes('colon'))
      ).toBe(true);
    });
  });

  describe('Fix Time Estimation', () => {
    test('should estimate longer time for syntax errors', () => {
      const syntaxTime = feedbackContextService.estimateFixTime(
        'syntax_error',
        1,
        'beginner'
      );

      expect(syntaxTime).toBeGreaterThan(0);
      expect(syntaxTime).toBeGreaterThan(20);
    });

    test('should estimate longer time for beginners', () => {
      const beginnerTime = feedbackContextService.estimateFixTime(
        'logic_error',
        2,
        'beginner'
      );
      const advancedTime = feedbackContextService.estimateFixTime(
        'logic_error',
        2,
        'advanced'
      );

      expect(beginnerTime).toBeGreaterThan(advancedTime);
    });

    test('should add time for multiple attempts', () => {
      const time1 = feedbackContextService.estimateFixTime('logic_error', 1, 'beginner');
      const time2 = feedbackContextService.estimateFixTime('logic_error', 3, 'beginner');

      expect(time2).toBeGreaterThan(time1);
    });
  });

  describe('Encouragement Generation', () => {
    test('should celebrate perfect first attempt', () => {
      const message = feedbackContextService.generateEncouragement(1, true, {
        studentId: 'student-1',
        skillLevel: 'beginner',
        completedMissions: [],
        totalPointsEarned: 0,
        averageAttemptsPerMission: 1,
        commonErrorPatterns: [],
        preferredLearningStyle: 'example-driven',
        lastMissionCompletedAt: undefined,
      });

      expect(message).toContain('Perfect');
    });

    test('should encourage persistence for multiple attempts', () => {
      const message = feedbackContextService.generateEncouragement(5, true, {
        studentId: 'student-1',
        skillLevel: 'beginner',
        completedMissions: [],
        totalPointsEarned: 0,
        averageAttemptsPerMission: 1,
        commonErrorPatterns: [],
        preferredLearningStyle: 'example-driven',
        lastMissionCompletedAt: undefined,
      });

      expect(message).toBeDefined();
      expect(message.length).toBeGreaterThan(0);
    });

    test('should be supportive for failures', () => {
      const message = feedbackContextService.generateEncouragement(2, false, {
        studentId: 'student-1',
        skillLevel: 'beginner',
        completedMissions: [],
        totalPointsEarned: 0,
        averageAttemptsPerMission: 1,
        commonErrorPatterns: [],
        preferredLearningStyle: 'example-driven',
        lastMissionCompletedAt: undefined,
      });

      expect(message).toBeDefined();
      expect(message.length).toBeGreaterThan(0);
      expect(message).toMatch(/closer|getting|coming/i);
    });
  });
});
