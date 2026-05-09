'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkoutLog, WorkoutExercise } from '@/types';
import * as workoutService from '@/services/member/workout.service';

interface WorkoutFormProps {
  exercise: WorkoutExercise;
  memberId: string;
  loggedDate: string;
  onSuccess?: (log: WorkoutLog) => void;
  onError?: (error: string) => void;
}

export function WorkoutForm({
  exercise,
  memberId,
  loggedDate,
  onSuccess,
  onError,
}: WorkoutFormProps) {
  const [previousLog, setPreviousLog] = useState<WorkoutLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPrevious, setLoadingPrevious] = useState(true);

  // 폼 상태
  const [setsCompleted, setSetsCompleted] = useState(exercise.sets_planned);
  const [repsPerSet, setRepsPerSet] = useState<number[]>(
    Array(exercise.sets_planned).fill(exercise.reps_planned)
  );
  const [weightPerSet, setWeightPerSet] = useState<number[]>(
    Array(exercise.sets_planned).fill(exercise.weight_preset || 0)
  );
  const [rpePerSet, setRpePerSet] = useState<number[]>(
    Array(exercise.sets_planned).fill(exercise.rpe_target || 5)
  );
  const [difficulty, setDifficulty] = useState<'too_easy' | 'just_right' | 'too_hard'>('just_right');
  const [notes, setNotes] = useState('');

  // 이전 기록 불러오기
  useEffect(() => {
    const fetchPrevious = async () => {
      try {
        const previous = await workoutService.getPreviousWorkoutLog(
          exercise.id,
          memberId
        );
        if (previous) {
          setPreviousLog(previous);
          // 자동 불러오기 활성화 (선택)
        }
      } catch (error) {
        console.error('Failed to fetch previous log:', error);
      } finally {
        setLoadingPrevious(false);
      }
    };

    fetchPrevious();
  }, [exercise.id, memberId]);

  // 이전 기록 값 적용
  const applyPreviousLog = () => {
    if (!previousLog) return;

    setSetsCompleted(previousLog.sets_completed || exercise.sets_planned);
    setRepsPerSet(previousLog.reps_per_set || repsPerSet);
    setWeightPerSet(previousLog.weight_per_set || weightPerSet);
    setRpePerSet(previousLog.rpe_per_set || rpePerSet);
  };

  // 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await workoutService.createWorkoutLog(memberId, {
        exercise_id: exercise.id,
        logged_date: loggedDate,
        sets_completed: setsCompleted,
        reps_per_set: repsPerSet.slice(0, setsCompleted),
        weight_per_set: weightPerSet.slice(0, setsCompleted),
        rpe_per_set: rpePerSet.slice(0, setsCompleted),
        difficulty_feedback: difficulty,
        notes: notes || undefined,
      });

      if (result) {
        onSuccess?.(result);
      } else {
        onError?.('운동 기록 저장에 실패했습니다.');
      }
    } catch (error) {
      onError?.('오류가 발생했습니다.');
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingPrevious) {
    return <div className="p-4 text-center">로딩 중...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{exercise.exercise_name}</CardTitle>
        {previousLog && (
          <div className="text-sm text-muted-foreground mt-2">
            <p>
              지난 기록: {previousLog.weight_per_set?.[0]}kg × {previousLog.reps_per_set?.[0]} ×{' '}
              {previousLog.sets_completed}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={applyPreviousLog}
              className="mt-2"
            >
              지난 기록 불러오기
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 세트 수 */}
          <div>
            <label className="block text-sm font-medium mb-2">세트 수</label>
            <Input
              type="number"
              min="1"
              max={exercise.sets_planned}
              value={setsCompleted}
              onChange={(e) => setSetsCompleted(parseInt(e.target.value))}
              disabled={loading}
            />
          </div>

          {/* 각 세트별 입력 */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold">세트별 기록</label>
            {Array.from({ length: setsCompleted }).map((_, idx) => (
              <div key={idx} className="bg-muted p-3 rounded-lg space-y-3">
                <p className="text-sm font-medium">세트 {idx + 1}</p>
                <div className="grid grid-cols-3 gap-2">
                  {/* 중량 */}
                  <div>
                    <label className="text-xs text-muted-foreground">중량 (kg)</label>
                    <Input
                      type="number"
                      step="0.5"
                      value={weightPerSet[idx]}
                      onChange={(e) => {
                        const newWeights = [...weightPerSet];
                        newWeights[idx] = parseFloat(e.target.value) || 0;
                        setWeightPerSet(newWeights);
                      }}
                      disabled={loading}
                    />
                  </div>

                  {/* 횟수 */}
                  <div>
                    <label className="text-xs text-muted-foreground">횟수</label>
                    <Input
                      type="number"
                      min="1"
                      value={repsPerSet[idx]}
                      onChange={(e) => {
                        const newReps = [...repsPerSet];
                        newReps[idx] = parseInt(e.target.value) || 0;
                        setRepsPerSet(newReps);
                      }}
                      disabled={loading}
                    />
                  </div>

                  {/* RPE */}
                  <div>
                    <label className="text-xs text-muted-foreground">RPE (1-10)</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={rpePerSet[idx]}
                      onChange={(e) => {
                        const newRpe = [...rpePerSet];
                        newRpe[idx] = parseInt(e.target.value) || 0;
                        setRpePerSet(newRpe);
                      }}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 난이도 피드백 */}
          <div>
            <label className="block text-sm font-medium mb-2">난이도</label>
            <select
              value={difficulty}
              onChange={(e) => 
                setDifficulty(e.target.value as 'too_easy' | 'just_right' | 'too_hard')
              }
              disabled={loading}
              className="w-full p-2 border rounded-md"
            >
              <option value="too_easy">너무 쉬움</option>
              <option value="just_right">적당함</option>
              <option value="too_hard">너무 어려움</option>
            </select>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium mb-2">메모 (선택)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="운동 중 특이사항, 통증 등..."
              disabled={loading}
              className="w-full p-2 border rounded-md min-h-20"
            />
          </div>

          {/* 제출 버튼 */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '저장 중...' : '운동 기록 저장'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
