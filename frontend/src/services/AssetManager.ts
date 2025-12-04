/**
 * AssetManager - Modular Asset System
 *
 * 책임:
 * - 에셋 로드 (이미지, 오디오, 데이터)
 * - 인메모리 캐싱
 * - 메타데이터 관리
 *
 * Phase 3.1 구현
 */

export interface AssetMetadata {
  id: string;
  type: 'background' | 'character' | 'ui' | 'audio' | 'data';
  width?: number;
  height?: number;
  format: string;
  size: number;
  url: string;
  description?: string;
}

export interface Asset {
  id: string;
  metadata: AssetMetadata;
  data?: any; // Image, Audio, or Data
  loadedAt: Date;
  fromCache: boolean;
}

/**
 * AssetManager: 에셋 로드 및 캐싱 관리
 */
export class AssetManager {
  private cache: Map<string, Asset> = new Map();
  private metadata: Map<string, AssetMetadata> = new Map();
  private maxCacheSize: number = 100; // 최대 100개 에셋 캐시
  private loadingPromises: Map<string, Promise<Asset>> = new Map();

  constructor(private baseUrl: string = '/assets') {
    this.initializeMetadata();
  }

  /**
   * 에셋 메타데이터 초기화
   * 실제 운영 환경에서는 API에서 가져옴
   */
  private initializeMetadata(): void {
    // Background Assets (5개)
    const backgrounds = [
      {
        id: 'bg_beach',
        type: 'background' as const,
        width: 1920,
        height: 1080,
        format: 'png',
        size: 2500000,
        description: '해변 배경',
      },
      {
        id: 'bg_forest',
        type: 'background' as const,
        width: 1920,
        height: 1080,
        format: 'png',
        size: 2400000,
        description: '숲 배경',
      },
      {
        id: 'bg_town',
        type: 'background' as const,
        width: 1920,
        height: 1080,
        format: 'png',
        size: 2350000,
        description: '마을 배경',
      },
      {
        id: 'bg_mountain',
        type: 'background' as const,
        width: 1920,
        height: 1080,
        format: 'png',
        size: 2600000,
        description: '산 배경',
      },
      {
        id: 'bg_house',
        type: 'background' as const,
        width: 1920,
        height: 1080,
        format: 'png',
        size: 2300000,
        description: '집 배경',
      },
    ];

    // Character Assets (8개)
    const characters = [
      {
        id: 'char_nook',
        type: 'character' as const,
        width: 256,
        height: 256,
        format: 'png',
        size: 150000,
        description: '너굴 캐릭터',
      },
      {
        id: 'char_tom_nook',
        type: 'character' as const,
        width: 256,
        height: 256,
        format: 'png',
        size: 160000,
        description: '너굴 아저씨',
      },
      {
        id: 'char_student_1',
        type: 'character' as const,
        width: 256,
        height: 256,
        format: 'png',
        size: 140000,
        description: '학생 1',
      },
      {
        id: 'char_student_2',
        type: 'character' as const,
        width: 256,
        height: 256,
        format: 'png',
        size: 145000,
        description: '학생 2',
      },
      {
        id: 'char_teacher',
        type: 'character' as const,
        width: 256,
        height: 256,
        format: 'png',
        size: 155000,
        description: '선생님',
      },
      {
        id: 'char_robot',
        type: 'character' as const,
        width: 256,
        height: 256,
        format: 'png',
        size: 130000,
        description: '로봇',
      },
      {
        id: 'char_animal_1',
        type: 'character' as const,
        width: 256,
        height: 256,
        format: 'png',
        size: 125000,
        description: '동물 1',
      },
      {
        id: 'char_animal_2',
        type: 'character' as const,
        width: 256,
        height: 256,
        format: 'png',
        size: 128000,
        description: '동물 2',
      },
    ];

    // UI Assets (8개)
    const ui = [
      {
        id: 'ui_button',
        type: 'ui' as const,
        width: 200,
        height: 50,
        format: 'png',
        size: 25000,
        description: '버튼',
      },
      {
        id: 'ui_text_box',
        type: 'ui' as const,
        width: 400,
        height: 100,
        format: 'png',
        size: 40000,
        description: '텍스트 박스',
      },
      {
        id: 'ui_dialog_box',
        type: 'ui' as const,
        width: 600,
        height: 200,
        format: 'png',
        size: 80000,
        description: '다이얼로그 박스',
      },
      {
        id: 'ui_badge',
        type: 'ui' as const,
        width: 100,
        height: 100,
        format: 'png',
        size: 20000,
        description: '뱃지',
      },
      {
        id: 'ui_icon_code',
        type: 'ui' as const,
        width: 64,
        height: 64,
        format: 'png',
        size: 5000,
        description: '코드 아이콘',
      },
      {
        id: 'ui_icon_check',
        type: 'ui' as const,
        width: 64,
        height: 64,
        format: 'png',
        size: 4000,
        description: '체크 아이콘',
      },
      {
        id: 'ui_icon_error',
        type: 'ui' as const,
        width: 64,
        height: 64,
        format: 'png',
        size: 4500,
        description: '에러 아이콘',
      },
      {
        id: 'ui_icon_info',
        type: 'ui' as const,
        width: 64,
        height: 64,
        format: 'png',
        size: 4200,
        description: '정보 아이콘',
      },
    ];

    // 모든 메타데이터 등록
    [...backgrounds, ...characters, ...ui].forEach((meta) => {
      this.metadata.set(meta.id, {
        ...meta,
        url: `${this.baseUrl}/${meta.type}/${meta.id}.${meta.format}`,
      } as AssetMetadata);
    });
  }

  /**
   * 에셋 로드
   * @param id 에셋 ID
   * @returns 로드된 에셋
   */
  async loadAsset(id: string): Promise<Asset> {
    // 캐시에서 먼저 확인
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }

    // 이미 로딩 중인 요청이 있으면 그 Promise 반환 (중복 요청 방지)
    if (this.loadingPromises.has(id)) {
      return this.loadingPromises.get(id)!;
    }

    // 메타데이터 확인
    const metadata = this.metadata.get(id);
    if (!metadata) {
      throw new Error(`Asset not found: ${id}`);
    }

    // 로딩 Promise 생성
    const loadPromise = this._loadAsset(id, metadata);
    this.loadingPromises.set(id, loadPromise);

    try {
      const asset = await loadPromise;
      return asset;
    } finally {
      this.loadingPromises.delete(id);
    }
  }

  /**
   * 실제 에셋 로드 로직
   */
  private async _loadAsset(id: string, metadata: AssetMetadata): Promise<Asset> {
    try {
      // 실제 환경에서는 fetch로 데이터 로드
      // 지금은 메타데이터만으로 구성
      const asset: Asset = {
        id,
        metadata,
        data: null, // 실제 구현에서는 fetch(metadata.url)로 로드
        loadedAt: new Date(),
        fromCache: false,
      };

      // 캐시 크기 확인 후 저장
      if (this.cache.size >= this.maxCacheSize) {
        this._evictOldest();
      }

      this.cache.set(id, asset);
      return asset;
    } catch (error) {
      throw new Error(`Failed to load asset ${id}: ${error}`);
    }
  }

  /**
   * 가장 오래된 에셋 제거 (LRU 정책)
   */
  private _evictOldest(): void {
    const first = this.cache.entries().next();
    if (!first.done) {
      this.cache.delete(first.value[0]);
    }
  }

  /**
   * 캐시에서 에셋 가져오기
   */
  getAssetFromCache(id: string): Asset | undefined {
    return this.cache.get(id);
  }

  /**
   * 메타데이터 가져오기
   */
  getMetadata(id: string): AssetMetadata | undefined {
    return this.metadata.get(id);
  }

  /**
   * 모든 에셋 메타데이터 나열
   */
  getAllMetadata(): AssetMetadata[] {
    return Array.from(this.metadata.values());
  }

  /**
   * 특정 타입의 에셋만 가져오기
   */
  getAssetsByType(type: AssetMetadata['type']): AssetMetadata[] {
    return Array.from(this.metadata.values()).filter((m) => m.type === type);
  }

  /**
   * 여러 에셋 사전 로드
   */
  async preloadAssets(ids: string[]): Promise<void> {
    const promises = ids.map((id) =>
      this.loadAsset(id).catch(() => {
        // 실패한 에셋은 무시하고 계속 진행
      })
    );
    await Promise.all(promises);
  }

  /**
   * 캐시 정보 조회
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    assetIds: string[];
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      assetIds: Array.from(this.cache.keys()),
    };
  }

  /**
   * 캐시 비우기
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 특정 에셋 캐시 제거
   */
  removeFromCache(id: string): void {
    this.cache.delete(id);
  }

  /**
   * 캐시 크기 조정
   */
  setMaxCacheSize(size: number): void {
    this.maxCacheSize = size;
    // 현재 캐시가 새 크기보다 크면 오래된 항목 제거
    while (this.cache.size > this.maxCacheSize) {
      this._evictOldest();
    }
  }
}

// 싱글톤 인스턴스
let assetManagerInstance: AssetManager | null = null;

/**
 * AssetManager 싱글톤 인스턴스 획득
 */
export function getAssetManager(): AssetManager {
  if (!assetManagerInstance) {
    assetManagerInstance = new AssetManager();
  }
  return assetManagerInstance;
}
