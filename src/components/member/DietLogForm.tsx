'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DietLog, DietGuideMeal } from '@/types';
import * as dietService from '@/services/member/diet.service';
import * as imageService from '@/services/shared/image.service';
import { STORAGE_PATHS } from '@/lib/constants';

interface DietLogFormProps {
  memberId: string;
  linkId: string;
  loggedDate: string;
  mealSlot: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';
  guideMeal?: DietGuideMeal;
  onSuccess?: (log: DietLog) => void;
  onError?: (error: string) => void;
}

export function DietLogForm({
  memberId,
  linkId,
  loggedDate,
  mealSlot,
  guideMeal,
  onSuccess,
  onError,
}: DietLogFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // 폼 상태
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState<number | undefined>();
  const [protein, setProtein] = useState<number | undefined>();
  const [carbs, setCarbs] = useState<number | undefined>();
  const [fat, setFat] = useState<number | undefined>();
  const [mood, setMood] = useState(5);
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // 이미지 선택 처리
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 파일 검증
      const validation = imageService.validateImageFile(file);
      if (!validation.valid) {
        onError?.(validation.error ?? '이미지를 확인할 수 없습니다.');
        continue;
      }

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrls((prev) => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);

      setImages((prev) => [...prev, file]);
    }
  };

  // 이미지 제거
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    try {
      // 1. 식단 로그 생성
      const log = await dietService.createDietLog(memberId, linkId, {
        logged_date: loggedDate,
        meal_slot: mealSlot,
        description,
        calories,
        protein,
        carbs,
        fat,
        mood,
        notes: notes || undefined,
      });

      if (!log) {
        onError?.('식단 기록 저장에 실패했습니다.');
        setLoading(false);
        return;
      }

      // 2. 이미지 업로드
      if (images.length > 0) {
        const storagePath = STORAGE_PATHS.DIET_PHOTOS(memberId, loggedDate);

        for (let i = 0; i < images.length; i++) {
          const file = images[i];

          try {
            // 이미지 압축 + 업로드
            const result = await imageService.compressAndUploadImage(
              file,
              storagePath,
              (_stage, progress) => {
                const totalProgress = (i / images.length) * 100 + (progress / images.length);
                setUploadProgress(Math.round(totalProgress));
              }
            );

            if (result) {
              // DB에 사진 기록 추가
              await dietService.addDietLogPhoto(log.id, result.path, result.path.split('/').pop() || '', {
                fileSize: result.metadata.compressedSize,
                mimeType: result.metadata.mimeType,
              });
            }
          } catch (error) {
            console.error(`Failed to upload image ${i + 1}:`, error);
          }
        }
      }

      setUploadProgress(null);
      onSuccess?.(log);
    } catch (error) {
      onError?.('오류가 발생했습니다.');
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  const slotLabels: Record<string, string> = {
    breakfast: '🌅 아침',
    lunch: '☀️ 점심',
    dinner: '🌙 저녁',
    snack: '🍎 간식',
    pre_workout: '💪 운동전',
    post_workout: '💪 운동후',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{slotLabels[mealSlot]}</CardTitle>
        {guideMeal && (
          <div className="text-sm text-muted-foreground mt-2 bg-blue-50 p-3 rounded">
            <p className="font-semibold mb-1">트레이너 권장사항</p>
            <p>
              칼로리: {guideMeal.calories_target}kcal | 단백질: {guideMeal.protein_target}g
            </p>
            {guideMeal.notes && <p className="mt-1 italic">{guideMeal.notes}</p>}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 식사 내용 */}
          <div>
            <label className="block text-sm font-medium mb-2">식사 내용</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 닭가슴살 200g, 현미밥 1공기, 시금치..."
              disabled={loading}
              className="w-full p-2 border rounded-md min-h-20"
              required
            />
          </div>

          {/* 영양 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">칼로리</label>
              <Input
                type="number"
                placeholder="kcal"
                value={calories || ''}
                onChange={(e) => setCalories(e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">단백질</label>
              <Input
                type="number"
                placeholder="g"
                value={protein || ''}
                onChange={(e) => setProtein(e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">탄수화물</label>
              <Input
                type="number"
                placeholder="g"
                value={carbs || ''}
                onChange={(e) => setCarbs(e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">지방</label>
              <Input
                type="number"
                placeholder="g"
                value={fat || ''}
                onChange={(e) => setFat(e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={loading}
              />
            </div>
          </div>

          {/* 만족도 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              만족도: {mood}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={mood}
              onChange={(e) => setMood(parseInt(e.target.value))}
              disabled={loading}
              className="w-full"
            />
          </div>

          {/* 사진 업로드 */}
          <div>
            <label className="block text-sm font-medium mb-2">사진 (선택)</label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              disabled={loading}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full"
            >
              사진 선택
            </Button>

            {/* 사진 미리보기 */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative">
                    <Image
                      src={url}
                      alt={`preview-${idx}`}
                      width={400}
                      height={160}
                      unoptimized
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 추가 메모 */}
          <div>
            <label className="block text-sm font-medium mb-2">메모 (선택)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="알레르기, 특이사항 등..."
              disabled={loading}
              className="w-full p-2 border rounded-md min-h-16"
            />
          </div>

          {/* 진행률 표시 */}
          {uploadProgress !== null && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* 제출 버튼 */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? `저장 중... ${uploadProgress ?? 0}%` : '식단 기록 저장'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
