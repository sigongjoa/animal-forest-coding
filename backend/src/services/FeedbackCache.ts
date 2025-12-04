/**
 * FeedbackCache - Feedback Caching & Performance Optimization
 *
 * 책임:
 * - 피드백 캐싱 (LRU 정책)
 * - 캐시 통계 수집
 * - 성능 모니터링
 *
 * Phase 3.1 구현
 */

import { AiFeedback } from './NookAIService';

export interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  totalSize: number;
  averageResponseTime: number;
  cachedFeedbacks: number;
}

export interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: Date;
  accessCount: number;
  lastAccessed: Date;
}

/**
 * FeedbackCache: LRU 캐싱 시스템
 */
export class FeedbackCache {
  private cache: Map<string, CacheEntry<AiFeedback>> = new Map();
  private maxSize: number;
  private stats: {
    hits: number;
    misses: number;
    totalRequests: number;
    responseTimes: number[];
  };

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      responseTimes: [],
    };
  }

  /**
   * 캐시 키 생성
   */
  private _generateKey(studentId: string, missionId: string, codeHash: string): string {
    return `${studentId}:${missionId}:${codeHash}`;
  }

  /**
   * 코드의 간단한 해시 생성
   */
  private _hashCode(code: string): string {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 캐시에 피드백 저장
   */
  set(feedback: AiFeedback): void {
    const codeHash = this._hashCode(feedback.code);
    const key = this._generateKey(feedback.studentId, feedback.missionId, codeHash);

    // 이미 존재하면 제거 (LRU 업데이트)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // 캐시 크기 확인
    if (this.cache.size >= this.maxSize) {
      this._evictLRU();
    }

    // 새 항목 추가
    const entry: CacheEntry<AiFeedback> = {
      key,
      value: feedback,
      timestamp: new Date(),
      accessCount: 0,
      lastAccessed: new Date(),
    };

    this.cache.set(key, entry);
  }

  /**
   * 캐시에서 피드백 조회
   */
  get(studentId: string, missionId: string, code: string): AiFeedback | null {
    const codeHash = this._hashCode(code);
    const key = this._generateKey(studentId, missionId, codeHash);

    this.stats.totalRequests++;

    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // LRU 업데이트
    entry.accessCount++;
    entry.lastAccessed = new Date();

    this.stats.hits++;
    return entry.value;
  }

  /**
   * 가장 오래 사용되지 않은 항목 제거 (LRU)
   */
  private _evictLRU(): void {
    let oldestEntry: CacheEntry<AiFeedback> | null = null;
    let oldestTime = Infinity;

    for (const entry of this.cache.values()) {
      const time = entry.lastAccessed.getTime();
      if (time < oldestTime) {
        oldestTime = time;
        oldestEntry = entry;
      }
    }

    if (oldestEntry) {
      this.cache.delete(oldestEntry.key);
    }
  }

  /**
   * 응답 시간 기록
   */
  recordResponseTime(timeMs: number): void {
    this.stats.responseTimes.push(timeMs);

    // 최근 1000개만 유지
    if (this.stats.responseTimes.length > 1000) {
      this.stats.responseTimes.shift();
    }
  }

  /**
   * 캐시 통계 조회
   */
  getStats(): CacheStats {
    const avgResponseTime =
      this.stats.responseTimes.length > 0
        ? this.stats.responseTimes.reduce((a, b) => a + b, 0) / this.stats.responseTimes.length
        : 0;

    const hitRate =
      this.stats.totalRequests > 0
        ? this.stats.hits / this.stats.totalRequests
        : 0;

    // 캐시 크기 계산 (대략적)
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += JSON.stringify(entry.value).length;
    }

    return {
      totalRequests: this.stats.totalRequests,
      cacheHits: this.stats.hits,
      cacheMisses: this.stats.misses,
      hitRate,
      totalSize,
      averageResponseTime: avgResponseTime,
      cachedFeedbacks: this.cache.size,
    };
  }

  /**
   * 캐시 비우기
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 특정 학생의 캐시 삭제
   */
  clearByStudent(studentId: string): void {
    const keysToDelete: string[] = [];

    for (const entry of this.cache.values()) {
      if (entry.key.startsWith(`${studentId}:`)) {
        keysToDelete.push(entry.key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * 특정 미션의 캐시 삭제
   */
  clearByMission(missionId: string): void {
    const keysToDelete: string[] = [];

    for (const entry of this.cache.values()) {
      const parts = entry.key.split(':');
      if (parts[1] === missionId) {
        keysToDelete.push(entry.key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * 캐시 크기 설정
   */
  setMaxSize(size: number): void {
    this.maxSize = size;

    // 새 크기가 현재 캐시보다 작으면 항목 제거
    while (this.cache.size > this.maxSize) {
      this._evictLRU();
    }
  }

  /**
   * 캐시 항목 목록
   */
  getAllKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 캐시 크기 조회
   */
  getSize(): number {
    return this.cache.size;
  }

  /**
   * 통계 리셋
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      responseTimes: [],
    };
  }

  /**
   * 오래된 항목 정리 (1시간 이상 미사용)
   */
  cleanup(): void {
    const now = new Date();
    const keysToDelete: string[] = [];

    for (const entry of this.cache.values()) {
      const ageInMinutes = (now.getTime() - entry.lastAccessed.getTime()) / 60000;
      if (ageInMinutes > 60) {
        keysToDelete.push(entry.key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * 캐시 효율성 리포트
   */
  getEfficiencyReport(): {
    hitRate: number;
    averageAccessCount: number;
    cachedItemCount: number;
    memorySavings: string;
  } {
    const stats = this.getStats();
    let totalAccess = 0;

    for (const entry of this.cache.values()) {
      totalAccess += entry.accessCount;
    }

    const avgAccessCount = this.cache.size > 0 ? totalAccess / this.cache.size : 0;

    // 캐시로 인한 메모리 절감 추정
    // 평균 API 응답 시간 50ms, 캐시 응답 시간 1ms 기준
    const timeSaved = (stats.cacheHits * 49) / 1000; // 초 단위

    return {
      hitRate: stats.hitRate * 100, // 퍼센트
      averageAccessCount: avgAccessCount,
      cachedItemCount: this.cache.size,
      memorySavings: `~${timeSaved.toFixed(1)}초 절감`,
    };
  }
}

// 싱글톤 인스턴스
let feedbackCacheInstance: FeedbackCache | null = null;

/**
 * FeedbackCache 싱글톤 인스턴스 획득
 */
export function getFeedbackCache(): FeedbackCache {
  if (!feedbackCacheInstance) {
    feedbackCacheInstance = new FeedbackCache(1000);
  }
  return feedbackCacheInstance;
}
