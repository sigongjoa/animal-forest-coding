/**
 * 실제 Ollama API 테스트
 * - 로컬 Ollama 서버와 실제 통신
 * - 에러 처리 제거 (try-catch 없음)
 * - 모든 에러 노출
 */

describe('Ollama Integration Tests', () => {
  const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

  /**
   * Test 1: Ollama 서버 헬스 체크
   */
  test('should connect to Ollama server', async () => {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);

    if (!response.ok) {
      throw new Error(`Ollama server not responding: HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Available models:', data.models?.map((m: any) => m.name));

    expect(data.models).toBeDefined();
  });

  /**
   * Test 2: 모델 사용 가능 확인
   */
  test('should verify qwen2 model is available', async () => {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    const data = await response.json();

    const model = data.models?.find((m: any) => m.name.includes('qwen2'));

    if (!model) {
      throw new Error('qwen2 model not found. Available models: ' + data.models?.map((m: any) => m.name).join(', '));
    }

    console.log('✅ qwen2 model available');
    expect(model).toBeDefined();
  });

  /**
   * Test 3: 기본 프롬프트 테스트
   */
  test('should generate response from Ollama', async () => {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2:7b',
        prompt: 'Hello! Say one short sentence.',
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.response) {
      throw new Error('Empty response from Ollama');
    }

    console.log('🤖 Response:', data.response);
    expect(data.response.length).toBeGreaterThan(0);
  });

  /**
   * Test 4: 코드 분석 프롬프트 테스트
   */
  test('should analyze code with Ollama', async () => {
    const codeAnalysisPrompt = `You are a coding tutor. Analyze this code for errors:

\`\`\`python
x = 10
y = 20
print(x y)  # Error here
\`\`\`

Provide feedback in JSON format with: errors (list), suggestions (list), encouragement (string).`;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2:7b',
        prompt: codeAnalysisPrompt,
        stream: false,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.response) {
      throw new Error('Empty response from Ollama');
    }

    console.log('📝 Code analysis response:', data.response.substring(0, 200) + '...');

    // 최소한 일부 내용이 있어야 함
    expect(data.response.length).toBeGreaterThan(50);
  });

  /**
   * Test 5: JSON 응답 파싱
   */
  test('should parse JSON from Ollama response', async () => {
    const jsonPrompt = `Respond ONLY with valid JSON, no other text:
{
  "errors": ["missing comma"],
  "suggestions": ["add comma between arguments"],
  "encouragement": "Good try!"
}`;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2:7b',
        prompt: jsonPrompt,
        stream: false,
      }),
    });

    const data = await response.json();
    const responseText = data.response;

    // JSON 추출
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error(`No JSON found in response: ${responseText}`);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log('✅ Parsed JSON:', parsed);

    expect(parsed).toHaveProperty('errors');
    expect(Array.isArray(parsed.errors)).toBe(true);
  });

  /**
   * Test 6: 성능 테스트
   */
  test('should measure response time', async () => {
    const start = performance.now();

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2:7b',
        prompt: 'What is 2+2?',
        stream: false,
      }),
    });

    const data = await response.json();
    const time = performance.now() - start;

    console.log(`⏱️  Response time: ${time.toFixed(2)}ms`);
    console.log(`📊 Response: ${data.response}`);

    expect(data.response).toBeDefined();
    // 성능 기준: 5초 이내
    expect(time).toBeLessThan(5000);
  });

  /**
   * Test 7: 에러 처리 테스트
   */
  test('should throw error for invalid model', async () => {
    const promise = fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nonexistent_model_xyz',
        prompt: 'test',
        stream: false,
      }),
    });

    // 에러가 발생해야 함
    // 에러 처리 없음 - 직접 throw됨
    const response = await promise;

    if (!response.ok) {
      console.log(`❌ Expected error: HTTP ${response.status}`);
    }

    // 실패할 수 있는 테스트
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  /**
   * Test 8: 캐싱 효과 측정
   */
  test('should measure caching effectiveness', async () => {
    const prompt = 'Summarize Python in one sentence.';

    // 첫 번째 요청
    const start1 = performance.now();
    const response1 = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2:7b',
        prompt,
        stream: false,
      }),
    });
    const time1 = performance.now() - start1;
    const data1 = await response1.json();

    // 두 번째 요청 (동일한 프롬프트)
    const start2 = performance.now();
    const response2 = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2:7b',
        prompt,
        stream: false,
      }),
    });
    const time2 = performance.now() - start2;
    const data2 = await response2.json();

    console.log(`⏱️  First request: ${time1.toFixed(2)}ms`);
    console.log(`⏱️  Second request: ${time2.toFixed(2)}ms`);

    expect(data1.response).toBeDefined();
    expect(data2.response).toBeDefined();
  });

  /**
   * Test 9: 한국어 지원 확인
   */
  test('should support Korean text', async () => {
    const koreanPrompt = '안녕하세요! "print(x y)" 코드의 오류를 설명해주세요. 한국어로 답변해주세요.';

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2:7b',
        prompt: koreanPrompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.response) {
      throw new Error('Empty response from Ollama');
    }

    console.log('🇰🇷 Korean response:', data.response.substring(0, 150) + '...');
    expect(data.response.length).toBeGreaterThan(0);
  });

  /**
   * Test 10: 동시 요청 처리
   */
  test('should handle concurrent requests', async () => {
    const prompts = ['What is 1+1?', 'What is 2+2?', 'What is 3+3?'];

    const promises = prompts.map((prompt) =>
      fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen2:7b',
          prompt,
          stream: false,
        }),
      })
    );

    const responses = await Promise.all(promises);

    // 모든 응답이 성공해야 함
    for (const response of responses) {
      if (!response.ok) {
        throw new Error(`Request failed: HTTP ${response.status}`);
      }
    }

    console.log(`✅ All ${responses.length} concurrent requests succeeded`);
    expect(responses.length).toBe(3);
  });
});
