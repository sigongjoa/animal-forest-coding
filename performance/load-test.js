/**
 * k6 성능/부하 테스트 (Load Testing)
 *
 * 목표: 실제 트래픽 환경에서 시스템의 안정성과 성능 측정
 *
 * 실행: k6 run performance/load-test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Counter, Gauge, Rate } from 'k6/metrics';

// 커스텀 메트릭
const requestDuration = new Trend('request_duration');
const requestRate = new Rate('request_rate');
const requestFailedCount = new Counter('request_failures');
const concurrentUsers = new Gauge('concurrent_users');

export const options = {
  // 테스트 단계 정의
  stages: [
    { duration: '10s', target: 10 },   // 10초 동안 10명으로 증가
    { duration: '20s', target: 50 },   // 20초 동안 50명으로 증가
    { duration: '30s', target: 100 },  // 30초 동안 100명으로 증가
    { duration: '20s', target: 50 },   // 20초 동안 50명으로 감소
    { duration: '10s', target: 0 },    // 10초 동안 0명으로 감소
  ],

  // 성능 임계값 정의
  thresholds: {
    // 응답 시간 (p95 < 500ms, p99 < 1000ms)
    'http_req_duration': [
      'p(95)<500',
      'p(99)<1000',
      'avg<300',
    ],

    // 요청 실패율 (< 5%)
    'http_req_failed': ['rate<0.05'],

    // 요청 성공률 (> 95%)
    'request_rate': ['rate>0.95'],

    // 회원 가입 시간 (p95 < 1000ms)
    'group_duration{group:::health_check}': ['p(95)<100'],
  },

  // 실행 설정
  vus: 10,              // 초기 가상 사용자
  duration: '90s',      // 총 실행 시간
};

const BASE_URL = 'http://localhost:5000';

export default function () {
  // 각 VU의 동시 사용자 수 측정
  concurrentUsers.add(__VU);

  // 1. Health Check (매우 빠름)
  group('Health Check', function () {
    const res = http.get(`${BASE_URL}/api/health`);
    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 100ms': (r) => r.timings.duration < 100,
      'has status field': (r) => r.json('status') === 'healthy',
    });

    requestRate.add(success);
    requestDuration.add(res.timings.duration, { endpoint: '/health' });
    if (!success) requestFailedCount.add(1);
  });

  sleep(0.5);

  // 2. Get Characters (데이터 조회)
  group('Get Characters', function () {
    const res = http.get(`${BASE_URL}/api/characters`);
    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
      'has data array': (r) => Array.isArray(r.json('data')),
      'data count > 0': (r) => r.json('data').length > 0,
    });

    requestRate.add(success);
    requestDuration.add(res.timings.duration, { endpoint: '/characters' });
    if (!success) requestFailedCount.add(1);
  });

  sleep(0.5);

  // 3. Get Topics (필터링 포함)
  group('Get Topics with Pagination', function () {
    const res = http.get(`${BASE_URL}/api/topics?limit=20&offset=0`);
    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
      'has metadata': (r) => r.json('metadata') !== null,
      'has hasMore field': (r) => typeof r.json('metadata.hasMore') === 'boolean',
    });

    requestRate.add(success);
    requestDuration.add(res.timings.duration, { endpoint: '/topics' });
    if (!success) requestFailedCount.add(1);
  });

  sleep(0.5);

  // 4. Search Content (검색)
  group('Search Content', function () {
    const queries = ['control', 'loop', 'variable', 'function', 'array'];
    const query = queries[Math.floor(Math.random() * queries.length)];

    const res = http.get(`${BASE_URL}/api/search?q=${query}`);
    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 800ms': (r) => r.timings.duration < 800,
      'has results': (r) => Array.isArray(r.json('data')),
      'has query metadata': (r) => r.json('metadata.query') === query,
    });

    requestRate.add(success);
    requestDuration.add(res.timings.duration, { endpoint: '/search' });
    if (!success) requestFailedCount.add(1);
  });

  sleep(0.5);

  // 5. Get Content (동적 라우팅)
  group('Get Content by Character and Topic', function () {
    // 캐릭터와 주제를 동적으로 선택
    const res = http.get(`${BASE_URL}/api/characters`);
    const characters = res.json('data');

    if (characters && characters.length > 0) {
      const character = characters[0].name;

      const topicsRes = http.get(`${BASE_URL}/api/topics`);
      const topics = topicsRes.json('data');

      if (topics && topics.length > 0) {
        const topic = topics[0].slug;

        const contentRes = http.get(
          `${BASE_URL}/api/content/${character}/${topic}`
        );

        const success = check(contentRes, {
          'status is 200 or 400': (r) => [200, 400].includes(r.status),
          'response time < 1000ms': (r) => r.timings.duration < 1000,
        });

        requestRate.add(success);
        requestDuration.add(contentRes.timings.duration, { endpoint: '/content' });
        if (!success) requestFailedCount.add(1);
      }
    }
  });

  sleep(1);
}

// 테스트 후 요약 보고서
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// 텍스트 요약 함수 (기본 구현)
function textSummary(data, options) {
  let summary = '\n=== 성능 테스트 결과 요약 ===\n';

  if (data.metrics) {
    summary += '\n📊 주요 메트릭:\n';
    summary += `  - 총 요청: ${data.metrics.http_reqs?.value || 0}\n`;
    summary += `  - 평균 응답 시간: ${(data.metrics.http_req_duration?.values?.avg || 0).toFixed(2)}ms\n`;
    summary += `  - P95 응답 시간: ${(data.metrics.http_req_duration?.values?.['p(95)'] || 0).toFixed(2)}ms\n`;
    summary += `  - P99 응답 시간: ${(data.metrics.http_req_duration?.values?.['p(99)'] || 0).toFixed(2)}ms\n`;
    summary += `  - 요청 실패율: ${((data.metrics.http_req_failed?.value || 0) * 100).toFixed(2)}%\n`;
  }

  return summary;
}
