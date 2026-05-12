'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDateISO } from '@/lib/utils';
import { MEAL_SLOTS_ARRAY, MEAL_SLOT_LABELS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DietLogForm } from '@/components/member/DietLogForm';
import type { DietGuideMeal, MealSlot } from '@/types';

type LinkRow = { id: string; trainer_id: string };

type GuideRow = {
  id: string;
  diet_guide_meals?: DietGuideMeal[] | null;
};

export default function MemberDietPage() {
  const today = useMemo(() => formatDateISO(new Date()), []);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [link, setLink] = useState<LinkRow | null>(null);
  const [guideMealsBySlot, setGuideMealsBySlot] = useState<Record<string, DietGuideMeal | undefined>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user.id ?? null;
      setMemberId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }

      const { data: linkData } = await supabase
        .from('trainer_member_links')
        .select('id, trainer_id')
        .eq('member_id', uid)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      const linkRow = (linkData as LinkRow | null) ?? null;
      setLink(linkRow);
      if (!linkRow) {
        setLoading(false);
        return;
      }

      const { data: guideData, error: guideErr } = await supabase
        .from('diet_guides')
        .select(
          `
          id,
          diet_guide_meals:id(
            *
          )
        `
        )
        .eq('link_id', linkRow.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (guideErr) {
        setError(guideErr.message);
        setLoading(false);
        return;
      }

      const guide = guideData as unknown as GuideRow | null;
      const meals = guide?.diet_guide_meals ?? [];
      const next: Record<string, DietGuideMeal | undefined> = {};
      for (const m of meals) next[m.meal_slot] = m;
      setGuideMealsBySlot(next);
      setLoading(false);
    };

    load();
  }, [today]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">식단 기록</h1>
        <p className="text-sm text-muted-foreground">오늘({today}) 식단을 시간대별로 기록합니다.</p>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">불러오는 중...</div>
      ) : !memberId ? (
        <div className="text-sm text-muted-foreground">로그인이 필요합니다.</div>
      ) : !link ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">트레이너 연결이 필요합니다</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            트레이너가 회원 ID로 연결하면 식단 가이드/기록 기능이 활성화됩니다.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4">
            {MEAL_SLOTS_ARRAY.map(({ value }) => (
              <div key={value}>
                <div className="text-sm font-semibold mb-2">{MEAL_SLOT_LABELS[value]}</div>
                <DietLogForm
                  memberId={memberId}
                  linkId={link.id}
                  loggedDate={today}
                  mealSlot={value as MealSlot}
                  guideMeal={guideMealsBySlot[value]}
                  onError={(msg) => setError(msg)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

