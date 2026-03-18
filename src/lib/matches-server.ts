import { MatchDefinition, DEFAULT_MATCHES, PairingOverrides, applyPairingOverrides } from './matches';
import { createServiceSupabase } from './supabase/server';

// Server-side: fetch matches with DB overrides applied
export async function getMatches(): Promise<MatchDefinition[]> {
  const supabase = createServiceSupabase();
  const { data } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'match_pairings')
    .single();

  if (!data?.value) return DEFAULT_MATCHES;

  try {
    const overrides: PairingOverrides = JSON.parse(data.value);
    return applyPairingOverrides(overrides);
  } catch {
    return DEFAULT_MATCHES;
  }
}
