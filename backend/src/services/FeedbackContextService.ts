/**
 * FeedbackContextService
 *
 * Provides contextual information for AI feedback generation:
 * - Student skill level and learning progress
 * - Mission difficulty and learning objectives
 * - Previous attempt history
 * - Error patterns specific to the student
 * - Personalized tone and guidance level
 */

import { Mission } from '../models/Mission';
import { missionService } from './MissionService';

export interface StudentContext {
  studentId: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  completedMissions: string[];
  totalPointsEarned: number;
  averageAttemptsPerMission: number;
  commonErrorPatterns: string[];
  preferredLearningStyle: 'example-driven' | 'concept-driven' | 'challenge-driven';
  lastMissionCompletedAt?: string;
}

export interface FeedbackContext {
  studentContext: StudentContext;
  mission: Mission;
  currentStep: number;
  previousAttempts: number;
  timeSinceLastAttempt: number; // minutes
  hintsUsed: string[];
  errorHistory: string[];
}

export interface FeedbackGuidance {
  tone: 'encouraging' | 'challenging' | 'supportive';
  hintLevel: 'explicit' | 'conceptual' | 'suggestive';
  explanationDepth: 'minimal' | 'moderate' | 'comprehensive';
  codeExamplesShown: boolean;
  debuggingStrategy: 'trace' | 'breakpoint' | 'step-by-step';
}

class FeedbackContextService {
  /**
   * Determine student skill level based on progress
   */
  determineSkillLevel(completedMissions: number): 'beginner' | 'intermediate' | 'advanced' {
    if (completedMissions < 3) {
      return 'beginner';
    } else if (completedMissions < 8) {
      return 'intermediate';
    } else {
      return 'advanced';
    }
  }

  /**
   * Analyze error patterns from student history
   */
  analyzeErrorPatterns(errorHistory: string[]): string[] {
    const patterns: { [key: string]: number } = {};

    for (const error of errorHistory) {
      if (patterns[error]) {
        patterns[error]++;
      } else {
        patterns[error] = 1;
      }
    }

    // Return top patterns (appearing 2+ times)
    return Object.entries(patterns)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([error, _]) => error)
      .slice(0, 3);
  }

  /**
   * Determine appropriate feedback tone and level
   */
  generateFeedbackGuidance(context: FeedbackContext): FeedbackGuidance {
    const { studentContext, previousAttempts, mission } = context;

    // Determine tone
    let tone: 'encouraging' | 'challenging' | 'supportive' = 'supportive';
    if (previousAttempts === 1) {
      tone = 'encouraging'; // First attempt - be positive
    } else if (previousAttempts > 3) {
      tone = 'supportive'; // Multiple attempts - be understanding
    } else if (studentContext.skillLevel === 'advanced') {
      tone = 'challenging'; // Advanced student - challenge them
    }

    // Determine hint level based on skill and difficulty
    let hintLevel: 'explicit' | 'conceptual' | 'suggestive' = 'conceptual';
    if (studentContext.skillLevel === 'beginner' && mission.difficulty === 'beginner') {
      hintLevel = 'explicit'; // Beginners get clear hints
    } else if (studentContext.skillLevel === 'advanced') {
      hintLevel = 'suggestive'; // Advanced students figure it out
    }

    // Determine explanation depth
    let explanationDepth: 'minimal' | 'moderate' | 'comprehensive' = 'moderate';
    if (context.hintsUsed.length > 2) {
      explanationDepth = 'comprehensive'; // They've asked for help, give full explanation
    } else if (studentContext.skillLevel === 'advanced') {
      explanationDepth = 'minimal'; // They can figure it out
    }

    // Show code examples if struggling
    const codeExamplesShown = previousAttempts > 2;

    // Choose debugging strategy based on student skill
    const debuggingStrategy: 'trace' | 'breakpoint' | 'step-by-step' =
      studentContext.skillLevel === 'beginner' ? 'step-by-step' : 'trace';

    return {
      tone,
      hintLevel,
      explanationDepth,
      codeExamplesShown,
      debuggingStrategy,
    };
  }

  /**
   * Generate personalized learning recommendations
   */
  generateLearningRecommendations(
    studentContext: StudentContext,
    mission: Mission,
    errorTypes: string[]
  ): string[] {
    const recommendations: string[] = [];

    // Based on skill level
    if (studentContext.skillLevel === 'beginner') {
      recommendations.push('Review the tutorial video for this concept');
      recommendations.push('Practice with simpler examples first');
    } else if (studentContext.skillLevel === 'intermediate') {
      recommendations.push('Try to understand why the solution works');
      recommendations.push('Attempt a similar problem independently');
    } else {
      recommendations.push('Challenge yourself with a harder variant');
      recommendations.push('Teach a classmate this concept');
    }

    // Based on error patterns
    if (studentContext.commonErrorPatterns.includes('syntax_error')) {
      recommendations.push('Pay attention to Python syntax rules (colons, indentation)');
    }
    if (studentContext.commonErrorPatterns.includes('logic_error')) {
      recommendations.push('Trace through your code with specific inputs');
    }
    if (studentContext.commonErrorPatterns.includes('undefined_variable')) {
      recommendations.push('Check variable names - Python is case-sensitive');
    }

    return recommendations;
  }

  /**
   * Calculate estimated time to fix based on error and student history
   */
  estimateFixTime(
    errorType: string,
    previousAttempts: number,
    studentSkillLevel: string
  ): number {
    // Base time in seconds
    const baseTime: { [key: string]: number } = {
      syntax_error: 30,
      undefined_variable: 45,
      type_error: 60,
      logic_error: 120,
      indentation_error: 20,
      default: 60,
    };

    let time = baseTime[errorType] || baseTime.default;

    // Adjust based on attempts
    time += previousAttempts * 15;

    // Adjust based on skill level
    if (studentSkillLevel === 'advanced') {
      time *= 0.7; // Advanced students fix faster
    } else if (studentSkillLevel === 'beginner') {
      time *= 1.3; // Beginners need more time
    }

    return Math.round(time);
  }

  /**
   * Suggest next mission based on current progress
   */
  async suggestNextMission(
    studentContext: StudentContext,
    currentMissionId: string
  ): Promise<string> {
    const mission = await missionService.getMission(currentMissionId);
    if (!mission) return '';

    const recommendations: string[] = [];

    // If struggling on current mission
    if (studentContext.averageAttemptsPerMission > 3) {
      recommendations.push('Review the prerequisite missions for better foundation');
      return recommendations[0];
    }

    // If doing well
    if (mission.unlocks && mission.unlocks.length > 0) {
      return `You've unlocked: ${mission.unlocks.join(', ')}`;
    }

    return 'Choose your next mission from the available options!';
  }

  /**
   * Generate encouragement message based on context
   */
  generateEncouragement(
    previousAttempts: number,
    isSuccessful: boolean,
    studentContext: StudentContext
  ): string {
    if (isSuccessful) {
      if (previousAttempts === 1) {
        return '🎉 Perfect first attempt! You really understand this concept!';
      } else if (previousAttempts === 2) {
        return '✨ Great job! You fixed it quickly!';
      } else {
        return '🌟 You did it! Persistence pays off!';
      }
    } else {
      if (previousAttempts === 1) {
        return '💪 Good start! You\'re on the right track.';
      } else if (previousAttempts < 3) {
        return '🚀 You\'re getting closer! Keep trying!';
      } else {
        return '🎯 Don\'t give up! Take a break and come back fresh.';
      }
    }
  }
}

export const feedbackContextService = new FeedbackContextService();
