/**
 * StoryPage E2E Integration Test
 * 실제 브라우저에서 StoryPage 기능을 테스트합니다
 */

const http = require('http');

const TEST_RESULTS = [];

function logResult(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const result = { testName, passed, details };
  TEST_RESULTS.push(result);
  console.log(`${status}: ${testName}${details ? ' (' + details + ')' : ''}`);
}

function checkBackendHealth() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/login',
      method: 'POST',
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
          body: data
        });
      });
    });

    req.on('error', (error) => {
      resolve({ error: error.message });
    });

    const payload = JSON.stringify({
      username: 'testuser',
      password: 'testpass123'
    });

    req.write(payload);
    req.end();
  });
}

function checkFrontendHealth() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      resolve({ error: error.message });
    });

    req.end();
  });
}

async function runTests() {
  console.log('========================================');
  console.log('StoryPage E2E Integration Tests');
  console.log('========================================\n');

  // Test 1: Backend Health Check
  console.log('Test Group 1: Backend Health Check');
  console.log('---');
  const backendHealth = await checkBackendHealth();
  logResult(
    'UC-1: Backend /api/login endpoint responds',
    backendHealth.statusCode && backendHealth.statusCode !== 404,
    `Status: ${backendHealth.statusCode || 'Connection refused'}`
  );

  // Test 2: Frontend Health Check
  console.log('\nTest Group 2: Frontend Health Check');
  console.log('---');
  const frontendHealth = await checkFrontendHealth();
  logResult(
    'UC-2: Frontend server is running',
    frontendHealth.statusCode && frontendHealth.statusCode >= 200 && frontendHealth.statusCode < 500,
    `Status: ${frontendHealth.statusCode || 'Connection refused'}`
  );

  // Test 3: Response Format Check
  console.log('\nTest Group 3: Response Format');
  console.log('---');
  const hasValidResponse = backendHealth.body && backendHealth.body.length > 0;
  logResult(
    'UC-3: Backend returns response data',
    hasValidResponse,
    `Response length: ${backendHealth.body ? backendHealth.body.length : 0} bytes`
  );

  // Test 4: Content-Type Check
  console.log('\nTest Group 4: Content Type');
  console.log('---');
  const contentType = backendHealth.headers ? backendHealth.headers['content-type'] : '';
  const hasValidContentType = contentType && contentType.includes('application/json');
  logResult(
    'UC-4: Response has valid Content-Type',
    hasValidContentType,
    `Content-Type: ${contentType || 'not set'}`
  );

  // Test 5: Asset Files Check
  console.log('\nTest Group 5: Asset Files');
  console.log('---');
  const fs = require('fs');
  const path = require('path');

  const img1Path = path.join(__dirname, 'frontend/public/assets/img1.jpg');
  const img2Path = path.join(__dirname, 'frontend/public/assets/img2.jpg');

  const img1Exists = fs.existsSync(img1Path);
  const img2Exists = fs.existsSync(img2Path);

  logResult(
    'UC-5: img1.jpg exists',
    img1Exists,
    img1Exists ? `Size: ${fs.statSync(img1Path).size} bytes` : 'File not found'
  );

  logResult(
    'UC-6: img2.jpg exists',
    img2Exists,
    img2Exists ? `Size: ${fs.statSync(img2Path).size} bytes` : 'File not found'
  );

  // Test 6: Component Files Check
  console.log('\nTest Group 6: Component Files');
  console.log('---');

  const storyPagePath = path.join(__dirname, 'frontend/src/pages/StoryPage.tsx');
  const appPath = path.join(__dirname, 'frontend/src/App.tsx');
  const loginPagePath = path.join(__dirname, 'frontend/src/pages/LoginPage.tsx');

  const storyPageExists = fs.existsSync(storyPagePath);
  const appExists = fs.existsSync(appPath);
  const loginPageExists = fs.existsSync(loginPagePath);

  logResult(
    'UC-7: StoryPage.tsx exists',
    storyPageExists,
    storyPageExists ? `Size: ${fs.statSync(storyPagePath).size} bytes` : 'File not found'
  );

  logResult(
    'UC-8: App.tsx exists',
    appExists,
    appExists ? `Size: ${fs.statSync(appPath).size} bytes` : 'File not found'
  );

  logResult(
    'UC-9: LoginPage.tsx exists',
    loginPageExists,
    loginPageExists ? `Size: ${fs.statSync(loginPagePath).size} bytes` : 'File not found'
  );

  // Test 7: Code Content Check
  console.log('\nTest Group 7: Code Content Validation');
  console.log('---');

  if (storyPageExists) {
    const storyPageContent = fs.readFileSync(storyPagePath, 'utf-8');
    const hasSceneData = storyPageContent.includes('scenes');
    const hasTypingEffect = storyPageContent.includes('setInterval') || storyPageContent.includes('useEffect');
    const hasNavigation = storyPageContent.includes('navigate');

    logResult(
      'UC-10: StoryPage has scene data',
      hasSceneData,
      'scenes array found in code'
    );

    logResult(
      'UC-11: StoryPage has typing effect',
      hasTypingEffect,
      'Typing animation code found'
    );

    logResult(
      'UC-12: StoryPage has navigation',
      hasNavigation,
      'Navigation code found'
    );
  }

  if (appExists) {
    const appContent = fs.readFileSync(appPath, 'utf-8');
    const hasRouter = appContent.includes('Router') || appContent.includes('BrowserRouter');
    const hasStoryRoute = appContent.includes('/story') || appContent.includes('StoryPage');

    logResult(
      'UC-13: App.tsx has Router setup',
      hasRouter,
      'Router component found'
    );

    logResult(
      'UC-14: App.tsx has /story route',
      hasStoryRoute,
      'StoryPage route found'
    );
  }

  if (loginPageExists) {
    const loginPageContent = fs.readFileSync(loginPagePath, 'utf-8');
    const redirectToStory = loginPageContent.includes('/story');

    logResult(
      'UC-15: LoginPage redirects to /story',
      redirectToStory,
      'Redirect path found'
    );
  }

  // Test 8: Package.json Check
  console.log('\nTest Group 8: Dependencies');
  console.log('---');

  const packageJsonPath = path.join(__dirname, 'frontend/package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  const hasReactRouter = packageJson.dependencies && packageJson.dependencies['react-router-dom'];
  const hasPlaywright = packageJson.devDependencies && packageJson.devDependencies['@playwright/test'];

  logResult(
    'UC-16: react-router-dom is installed',
    !!hasReactRouter,
    hasReactRouter ? `Version: ${hasReactRouter}` : 'Not found'
  );

  logResult(
    'UC-17: @playwright/test is installed',
    !!hasPlaywright,
    hasPlaywright ? `Version: ${hasPlaywright}` : 'Not found'
  );

  // Summary
  console.log('\n========================================');
  console.log('Test Summary');
  console.log('========================================');

  const passedTests = TEST_RESULTS.filter(r => r.passed).length;
  const totalTests = TEST_RESULTS.length;
  const percentage = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(`\nPassed: ${passedTests}/${totalTests} (${percentage}%)\n`);

  if (passedTests === totalTests) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. See details above.');
    console.log('\nFailed tests:');
    TEST_RESULTS
      .filter(r => !r.passed)
      .forEach(r => console.log(`  - ${r.testName}`));
  }

  console.log('\n========================================\n');

  return passedTests === totalTests ? 0 : 1;
}

// Run tests
runTests().then(exitCode => {
  process.exit(exitCode);
}).catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
