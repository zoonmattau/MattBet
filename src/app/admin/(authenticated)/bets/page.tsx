import { createServerSupabase } from '@/lib/supabase/server';
import { AdminBetsClient } from './bets-client';

export const dynamic = 'force-dynamic';

export default async function AdminBetsPage() {
  const supabase = await createServerSupabase();

  const { data: bets } = await supabase
    .from('bets')
    .select('*, market:markets(id, title, slug), selection:market_selections(id, name)')
    .order('placed_at', { ascending: false });

  return <AdminBetsClient bets={bets || []} />;
}
