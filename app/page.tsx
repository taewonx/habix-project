import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default async function Home() {
  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  // Redirect based on role
  if (profile?.role === 'trainer') {
    redirect('/dashboard');
  } else if (profile?.role === 'member') {
    redirect('/dashboard');
  }

  // Default redirect
  redirect('/login');
}
