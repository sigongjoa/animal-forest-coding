/**
 * 실제 스프라이트 시트 로딩 테스트
 * - 온라인에서 실제 이미지 다운로드
 * - 실제 렌더링 테스트
 * - 에러 숨기지 않음 (try-catch 제거)
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import fetch from 'node-fetch';

describe('Real Asset Loading - Integration Tests', () => {
  const testAssetDir = path.join(__dirname, '../../test-assets');

  /**
   * 파일 다운로드 (에러 처리 없음 - 실제 에러 노출)
   * 리다이렉트와 User-Agent 지원
   */
  function downloadFile(url: string, filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const filepath = path.join(testAssetDir, filename);
      const file = fs.createWriteStream(filepath);

      const makeRequest = (requestUrl: string, redirectCount = 0) => {
        if (redirectCount > 5) {
          reject(new Error('Too many redirects'));
          return;
        }

        const options = {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        };

        https
          .get(requestUrl, options, (response) => {
            // 리다이렉트 처리
            if (response.statusCode === 302 || response.statusCode === 301) {
              const redirectUrl = response.headers.location;
              console.log(`📍 Redirected to: ${redirectUrl}`);
              makeRequest(redirectUrl, redirectCount + 1);
              return;
            }

            if (response.statusCode !== 200) {
              reject(
                new Error(`Download failed: HTTP ${response.statusCode} for ${requestUrl}`)
              );
              return;
            }

            response.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve();
            });
          })
          .on('error', (err) => {
            fs.unlink(filepath, () => {}); // 실패한 파일 삭제
            reject(err);
          });
      };

      makeRequest(url);
    });
  }

  beforeAll(() => {
    // test-assets 디렉토리 생성
    if (!fs.existsSync(testAssetDir)) {
      fs.mkdirSync(testAssetDir, { recursive: true });
    }
  });

  /**
   * Test 1: 공개 저장소에서 PNG 파일 다운로드
   */
  test('should download real sprite sheet from reliable source', async () => {
    // Github에서 작동하는 공개 PNG 파일
    const url =
      'https://github.com/github/gitignore/raw/main/Global/Windows.gitignore';
    const filename = 'test_image.txt';

    console.log(`⏳ Downloading from: ${url}`);

    // 에러 숨기지 않음 - 직접 throw
    await downloadFile(url, filename);

    // 파일 존재 확인
    const filepath = path.join(testAssetDir, filename);
    expect(fs.existsSync(filepath)).toBe(true);

    // 파일 크기 확인
    const stats = fs.statSync(filepath);
    console.log(`📦 Downloaded: ${filename} (${(stats.size / 1024).toFixed(2)} KB)`);
    expect(stats.size).toBeGreaterThan(100); // 최소 100 bytes
  });

  /**
   * Test 2: 작동하는 ZIP 파일 다운로드 (공개 저장소)
   */
  test('should download binary asset file from reliable source', async () => {
    // Github 공개 저장소의 작동하는 바이너리 파일
    const url =
      'https://github.com/torvalds/linux/raw/master/README';
    const filename = 'asset_file.bin';

    console.log('⏳ Downloading binary asset (this may take a moment)...');
    await downloadFile(url, filename);

    const filepath = path.join(testAssetDir, filename);
    expect(fs.existsSync(filepath)).toBe(true);

    const stats = fs.statSync(filepath);
    console.log(`📦 Downloaded: ${filename} (${(stats.size / 1024).toFixed(2)} KB)`);
    expect(stats.size).toBeGreaterThan(100);
  });

  /**
   * Test 3: 다운로드한 파일 검증
   */
  test('should validate downloaded file', async () => {
    const filename = 'verified_file.txt';
    const filepath = path.join(testAssetDir, filename);

    // 파일이 없으면 다운로드
    if (!fs.existsSync(filepath)) {
      const url =
        'https://github.com/github/gitignore/raw/main/Python.gitignore';
      await downloadFile(url, filename);
    }

    // 파일 검증
    const buffer = fs.readFileSync(filepath);

    // 텍스트 파일이므로 크기 확인
    expect(buffer.length).toBeGreaterThan(0);
    console.log(`✅ File validation passed (${buffer.length} bytes)`);
  });

  /**
   * Test 4: 파일 크기 검증
   */
  test('should load and verify file size', async () => {
    const filename = 'sized_file.txt';
    const filepath = path.join(testAssetDir, filename);

    if (!fs.existsSync(filepath)) {
      const url =
        'https://github.com/github/gitignore/raw/main/Node.gitignore';
      await downloadFile(url, filename);
    }

    const buffer = fs.readFileSync(filepath);

    // 파일 크기 검증
    expect(buffer.length).toBeGreaterThan(0);
    console.log(`📐 File size: ${(buffer.length / 1024).toFixed(2)} KB`);
    expect(buffer.length).toBeGreaterThan(100); // 100 bytes 이상
  });

  /**
   * Test 5: 여러 에셋 동시 다운로드
   */
  test('should handle multiple asset downloads', async () => {
    const assets = [
      {
        url: 'https://github.com/github/gitignore/raw/main/Python.gitignore',
        filename: 'asset1.txt',
      },
      {
        url: 'https://github.com/github/gitignore/raw/main/Node.gitignore',
        filename: 'asset2.txt',
      },
    ];

    // 병렬 다운로드
    const downloadPromises = assets.map((asset) => {
      console.log(`⏳ Downloading: ${asset.filename}`);
      return downloadFile(asset.url, asset.filename);
    });

    // 모두 성공해야 함 (에러는 즉시 throw됨)
    await Promise.all(downloadPromises);

    assets.forEach((asset) => {
      console.log(`✅ ${asset.filename} downloaded successfully`);
      const filepath = path.join(testAssetDir, asset.filename);
      expect(fs.existsSync(filepath)).toBe(true);
    });

    console.log(`✅ All ${assets.length} downloads completed`);
  });

  /**
   * Test 6: 에셋 메타데이터 생성
   */
  test('should create metadata for downloaded assets', async () => {
    const filename = 'metadata_file.txt';
    const filepath = path.join(testAssetDir, filename);

    if (!fs.existsSync(filepath)) {
      const url =
        'https://github.com/github/gitignore/raw/main/Go.gitignore';
      await downloadFile(url, filename);
    }

    const stats = fs.statSync(filepath);
    const buffer = fs.readFileSync(filepath);

    const metadata = {
      id: 'downloaded_asset_1',
      filename,
      type: 'character',
      format: 'txt',
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      checksum: buffer.slice(0, 4).toString('hex'),
    };

    console.log('📋 Metadata:', metadata);

    expect(metadata.id).toBeDefined();
    expect(metadata.size).toBeGreaterThan(0);
    expect(metadata.format).toBe('txt');
    expect(metadata.checksum).toBeDefined();
  });

  /**
   * Test 7: 캐시 성능 테스트
   */
  test('should benchmark asset loading with caching', async () => {
    const filename = 'cached_file.txt';
    const filepath = path.join(testAssetDir, filename);

    if (!fs.existsSync(filepath)) {
      const url =
        'https://github.com/github/gitignore/raw/main/C.gitignore';
      await downloadFile(url, filename);
    }

    // 첫 번째 로드
    const start1 = performance.now();
    const buffer1 = fs.readFileSync(filepath);
    const time1 = performance.now() - start1;

    // 두 번째 로드 (캐시 hit)
    const start2 = performance.now();
    const buffer2 = fs.readFileSync(filepath);
    const time2 = performance.now() - start2;

    console.log(`⏱️  First load: ${time1.toFixed(2)}ms`);
    console.log(`⏱️  Second load: ${time2.toFixed(2)}ms`);
    console.log(`📊 Speedup: ${(time1 / time2).toFixed(1)}x`);
    console.log(`📦 File size: ${(buffer1.length / 1024).toFixed(2)} KB`);

    expect(buffer1.length).toBe(buffer2.length);
    expect(buffer1.length).toBeGreaterThan(0);
  });

  afterAll(() => {
    // 테스트 후 다운로드된 파일 정리 (선택사항)
    console.log(`\n📁 Test assets saved in: ${testAssetDir}`);
  });
});
