/**
 * 성능/부하 테스트 (Node.js + Autocannon)
 *
 * 목표: 실제 트래픽 환경에서 시스템의 안정성과 성능 측정
 *
 * 실행: node performance/load-test-node.js
 */

const autocannon = require('autocannon');

const BASE_URL = 'http://localhost:5000';

// 테스트 엔드포인트 정의
const endpoints = [
  { name: 'Health Check', url: `${BASE_URL}/api/health`, method: 'GET' },
  { name: 'Get Characters', url: `${BASE_URL}/api/characters`, method: 'GET' },
  { name: 'Get Topics', url: `${BASE_URL}/api/topics`, method: 'GET' },
  { name: 'Search Content', url: `${BASE_URL}/api/search?q=control`, method: 'GET' },
];

async function runLoadTest() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║  🚀 성능/부하 테스트 시작                     ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  const results = {};

  for (const endpoint of endpoints) {
    console.log(`\n📊 테스트: ${endpoint.name}`);
    console.log(`   URL: ${endpoint.url}`);
    console.log(`   시간: 10초, 동시 연결: 10개`);
    console.log(`   요청 방식: Pipelined (파이프라인 요청)`);

    try {
      const result = await autocannon({
        url: endpoint.url,
        connections: 10,
        pipelining: 4,
        duration: 10,
        setupClient: (client) => {
          client.on('response', (statusCode, resBytes, responseTime) => {
            // 응답 처리
          });
        },
      });

      // 결과 저장
      results[endpoint.name] = {
        url: endpoint.url,
        requests: result.requests.total,
        throughput: result.throughput.total,
        latency: result.latency,
        statusCodeStats: result.statusCodeStats,
        errors: result.errors,
      };

      // 결과 출력
      console.log(`\n   ✅ 총 요청: ${result.requests.total}개`);
      console.log(`   ✅ 평균 응답 시간: ${result.latency.mean.toFixed(2)}ms`);
      console.log(`   ✅ P99 응답 시간: ${result.latency.p99.toFixed(2)}ms`);
      console.log(`   ✅ 처리량: ${(result.throughput.total / 1024 / 1024).toFixed(2)} MB/s`);
      console.log(`   ✅ 에러: ${result.errors}개`);

      // 성능 평가
      const avgLatency = result.latency.mean;
      if (avgLatency < 100) {
        console.log(`   🟢 성능: 매우 우수 (< 100ms)`);
      } else if (avgLatency < 200) {
        console.log(`   🟢 성능: 우수 (< 200ms)`);
      } else if (avgLatency < 500) {
        console.log(`   🟡 성능: 양호 (< 500ms)`);
      } else {
        console.log(`   🔴 성능: 개선 필요 (> 500ms)`);
      }
    } catch (error) {
      console.error(`   ❌ 에러: ${error.message}`);
      results[endpoint.name] = { error: error.message };
    }
  }

  // 최종 요약
  printSummary(results);
}

function printSummary(results) {
  console.log('\n\n╔════════════════════════════════════════════════╗');
  console.log('║  📈 성능 테스트 결과 요약                     ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  console.log('📊 엔드포인트별 성능:\n');

  for (const [name, result] of Object.entries(results)) {
    if (result.error) {
      console.log(`❌ ${name}`);
      console.log(`   에러: ${result.error}\n`);
      continue;
    }

    const status = result.latency.mean < 200 ? '✅' : result.latency.mean < 500 ? '⚠️' : '❌';

    console.log(`${status} ${name}`);
    console.log(`   평균 응답: ${result.latency.mean.toFixed(2)}ms`);
    console.log(`   P95 응답: ${(result.latency.p95 || result.latency.mean * 2).toFixed(2)}ms`);
    console.log(`   P99 응답: ${(result.latency.p99 || result.latency.mean * 3).toFixed(2)}ms`);
    console.log(`   총 요청: ${result.requests}개`);
    console.log(`   에러율: ${result.errors > 0 ? '❌ ' + result.errors + '개' : '✅ 0개'}\n`);
  }

  // 성능 목표 달성도
  console.log('🎯 성능 목표 달성도:\n');

  let passCount = 0;
  let totalCount = 0;

  for (const [name, result] of Object.entries(results)) {
    if (result.error) continue;

    totalCount++;
    const passed =
      result.latency.mean < 200 && result.latency.p99 < 500 && result.errors === 0;

    if (passed) {
      console.log(`✅ ${name}: 목표 달성`);
      passCount++;
    } else {
      console.log(`❌ ${name}: 목표 미달성`);
      if (result.latency.mean >= 200) console.log(`   - 평균 응답 시간 초과`);
      if (result.latency.p99 >= 500) console.log(`   - P99 응답 시간 초과`);
      if (result.errors > 0) console.log(`   - 에러 발생`);
    }
  }

  console.log(`\n📊 전체 달성도: ${passCount}/${totalCount} (${((passCount / totalCount) * 100).toFixed(1)}%)\n`);

  // 종합 평가
  const achievementRate = (passCount / totalCount) * 100;
  if (achievementRate === 100) {
    console.log('🏆 최종 평가: 모든 성능 목표 달성 ✅');
  } else if (achievementRate >= 80) {
    console.log('🥈 최종 평가: 대부분의 성능 목표 달성 ⚠️');
  } else {
    console.log('🥉 최종 평가: 성능 개선 필요 ❌');
  }

  console.log('\n');
}

// 실행
runLoadTest().catch(console.error);
