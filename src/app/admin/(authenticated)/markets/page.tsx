import { createServerSupabase } from '@/lib/supabase/server';
import { AdminMarketsClient } from './markets-client';

export const dynamic = 'force-dynamic';

export default async function AdminMarketsPage() {
  const supabase = await createServerSupabase();

  const { data: markets } = await supabase
    .from('markets')
    .select('*, selections:market_selections(*)')
    .order('created_at');

  const { data: bets } = await supabase
    .from('bets')
    .select('*')
    .neq('status', 'void');

  return <AdminMarketsClient markets={markets || []} bets={bets || []} />;
}
