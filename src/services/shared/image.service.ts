import { supabase } from '@/lib/supabase';
import { IMAGE_CONFIG, STORAGE_BUCKETS } from '@/lib/constants';

/**
 * 이미지 압축 (Canvas API 이용)
 */
export async function compressImage(
  file: File,
  maxWidth: number = IMAGE_CONFIG.MAX_WIDTH,
  maxHeight: number = IMAGE_CONFIG.MAX_HEIGHT,
  quality: number = IMAGE_CONFIG.COMPRESSION_QUALITY
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        // Canvas 크기 계산
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        // Canvas에 그리기
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Blob으로 변환 (WEBP 포맷)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * 파일 검증
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // 파일 크기 체크
  if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `파일 크기가 ${IMAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB를 초과합니다.`,
    };
  }

  // 파일 타입 체크
  if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: '지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP만 가능)',
    };
  }

  return { valid: true };
}

/**
 * Supabase Storage에 이미지 업로드
 */
export async function uploadImageToStorage(
  file: File | Blob,
  storagePath: string,
  onProgress?: (progress: number) => void
): Promise<{ path: string; url: string } | null> {
  try {
    // 진행률 콜백 설정
    if (onProgress) {
      onProgress(0);
    }

    // 파일명 생성 (timestamp + 난수)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}-${random}.webp`;
    const fullPath = `${storagePath}/${fileName}`;

    // 업로드
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.CONTENT)
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    if (onProgress) {
      onProgress(100);
    }

    // Public URL 가져오기
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.CONTENT)
      .getPublicUrl(fullPath);

    return {
      path: fullPath,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Upload exception:', error);
    return null;
  }
}

/**
 * 이미지 압축 + 업로드 (통합 함수)
 */
export async function compressAndUploadImage(
  file: File,
  storagePath: string,
  onProgress?: (stage: 'compressing' | 'uploading', progress: number) => void
): Promise<{ path: string; url: string; metadata: ImageMetadata } | null> {
  try {
    // 1. 파일 검증
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 2. 이미지 압축
    if (onProgress) {
      onProgress('compressing', 50);
    }

    const compressedBlob = await compressImage(file);

    if (onProgress) {
      onProgress('compressing', 100);
    }

    // 3. Storage 업로드
    if (onProgress) {
      onProgress('uploading', 0);
    }

    const uploadResult = await uploadImageToStorage(
      compressedBlob,
      storagePath,
      (progress) => {
        onProgress?.('uploading', progress);
      }
    );

    if (!uploadResult) {
      throw new Error('Upload failed');
    }

    // 4. 메타데이터 수집
    const metadata: ImageMetadata = {
      originalSize: file.size,
      compressedSize: compressedBlob.size,
      compressionRatio: Math.round(
        ((file.size - compressedBlob.size) / file.size) * 100
      ),
      mimeType: 'image/webp',
    };

    return {
      ...uploadResult,
      metadata,
    };
  } catch (error) {
    console.error('Compress and upload error:', error);
    return null;
  }
}

/**
 * Storage에서 파일 삭제
 */
export async function deleteImageFromStorage(storagePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.CONTENT)
      .remove([storagePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete exception:', error);
    return false;
  }
}

// 타입 정의
export interface ImageMetadata {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  mimeType: string;
}

export interface UploadProgress {
  stage: 'compressing' | 'uploading';
  progress: number;
}
