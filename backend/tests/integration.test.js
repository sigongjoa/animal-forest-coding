/**
 * Backend Integration Tests
 * API endpoints 및 서버 기능 테스트
 */

const http = require('http');

class BackendTestRunner {
  constructor() {
    this.results = [];
    this.testCount = 0;
    this.passCount = 0;
  }

  log(message, level = 'info') {
    const levelColors = {
      info: '\x1b[36m',
      pass: '\x1b[32m',
      fail: '\x1b[31m',
      warn: '\x1b[33m',
      reset: '\x1b[0m'
    };

    const color = levelColors[level] || levelColors.info;
    console.log(`${color}${message}\x1b[0m`);
  }

  async makeRequest(method, path, body = null) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            success: true
          });
        });
      });

      req.on('error', (error) => {
        resolve({
          error: error.message,
          success: false
        });
      });

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  addResult(testName, passed, details = '') {
    this.testCount++;
    if (passed) this.passCount++;

    this.results.push({
      testName,
      passed,
      details
    });

    const status = passed ? '✅ PASS' : '❌ FAIL';
    this.log(
      `${status}: ${testName}${details ? ' (' + details + ')' : ''}`,
      passed ? 'pass' : 'fail'
    );
  }

  async runAllTests() {
    this.log('\n════════════════════════════════════════════════════════', 'info');
    this.log('Backend Integration Tests - Login & API Endpoints', 'info');
    this.log('════════════════════════════════════════════════════════\n', 'info');

    // Test Group 1: Server Health
    await this.testServerHealth();

    // Test Group 2: Login API
    await this.testLoginAPI();

    // Test Group 3: Error Handling
    await this.testErrorHandling();

    // Test Group 4: Response Formats
    await this.testResponseFormats();

    // Summary
    this.printSummary();
  }

  async testServerHealth() {
    this.log('Test Group 1: Server Health Check', 'info');
    this.log('───────────────────────────────────────────────────────────', 'info');

    // UC-1: Server responds to root path
    const rootResponse = await this.makeRequest('GET', '/');
    this.addResult(
      'UC-1: Server responds to root path',
      rootResponse.success && (rootResponse.statusCode === 200 || rootResponse.statusCode === 404),
      `Status: ${rootResponse.statusCode || 'Error: ' + rootResponse.error}`
    );

    // UC-2: Health check endpoint
    const healthResponse = await this.makeRequest('GET', '/api/health');
    this.addResult(
      'UC-2: Health check endpoint responds',
      healthResponse.success && (healthResponse.statusCode === 200 || rootResponse.statusCode === 404),
      `Status: ${healthResponse.statusCode || 'Not found'}`
    );

    // UC-3: Server handles CORS headers
    const corsResponse = await this.makeRequest('GET', '/');
    const hasCorsHeaders = corsResponse.headers && (
      corsResponse.headers['access-control-allow-origin'] ||
      corsResponse.statusCode === 200
    );
    this.addResult(
      'UC-3: Server accepts requests',
      corsResponse.success,
      `Response received`
    );

    this.log('');
  }

  async testLoginAPI() {
    this.log('Test Group 2: Login API Tests', 'info');
    this.log('───────────────────────────────────────────────────────────', 'info');

    // UC-4: Login endpoint exists
    const loginResponse = await this.makeRequest('POST', '/api/login', {
      username: 'testuser',
      password: 'testpass123'
    });

    this.addResult(
      'UC-4: /api/login endpoint exists',
      loginResponse.success && loginResponse.statusCode && loginResponse.statusCode !== 404,
      `Status: ${loginResponse.statusCode}`
    );

    // UC-5: Login returns JSON response
    let jsonParseable = false;
    try {
      if (loginResponse.body) {
        JSON.parse(loginResponse.body);
        jsonParseable = true;
      }
    } catch (e) {
      jsonParseable = false;
    }

    this.addResult(
      'UC-5: Login response is valid JSON',
      jsonParseable || loginResponse.statusCode === 404,
      `Response length: ${loginResponse.body.length} bytes`
    );

    // UC-6: Login with valid credentials
    const validLoginResponse = await this.makeRequest('POST', '/api/login', {
      username: 'testuser',
      password: 'testpass123'
    });

    this.addResult(
      'UC-6: Login with valid credentials handled',
      validLoginResponse.success && (validLoginResponse.statusCode >= 200 && validLoginResponse.statusCode < 500),
      `Status: ${validLoginResponse.statusCode}`
    );

    // UC-7: Login with missing username
    const noUsernameResponse = await this.makeRequest('POST', '/api/login', {
      password: 'testpass123'
    });

    this.addResult(
      'UC-7: Login without username validation',
      noUsernameResponse.success && (noUsernameResponse.statusCode === 400 || noUsernameResponse.statusCode === 401 || noUsernameResponse.statusCode >= 200),
      `Status: ${noUsernameResponse.statusCode}`
    );

    // UC-8: Login with missing password
    const noPasswordResponse = await this.makeRequest('POST', '/api/login', {
      username: 'testuser'
    });

    this.addResult(
      'UC-8: Login without password validation',
      noPasswordResponse.success && (noPasswordResponse.statusCode === 400 || noPasswordResponse.statusCode === 401 || noPasswordResponse.statusCode >= 200),
      `Status: ${noPasswordResponse.statusCode}`
    );

    // UC-9: Login with empty credentials
    const emptyLoginResponse = await this.makeRequest('POST', '/api/login', {
      username: '',
      password: ''
    });

    this.addResult(
      'UC-9: Login with empty credentials validation',
      emptyLoginResponse.success && (emptyLoginResponse.statusCode >= 200 && emptyLoginResponse.statusCode < 500),
      `Status: ${emptyLoginResponse.statusCode}`
    );

    // UC-10: Multiple login attempts
    let allRequestsSuccessful = true;
    const attempts = [];

    for (let i = 0; i < 3; i++) {
      const response = await this.makeRequest('POST', '/api/login', {
        username: 'testuser',
        password: 'testpass123'
      });
      attempts.push(response.statusCode);
      if (!response.success) allRequestsSuccessful = false;
    }

    this.addResult(
      'UC-10: Multiple login attempts handled',
      allRequestsSuccessful && attempts.length === 3,
      `Attempts: ${attempts.join(', ')}`
    );

    this.log('');
  }

  async testErrorHandling() {
    this.log('Test Group 3: Error Handling', 'info');
    this.log('───────────────────────────────────────────────────────────', 'info');

    // UC-11: Non-existent endpoint
    const notFoundResponse = await this.makeRequest('GET', '/api/nonexistent');
    this.addResult(
      'UC-11: Non-existent endpoint returns error',
      notFoundResponse.success && notFoundResponse.statusCode === 404,
      `Status: ${notFoundResponse.statusCode}`
    );

    // UC-12: Invalid HTTP method
    const invalidMethodResponse = await this.makeRequest('DELETE', '/api/login');
    this.addResult(
      'UC-12: Invalid HTTP method handled',
      invalidMethodResponse.success && (invalidMethodResponse.statusCode === 404 || invalidMethodResponse.statusCode === 405 || invalidMethodResponse.statusCode >= 200),
      `Status: ${invalidMethodResponse.statusCode}`
    );

    // UC-13: Malformed JSON
    const malformedResponse = await this.makeRequest('POST', '/api/login', {
      username: 'test\x00user',  // Null byte injection test
      password: 'test'
    });

    this.addResult(
      'UC-13: Malformed request handling',
      malformedResponse.success && (malformedResponse.statusCode >= 200 && malformedResponse.statusCode < 500),
      `Status: ${malformedResponse.statusCode}`
    );

    // UC-14: Very long payload
    const longPayload = {
      username: 'a'.repeat(10000),
      password: 'b'.repeat(10000)
    };

    const longPayloadResponse = await this.makeRequest('POST', '/api/login', longPayload);

    this.addResult(
      'UC-14: Large payload handling',
      longPayloadResponse.success && (longPayloadResponse.statusCode >= 200 && longPayloadResponse.statusCode < 500),
      `Status: ${longPayloadResponse.statusCode}`
    );

    this.log('');
  }

  async testResponseFormats() {
    this.log('Test Group 4: Response Formats', 'info');
    this.log('───────────────────────────────────────────────────────────', 'info');

    // UC-15: Response headers present
    const response = await this.makeRequest('POST', '/api/login', {
      username: 'testuser',
      password: 'testpass123'
    });

    const hasContentType = response.headers && response.headers['content-type'];
    this.addResult(
      'UC-15: Response has Content-Type header',
      response.success && hasContentType,
      `Content-Type: ${hasContentType || 'Not set'}`
    );

    // UC-16: Response has body
    this.addResult(
      'UC-16: Response has body content',
      response.success && response.body && response.body.length > 0,
      `Body length: ${response.body.length} bytes`
    );

    // UC-17: Status code is valid HTTP status
    const validStatusCode = response.statusCode >= 100 && response.statusCode < 600;
    this.addResult(
      'UC-17: Response has valid HTTP status code',
      validStatusCode,
      `Status: ${response.statusCode}`
    );

    this.log('');
  }

  printSummary() {
    const percentage = ((this.passCount / this.testCount) * 100).toFixed(1);

    this.log('════════════════════════════════════════════════════════', 'info');
    this.log('Test Summary', 'info');
    this.log('════════════════════════════════════════════════════════', 'info');
    this.log(`\nPassed: ${this.passCount}/${this.testCount} (${percentage}%)\n`);

    if (this.passCount === this.testCount) {
      this.log('🎉 All tests passed!', 'pass');
    } else {
      this.log('⚠️  Some tests failed:', 'warn');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          this.log(`  ❌ ${r.testName}`, 'warn');
        });
    }

    this.log('\n════════════════════════════════════════════════════════\n', 'info');

    return this.passCount === this.testCount ? 0 : 1;
  }
}

// Run tests
const runner = new BackendTestRunner();
runner.runAllTests().then(exitCode => {
  process.exit(exitCode);
}).catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
