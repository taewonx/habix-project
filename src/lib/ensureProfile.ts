import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types';

function deriveUsername(email: string) {
  const local = email
    .split('@')[0]
    .replace(/[^a-zA-Z0-9\uAC00-\uD7A3_]/g, '_')
    .slice(0, 24);
  return `${local || 'user'}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 로그인/회원가입 직후 profiles 행이 없으면 생성합니다.
 * 트리거로 이미 만들어진 경우에는 아무것도 하지 않습니다.
 */
export async function ensureUserProfile(
  user: User,
  emailHint: string,
  fallbackRole: UserRole = 'member'
): Promise<{ ok: true } | { ok: false; message: string }> {
  const email = user.email ?? emailHint;
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (existing) return { ok: true };

  const metaRole = user.user_metadata?.role;
  const role: UserRole =
    metaRole === 'trainer' || metaRole === 'member' ? metaRole : fallbackRole;

  const fullName = user.user_metadata?.full_name as string | undefined;

  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    email,
    username: deriveUsername(email),
    role,
    full_name: fullName?.trim() || undefined,
  });

  if (error) return { ok: false, message: error.message };

  return { ok: true };
}
