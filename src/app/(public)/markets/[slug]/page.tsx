import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { MarketDetailClient } from './market-detail-client';

export const dynamic = 'force-dynamic';

export default async function MarketDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  const { data: market } = await supabase
    .from('markets')
    .select('*, selections:market_selections(*)')
    .eq('slug', slug)
    .single();

  if (!market) notFound();

  return <MarketDetailClient market={market} />;
}
