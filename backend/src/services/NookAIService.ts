/**
 * NookAIService - AI-Powered Feedback Generation
 *
 * 책임:
 * - Ollama 통합 (로컬 LLM)
 * - 오류 분류 (15가지)
 * - 학생 피드백 생성
 * - 응답 검증
 *
 * Phase 3.1 구현
 */

export interface CodeSubmission {
  studentId: string;
  missionId: string;
  code: string;
  language: 'python' | 'javascript' | 'typescript';
  submittedAt: Date;
}

export interface ErrorClassification {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  lineNumber?: number;
  description: string;
}

export interface AiFeedback {
  submissionId: string;
  studentId: string;
  missionId: string;
  code: string;
  errors: ErrorClassification[];
  suggestions: string[];
  encouragement: string;
  nextSteps: string[];
  learningPoints: string[];
  estimatedFixTime: number; // seconds
  generatedAt: Date;
}

/**
 * 오류 분류 정의 (15가지)
 */
const ERROR_TYPES = {
  SYNTAX_ERROR: 'syntax_error',
  UNDEFINED_VARIABLE: 'undefined_variable',
  TYPE_ERROR: 'type_error',
  INDENTATION_ERROR: 'indentation_error',
  LOGIC_ERROR: 'logic_error',
  OFF_BY_ONE: 'off_by_one',
  INFINITE_LOOP: 'infinite_loop',
  MISSING_RETURN: 'missing_return',
  INVALID_COMPARISON: 'invalid_comparison',
  INCORRECT_OPERATOR: 'incorrect_operator',
  FUNCTION_NOT_DEFINED: 'function_not_defined',
  MODULE_NOT_IMPORTED: 'module_not_imported',
  INCORRECT_METHOD: 'incorrect_method',
  WRONG_DATA_TYPE: 'wrong_data_type',
  MISSING_ARGUMENT: 'missing_argument',
};

/**
 * NookAIService: Ollama를 활용한 AI 피드백
 */
export class NookAIService {
  private ollamaUrl: string;
  private model: string = 'qwen2:7b'; // Ollama에서 제공하는 모델
  private systemPrompt: string;
  private feedbackCache: Map<string, { feedback: AiFeedback; timestamp: number }> = new Map();
  private cacheMaxAge: number = 24 * 60 * 60 * 1000; // 24시간 캐시

  constructor(ollamaUrl?: string) {
    this.ollamaUrl = ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434';

    this.systemPrompt = `You are NookTeacher, an AI coding mentor in the style of Animal Crossing's character Tom Nook.
Your role is to provide warm, encouraging feedback to students learning to code.

Guidelines:
1. Identify errors in a friendly, non-judgmental way
2. Explain what went wrong and why
3. Provide specific suggestions for fixing the code
4. Encourage the student with positive feedback
5. Suggest next steps for learning
6. Use simple, clear language
7. Include learning points to reinforce concepts

Always respond in JSON format with this structure:
{
  "errors": [
    {
      "type": "error_type",
      "severity": "critical|high|medium|low",
      "lineNumber": null,
      "description": "What went wrong"
    }
  ],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "encouragement": "Positive message",
  "nextSteps": ["step 1", "step 2"],
  "learningPoints": ["point 1", "point 2"],
  "estimatedFixTime": 120
}`;
  }

  /**
   * 캐시 키 생성 (학생, 미션, 코드 기반)
   */
  private _generateCacheKey(submission: CodeSubmission): string {
    return `${submission.studentId}:${submission.missionId}:${submission.code}`;
  }

  /**
   * 캐시에서 피드백 조회
   */
  private _getCachedFeedback(submission: CodeSubmission): AiFeedback | null {
    const cacheKey = this._generateCacheKey(submission);
    const cached = this.feedbackCache.get(cacheKey);

    if (!cached) {
      return null;
    }

    // 캐시 만료 확인
    const age = Date.now() - cached.timestamp;
    if (age > this.cacheMaxAge) {
      this.feedbackCache.delete(cacheKey);
      return null;
    }

    return cached.feedback;
  }

  /**
   * 피드백을 캐시에 저장
   */
  private _cacheFeedback(submission: CodeSubmission, feedback: AiFeedback): void {
    const cacheKey = this._generateCacheKey(submission);
    this.feedbackCache.set(cacheKey, {
      feedback,
      timestamp: Date.now()
    });
  }

  /**
   * 코드 분석 및 피드백 생성 (캐싱 포함)
   */
  async generateFeedback(submission: CodeSubmission): Promise<AiFeedback> {
    try {
      // Step 1: 캐시 확인
      const cachedFeedback = this._getCachedFeedback(submission);
      if (cachedFeedback) {
        return cachedFeedback;
      }

      // Step 2: Ollama API 호출
      const prompt = `${this.systemPrompt}

User code (${submission.language}):
\`\`\`
${submission.code}
\`\`\`

Please analyze this code and provide feedback in JSON format.`;

      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = (await response.json()) as { response: string };
      const responseText = data.response;

      let feedbackData;
      try {
        // JSON 추출 (응답에 추가 텍스트가 있을 수 있으므로)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.warn('No JSON found in Ollama response, using default feedback');
          feedbackData = this._createDefaultFeedback();
        } else {
          feedbackData = JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.warn('JSON parsing failed, using default feedback:', error);
        feedbackData = this._createDefaultFeedback();
      }

      // 응답 검증
      this._validateFeedbackResponse(feedbackData);

      // 최종 피드백 객체 생성
      const feedback: AiFeedback = {
        submissionId: `sub_${Date.now()}`,
        studentId: submission.studentId,
        missionId: submission.missionId,
        code: submission.code,
        errors: feedbackData.errors || [],
        suggestions: feedbackData.suggestions || [],
        encouragement: feedbackData.encouragement || '잘했어요!',
        nextSteps: feedbackData.nextSteps || [],
        learningPoints: feedbackData.learningPoints || [],
        estimatedFixTime: feedbackData.estimatedFixTime || 300,
        generatedAt: new Date(),
      };

      // Step 3: 피드백을 캐시에 저장
      this._cacheFeedback(submission, feedback);

      return feedback;
    } catch (error) {
      console.error('Error generating feedback:', error);
      throw error;
    }
  }

  /**
   * 기본 피드백 생성 (API 실패시)
   */
  private _createDefaultFeedback(): Partial<AiFeedback> {
    return {
      errors: [
        {
          type: 'syntax_error',
          severity: 'high',
          description: 'Code could not be analyzed. Please check for syntax errors.',
        },
      ],
      suggestions: ['Review the code structure', 'Check for missing semicolons or brackets'],
      encouragement: '계속해서 도전해보세요!',
      nextSteps: ['재검토 후 다시 제출하기'],
      learningPoints: ['Syntax checking'],
      estimatedFixTime: 300,
    };
  }

  /**
   * 피드백 응답 검증
   */
  private _validateFeedbackResponse(data: any): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid feedback response format');
    }

    // 필수 필드 검증
    if (!Array.isArray(data.errors)) {
      data.errors = [];
    }

    if (!Array.isArray(data.suggestions)) {
      data.suggestions = [];
    }

    if (typeof data.encouragement !== 'string') {
      data.encouragement = '잘 했어요!';
    }

    if (!Array.isArray(data.nextSteps)) {
      data.nextSteps = [];
    }

    if (!Array.isArray(data.learningPoints)) {
      data.learningPoints = [];
    }

    if (typeof data.estimatedFixTime !== 'number') {
      data.estimatedFixTime = 300;
    }
  }

  /**
   * 오류 분류 (자동)
   */
  classifyErrors(code: string): ErrorClassification[] {
    const errors: ErrorClassification[] = [];

    // Syntax Error 감지
    if (!/\:$/.test(code) && code.includes('if ')) {
      errors.push({
        type: ERROR_TYPES.SYNTAX_ERROR,
        severity: 'critical',
        description: 'Missing colon (:) after conditional statement',
      });
    }

    // Indentation Error 감지
    if (code.includes('\n  ') && code.includes('\n    ')) {
      errors.push({
        type: ERROR_TYPES.INDENTATION_ERROR,
        severity: 'high',
        description: 'Inconsistent indentation detected',
      });
    }

    // Undefined variable 감지 (간단한 패턴)
    const vars = code.match(/\b[a-z_]\w*\b/gi) || [];
    const defined = new Set<string>();
    code.split('\n').forEach((line) => {
      if (/^\s*(let|const|var)\s+/.test(line) || /^\s*\w+\s*=/.test(line)) {
        const match = line.match(/\b([a-z_]\w*)\b/i);
        if (match) defined.add(match[1].toLowerCase());
      }
    });

    return errors;
  }

  /**
   * 응답 형식 검증 (Prompt Injection 방어)
   */
  isValidResponse(response: AiFeedback): boolean {
    // 응답이 예상된 구조를 따르는지 확인
    if (!response || typeof response !== 'object') {
      return false;
    }

    // 필수 필드 확인
    if (
      !Array.isArray(response.errors) ||
      !Array.isArray(response.suggestions) ||
      !Array.isArray(response.nextSteps) ||
      !Array.isArray(response.learningPoints)
    ) {
      return false;
    }

    // 문자열 필드 확인
    if (typeof response.encouragement !== 'string') {
      return false;
    }

    // 숫자 필드 확인
    if (typeof response.estimatedFixTime !== 'number') {
      return false;
    }

    return true;
  }

  /**
   * 오류 심각도별 분류
   */
  getErrorsBySeverity(feedback: AiFeedback): {
    critical: ErrorClassification[];
    high: ErrorClassification[];
    medium: ErrorClassification[];
    low: ErrorClassification[];
  } {
    return {
      critical: feedback.errors.filter((e) => e.severity === 'critical'),
      high: feedback.errors.filter((e) => e.severity === 'high'),
      medium: feedback.errors.filter((e) => e.severity === 'medium'),
      low: feedback.errors.filter((e) => e.severity === 'low'),
    };
  }

  /**
   * 피드백 요약
   */
  summarizeFeedback(feedback: AiFeedback): string {
    const criticalCount = feedback.errors.filter((e) => e.severity === 'critical').length;
    const highCount = feedback.errors.filter((e) => e.severity === 'high').length;

    if (criticalCount === 0 && highCount === 0) {
      return '코드가 잘 작동합니다! 약간의 개선만 하면 됩니다.';
    }

    return `${criticalCount}개의 중요한 오류와 ${highCount}개의 높은 오류가 있습니다.`;
  }

  /**
   * 캐시 비우기 (테스트용)
   */
  clearCache(): void {
    this.feedbackCache.clear();
  }

  /**
   * 캐시 통계 조회
   */
  getCacheStats(): { size: number; entries: number } {
    return {
      size: this.feedbackCache.size,
      entries: this.feedbackCache.size
    };
  }
}

// 싱글톤 인스턴스
let nookAIInstance: NookAIService | null = null;

/**
 * NookAIService 싱글톤 인스턴스 획득
 */
export function getNookAIService(): NookAIService {
  if (!nookAIInstance) {
    nookAIInstance = new NookAIService();
  }
  return nookAIInstance;
}
