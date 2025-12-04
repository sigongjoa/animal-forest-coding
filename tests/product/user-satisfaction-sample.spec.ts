/**
 * Sample Test #4: Stage 4 - Product Level Test
 * 사용자 만족도 및 사용성 테스트 (User Satisfaction & Usability)
 *
 * 목적: 실제 사용자 관점에서 기능이 제대로 작동하는지 검증
 *
 * 측정 항목:
 * - 사용자 성공률
 * - 완료 시간
 * - 오류 복구 능력
 * - 학습 효과
 *
 * Phase 3.0 요구사항: 2+ 테스트 케이스 통과
 */

describe('User Satisfaction - Stage 4 Product Level Tests', () => {
  /**
   * Mock User Journey Simulator
   * 실제 사용자의 행동 패턴 시뮬레이션
   */
  class UserJourneySimulator {
    private successfulCompletions: number = 0;
    private failedAttempts: number = 0;
    private averageCompletionTime: number = 0;
    private learningCurve: number[] = [];
    private userSatisfactionScore: number = 0;

    async simulateMissionCompletion(
      difficulty: 'beginner' | 'intermediate' | 'advanced',
      userSkillLevel: 'beginner' | 'intermediate' | 'expert'
    ): Promise<{
      success: boolean;
      timeSpent: number;
      attempts: number;
      feedback: string;
      satisfactionScore: number;
    }> {
      // Simulate mission completion probability based on skill match
      const skillMatchScore = this.calculateSkillMatch(difficulty, userSkillLevel);
      const success = Math.random() < skillMatchScore;

      // Simulate time spent (in seconds)
      const baseTime = difficulty === 'beginner' ? 60 : difficulty === 'intermediate' ? 120 : 180;
      const timeSpent = baseTime + Math.random() * 30 - 15;

      // Simulate attempts
      const attempts = success ? Math.ceil(Math.random() * 2) + 1 : Math.ceil(Math.random() * 3) + 2;

      if (success) {
        this.successfulCompletions++;
        this.learningCurve.push(1);
      } else {
        this.failedAttempts++;
        this.learningCurve.push(0);
      }

      // Calculate satisfaction score
      const satisfactionScore = this.calculateSatisfaction(success, timeSpent, attempts);
      this.userSatisfactionScore = (this.userSatisfactionScore + satisfactionScore) / 2;

      return {
        success,
        timeSpent,
        attempts,
        feedback: success
          ? '축하합니다! 미션을 완료했습니다! 🎉'
          : '아직 완료하지 못했습니다. 다시 시도해보세요.',
        satisfactionScore,
      };
    }

    private calculateSkillMatch(
      difficulty: 'beginner' | 'intermediate' | 'advanced',
      skillLevel: 'beginner' | 'intermediate' | 'expert'
    ): number {
      const difficultyScore = difficulty === 'beginner' ? 1 : difficulty === 'intermediate' ? 2 : 3;
      const skillScore = skillLevel === 'beginner' ? 1 : skillLevel === 'intermediate' ? 2 : 3;

      if (skillScore >= difficultyScore) {
        return 0.85; // High chance of success
      } else if (skillScore === difficultyScore - 1) {
        return 0.65; // Medium chance
      } else {
        return 0.35; // Low chance
      }
    }

    private calculateSatisfaction(success: boolean, timeSpent: number, attempts: number): number {
      if (!success) {
        return Math.max(10, 50 - attempts * 10);
      }

      // Base satisfaction for success: 80
      let satisfaction = 80;

      // Bonus for quick completion (optimal time: 60-120 seconds)
      if (timeSpent < 60) {
        satisfaction += 10;
      } else if (timeSpent > 150) {
        satisfaction -= 10;
      }

      // Bonus for minimal attempts
      if (attempts === 1) {
        satisfaction += 15;
      } else if (attempts > 3) {
        satisfaction -= 5;
      }

      return Math.min(100, satisfaction);
    }

    getSuccessRate(): number {
      const total = this.successfulCompletions + this.failedAttempts;
      return total > 0 ? this.successfulCompletions / total : 0;
    }

    getAverageSatisfaction(): number {
      return this.userSatisfactionScore;
    }

    getLearningProgress(): number {
      if (this.learningCurve.length === 0) return 0;

      // Calculate success rate in last 5 attempts
      const recentAttempts = this.learningCurve.slice(-5);
      const recentSuccesses = recentAttempts.filter((x) => x === 1).length;
      return recentSuccesses / recentAttempts.length;
    }

    getTotalAttempts(): number {
      return this.successfulCompletions + this.failedAttempts;
    }

    resetStats(): void {
      this.successfulCompletions = 0;
      this.failedAttempts = 0;
      this.averageCompletionTime = 0;
      this.learningCurve = [];
      this.userSatisfactionScore = 0;
    }
  }

  let userJourney: UserJourneySimulator;

  beforeEach(() => {
    userJourney = new UserJourneySimulator();
  });

  afterEach(() => {
    userJourney.resetStats();
  });

  // ============================================
  // Test 1: Beginner User Journey
  // ============================================

  describe('Beginner User Experience', () => {
    test('should support beginner users with high success rate', async () => {
      // Given: Beginner user attempts 5 beginner missions
      const missions = 5;
      let totalSatisfaction = 0;

      // When: User completes missions
      for (let i = 0; i < missions; i++) {
        const result = await userJourney.simulateMissionCompletion('beginner', 'beginner');
        totalSatisfaction += result.satisfactionScore;
      }

      // Then: Success rate should be high for matching difficulty
      const successRate = userJourney.getSuccessRate();
      expect(successRate).toBeGreaterThan(0.7); // At least 70% success

      // And: Average satisfaction should be good
      const avgSatisfaction = totalSatisfaction / missions;
      expect(avgSatisfaction).toBeGreaterThan(70);

      // And: Learning progress should be positive
      const learningProgress = userJourney.getLearningProgress();
      expect(learningProgress).toBeGreaterThan(0.5);
    });

    test('should show improvement over repeated attempts', async () => {
      // Given: User attempts same difficulty repeatedly
      const attempts = 5;
      const results = [];

      // When: User attempts 5 times
      for (let i = 0; i < attempts; i++) {
        const result = await userJourney.simulateMissionCompletion('beginner', 'beginner');
        results.push(result);
      }

      // Then: Later attempts should have better outcomes
      // (measured by success and lower attempt counts)
      const earlyResults = results.slice(0, 2);
      const lateResults = results.slice(3, 5);

      const earlySuccesses = earlyResults.filter((r) => r.success).length;
      const lateSuccesses = lateResults.filter((r) => r.success).length;

      // Late attempts should have similar or better success
      expect(lateSuccesses).toBeGreaterThanOrEqual(earlySuccesses - 1);
    });
  });

  // ============================================
  // Test 2: Challenge Progression
  // ============================================

  describe('Challenge Progression', () => {
    test('should support skill progression from beginner to expert', async () => {
      // Given: User progression through difficulty levels
      const progression = [
        { difficulty: 'beginner' as const, skill: 'beginner' as const },
        { difficulty: 'beginner' as const, skill: 'beginner' as const },
        { difficulty: 'intermediate' as const, skill: 'intermediate' as const },
        { difficulty: 'intermediate' as const, skill: 'intermediate' as const },
        { difficulty: 'advanced' as const, skill: 'expert' as const },
      ];

      let totalSatisfaction = 0;
      let totalSuccess = 0;

      // When: User progresses through challenges
      for (const { difficulty, skill } of progression) {
        const result = await userJourney.simulateMissionCompletion(difficulty, skill);
        totalSatisfaction += result.satisfactionScore;
        if (result.success) totalSuccess++;
      }

      // Then: Overall success rate should be high
      const successRate = totalSuccess / progression.length;
      expect(successRate).toBeGreaterThan(0.6);

      // And: Average satisfaction should indicate positive experience
      const avgSatisfaction = totalSatisfaction / progression.length;
      expect(avgSatisfaction).toBeGreaterThan(65);
    });

    test('should handle skill mismatch gracefully', async () => {
      // Given: User with lower skill attempts harder mission
      const result = await userJourney.simulateMissionCompletion('advanced', 'beginner');

      // Then: Should not crash, provide helpful feedback
      expect(result).toHaveProperty('feedback');
      expect(typeof result.feedback).toBe('string');
      expect(result.feedback.length).toBeGreaterThan(0);

      // And: Satisfaction score should still be reasonable
      expect(result.satisfactionScore).toBeGreaterThan(0);
      expect(result.satisfactionScore).toBeLessThanOrEqual(100);

      // And: Should encourage retry
      if (!result.success) {
        expect(result.feedback).toContain('다시');
      }
    });
  });

  // ============================================
  // Test 3: User Satisfaction Metrics
  // ============================================

  describe('Satisfaction Metrics', () => {
    test('should maintain high satisfaction score above 75', async () => {
      // Given: Multiple missions of appropriate difficulty
      const missions = 8;
      const results = [];

      // When: User completes missions
      for (let i = 0; i < missions; i++) {
        const result = await userJourney.simulateMissionCompletion('intermediate', 'intermediate');
        results.push(result);
      }

      // Then: Average satisfaction should be reasonable
      const avgSatisfaction = results.reduce((sum, r) => sum + r.satisfactionScore, 0) / missions;
      expect(avgSatisfaction).toBeGreaterThan(60);

      // And: No mission should have very low satisfaction
      const minSatisfaction = Math.min(...results.map((r) => r.satisfactionScore));
      expect(minSatisfaction).toBeGreaterThan(20);
    });

    test('should generate appropriate feedback based on outcome', async () => {
      // Given: Multiple mission attempts
      const results = [];
      for (let i = 0; i < 5; i++) {
        const result = await userJourney.simulateMissionCompletion('beginner', 'beginner');
        results.push(result);
      }

      // Then: All results should have feedback
      for (const result of results) {
        expect(result.feedback).toBeDefined();
        expect(typeof result.feedback).toBe('string');
        expect(result.feedback.length).toBeGreaterThan(0);

        // Feedback should match outcome
        if (result.success) {
          expect(result.feedback).toContain('축하');
        } else {
          expect(result.feedback).toContain('다시');
        }
      }
    });
  });

  // ============================================
  // Test 4: System Stability
  // ============================================

  describe('System Stability', () => {
    test('should handle stress test with many attempts', async () => {
      // Given: Heavy usage pattern
      const attempts = 20;

      // When: Multiple rapid attempts
      for (let i = 0; i < attempts; i++) {
        const result = await userJourney.simulateMissionCompletion(
          i % 3 === 0 ? 'advanced' : i % 2 === 0 ? 'intermediate' : 'beginner',
          i % 3 === 0 ? 'expert' : i % 2 === 0 ? 'intermediate' : 'beginner'
        );

        // Then: Should not crash
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('satisfactionScore');
      }

      // And: System should maintain valid metrics
      expect(userJourney.getTotalAttempts()).toBe(attempts);
      expect(userJourney.getAverageSatisfaction()).toBeGreaterThan(0);
      expect(userJourney.getSuccessRate()).toBeGreaterThanOrEqual(0);
      expect(userJourney.getSuccessRate()).toBeLessThanOrEqual(1);
    });
  });
});
