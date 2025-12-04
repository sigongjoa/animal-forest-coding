/**
 * SceneComposer - Scene Composition & Z-Index Management
 *
 * 책임:
 * - Scene 구성 (배경 + 캐릭터 + UI)
 * - Z-index 레이어링
 * - Canvas 준비
 * - 렌더링 최적화
 *
 * Phase 3.1 구현
 */

import { AssetManager, AssetMetadata } from './AssetManager';

export interface SceneLayer {
  id: string;
  assetId: string;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  visible: boolean;
  animation?: SceneAnimation;
}

export interface SceneAnimation {
  type: 'fade' | 'slide' | 'bounce' | 'shake';
  duration: number; // ms
  delay?: number;
  loop?: boolean;
}

export interface Scene {
  id: string;
  name: string;
  width: number;
  height: number;
  layers: SceneLayer[];
  backgroundColor?: string;
  duration?: number; // Scene 표시 시간 (ms)
}

/**
 * SceneComposer: 씬 구성 및 렌더링 관리
 */
export class SceneComposer {
  private scenes: Map<string, Scene> = new Map();
  private currentScene: Scene | null = null;
  private layerCounter: number = 0;
  private canvas: HTMLCanvasElement | null = null;
  private canvasContext: CanvasRenderingContext2D | null = null;

  constructor(
    private assetManager: AssetManager,
    private canvasElement?: HTMLCanvasElement
  ) {
    if (canvasElement) {
      this.setCanvas(canvasElement);
    }
  }

  /**
   * Canvas 설정
   */
  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.canvasContext = canvas.getContext('2d');
  }

  /**
   * 새로운 Scene 생성
   */
  createScene(
    id: string,
    name: string,
    width: number = 1920,
    height: number = 1080
  ): Scene {
    const scene: Scene = {
      id,
      name,
      width,
      height,
      layers: [],
      backgroundColor: '#ffffff',
    };

    this.scenes.set(id, scene);
    return scene;
  }

  /**
   * Scene에 Layer 추가
   */
  addLayer(
    sceneId: string,
    assetId: string,
    options?: Partial<SceneLayer>
  ): SceneLayer {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new Error(`Scene not found: ${sceneId}`);
    }

    const metadata = this.assetManager.getMetadata(assetId);
    if (!metadata) {
      throw new Error(`Asset not found: ${assetId}`);
    }

    // 기본 Z-Index: 배경(0-10) < 캐릭터(20-50) < UI(60-100)
    let defaultZIndex = 50;
    if (metadata.type === 'background') {
      defaultZIndex = 10;
    } else if (metadata.type === 'ui') {
      defaultZIndex = 80;
    }

    const layer: SceneLayer = {
      id: `layer_${this.layerCounter++}`,
      assetId,
      zIndex: defaultZIndex,
      x: 0,
      y: 0,
      width: metadata.width || 100,
      height: metadata.height || 100,
      opacity: 1.0,
      visible: true,
      ...options,
    };

    scene.layers.push(layer);
    this._sortLayersByZIndex(scene);

    return layer;
  }

  /**
   * Layer의 Z-Index 정렬
   */
  private _sortLayersByZIndex(scene: Scene): void {
    scene.layers.sort((a, b) => a.zIndex - b.zIndex);
  }

  /**
   * Layer 제거
   */
  removeLayer(sceneId: string, layerId: string): void {
    const scene = this.scenes.get(sceneId);
    if (!scene) return;

    const index = scene.layers.findIndex((l) => l.id === layerId);
    if (index >= 0) {
      scene.layers.splice(index, 1);
    }
  }

  /**
   * Layer 업데이트
   */
  updateLayer(
    sceneId: string,
    layerId: string,
    updates: Partial<SceneLayer>
  ): void {
    const scene = this.scenes.get(sceneId);
    if (!scene) return;

    const layer = scene.layers.find((l) => l.id === layerId);
    if (!layer) return;

    Object.assign(layer, updates);

    // Z-Index 변경되면 정렬
    if ('zIndex' in updates) {
      this._sortLayersByZIndex(scene);
    }
  }

  /**
   * Layer 가시성 토글
   */
  toggleLayerVisibility(sceneId: string, layerId: string): void {
    const scene = this.scenes.get(sceneId);
    if (!scene) return;

    const layer = scene.layers.find((l) => l.id === layerId);
    if (layer) {
      layer.visible = !layer.visible;
    }
  }

  /**
   * Scene 레이아웃 검증
   */
  validateScene(sceneId: string): {
    valid: boolean;
    errors: string[];
  } {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      return {
        valid: false,
        errors: [`Scene not found: ${sceneId}`],
      };
    }

    const errors: string[] = [];

    // 배경 레이어 확인
    const backgrounds = scene.layers.filter(
      (l) => this.assetManager.getMetadata(l.assetId)?.type === 'background'
    );
    if (backgrounds.length === 0) {
      errors.push('At least one background layer is required');
    }

    // Z-Index 중복 확인
    const zIndices = new Set<number>();
    for (const layer of scene.layers) {
      if (zIndices.has(layer.zIndex)) {
        errors.push(`Duplicate Z-Index: ${layer.zIndex}`);
      }
      zIndices.add(layer.zIndex);
    }

    // 에셋 존재 확인
    for (const layer of scene.layers) {
      if (!this.assetManager.getMetadata(layer.assetId)) {
        errors.push(`Asset not found for layer: ${layer.id}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Scene 설정
   */
  setCurrentScene(sceneId: string): void {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new Error(`Scene not found: ${sceneId}`);
    }

    this.currentScene = scene;
  }

  /**
   * 현재 Scene 조회
   */
  getCurrentScene(): Scene | null {
    return this.currentScene;
  }

  /**
   * Scene 조회
   */
  getScene(sceneId: string): Scene | undefined {
    return this.scenes.get(sceneId);
  }

  /**
   * 모든 Scene 목록
   */
  getAllScenes(): Scene[] {
    return Array.from(this.scenes.values());
  }

  /**
   * Scene에서 특정 타입의 레이어만 조회
   */
  getLayersByType(sceneId: string, type: string): SceneLayer[] {
    const scene = this.scenes.get(sceneId);
    if (!scene) return [];

    return scene.layers.filter((l) => {
      const metadata = this.assetManager.getMetadata(l.assetId);
      return metadata?.type === type;
    });
  }

  /**
   * Canvas에 Scene 렌더링 (기본 구현)
   */
  render(sceneId: string): void {
    if (!this.canvas || !this.canvasContext) {
      console.warn('Canvas not initialized');
      return;
    }

    const scene = this.scenes.get(sceneId);
    if (!scene) return;

    const ctx = this.canvasContext;

    // Canvas 크기 설정
    this.canvas.width = scene.width;
    this.canvas.height = scene.height;

    // 배경색 칠하기
    ctx.fillStyle = scene.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, scene.width, scene.height);

    // 각 레이어 렌더링
    for (const layer of scene.layers) {
      if (!layer.visible) continue;

      const metadata = this.assetManager.getMetadata(layer.assetId);
      if (!metadata) continue;

      // 투명도 설정
      ctx.globalAlpha = layer.opacity;

      // 간단한 사각형으로 표현 (실제로는 이미지/데이터 렌더링)
      ctx.fillStyle = this._getColorForType(metadata.type);
      ctx.fillRect(layer.x, layer.y, layer.width, layer.height);

      // 레이어 ID 표시
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.fillText(layer.id, layer.x + 5, layer.y + 15);

      ctx.globalAlpha = 1.0;
    }
  }

  /**
   * 타입별 색상 반환 (시각적 구분용)
   */
  private _getColorForType(type: string): string {
    const colors: { [key: string]: string } = {
      background: '#e0e0e0',
      character: '#90caf9',
      ui: '#ffcc80',
      audio: '#c8e6c9',
      data: '#f8bbd0',
    };
    return colors[type] || '#cccccc';
  }

  /**
   * Scene 구성 정보 조회
   */
  getSceneInfo(sceneId: string): {
    sceneId: string;
    name: string;
    layerCount: number;
    backgroundCount: number;
    characterCount: number;
    uiCount: number;
  } | null {
    const scene = this.scenes.get(sceneId);
    if (!scene) return null;

    const backgrounds = this.getLayersByType(sceneId, 'background').length;
    const characters = this.getLayersByType(sceneId, 'character').length;
    const ui = this.getLayersByType(sceneId, 'ui').length;

    return {
      sceneId: scene.id,
      name: scene.name,
      layerCount: scene.layers.length,
      backgroundCount: backgrounds,
      characterCount: characters,
      uiCount: ui,
    };
  }

  /**
   * 모든 Scene 삭제
   */
  clearAllScenes(): void {
    this.scenes.clear();
    this.currentScene = null;
    this.layerCounter = 0;
  }

  /**
   * Scene 삭제
   */
  deleteScene(sceneId: string): void {
    this.scenes.delete(sceneId);
    if (this.currentScene?.id === sceneId) {
      this.currentScene = null;
    }
  }
}

// 싱글톤 인스턴스
let sceneComposerInstance: SceneComposer | null = null;

/**
 * SceneComposer 싱글톤 인스턴스 획득
 */
export function getSceneComposer(assetManager: AssetManager): SceneComposer {
  if (!sceneComposerInstance) {
    sceneComposerInstance = new SceneComposer(assetManager);
  }
  return sceneComposerInstance;
}
