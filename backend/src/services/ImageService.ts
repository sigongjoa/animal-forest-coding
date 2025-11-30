import fs from 'fs';
import path from 'path';

export interface ImageMetadata {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  altText: string;
  url: string;
  createdAt?: string;
}

export class ImageService {
  private imagePath = path.join(__dirname, '../../data/images');

  getImage(imageId: string): Buffer {
    try {
      // 먼저 메타데이터에서 실제 파일 이름 조회
      const metadata = this.getImageMetadata(imageId);

      // 경로 traversal 공격 방지
      const safeImagePath = path.normalize(path.join(this.imagePath, metadata.filename));
      if (!safeImagePath.startsWith(this.imagePath)) {
        throw new Error('Invalid image path');
      }

      if (!fs.existsSync(safeImagePath)) {
        throw new Error(`Image file not found: ${metadata.filename}`);
      }

      return fs.readFileSync(safeImagePath);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      throw new Error(`Failed to read image: ${imageId}`);
    }
  }

  getImageMetadata(imageId: string): ImageMetadata {
    const metadataPath = path.join(this.imagePath, `${imageId}.json`);

    try {
      if (!fs.existsSync(metadataPath)) {
        throw new Error(`Image metadata not found: ${imageId}`);
      }

      const data = fs.readFileSync(metadataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      throw new Error(`Failed to read image metadata: ${imageId}`);
    }
  }

  getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  getAllImages(): ImageMetadata[] {
    const images: ImageMetadata[] = [];

    try {
      if (!fs.existsSync(this.imagePath)) {
        return images;
      }

      const files = fs.readdirSync(this.imagePath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const data = fs.readFileSync(path.join(this.imagePath, file), 'utf-8');
            images.push(JSON.parse(data));
          } catch (error) {
            console.error(`Error parsing image metadata: ${file}`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error reading images directory:', error);
    }

    return images;
  }
}
