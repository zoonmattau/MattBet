export interface Team {
  id: string;
  name: string;
  avg_handicap: number | null;
  created_at: string;
  players?: Player[];
}

export interface Player {
  id: string;
  name: string;
  handicap: number;
  team_id: string | null;
  created_at: string;
  team?: Team;
}

export type MarketStatus = 'open' | 'suspended' | 'settled' | 'void';
export type MarketCategory = 'outrights' | 'stableford' | 'score_totals' | 'novelty' | 'match_play' | 'trip_specials';

export interface Market {
  id: string;
  title: string;
  slug: string;
  category: MarketCategory;
  market_type: string;
  line_value: number | null;
  status: MarketStatus;
  round_label: string | null;
  is_featured: boolean;
  settlement_type: string;
  created_at: string;
  updated_at: string;
  selections?: MarketSelection[];
}

export interface MarketSelection {
  id: string;
  market_id: string;
  name: string;
  odds_decimal: number;
  sort_order: number;
  is_winner: boolean | null;
  created_at: string;
  updated_at: string;
}

export type BetStatus = 'pending' | 'won' | 'lost' | 'void';

export interface Bet {
  id: string;
  user_id: string | null;
  bettor_name: string;
  market_id: string;
  selection_id: string;
  stake: number;
  odds_taken: number;
  potential_payout: number;
  status: BetStatus;
  placed_at: string;
  settled_at: string | null;
  market?: Market;
  selection?: MarketSelection;
}

export interface LeaderboardIndividual {
  id: string;
  player_id: string | null;
  player_name: string;
  team_name: string | null;
  handicap: number | null;
  round_1_score: number | null;
  round_1_points: number | null;
  round_2_score: number | null;
  round_2_points: number | null;
  round_3_score: number | null;
  round_3_points: number | null;
  round_4_score: number | null;
  round_4_points: number | null;
  total_points: number;
  position: number | null;
  source: 'manual' | 'sheet';
  updated_at: string;
}

export interface LeaderboardTeam {
  id: string;
  team_id: string | null;
  team_name: string;
  round_1_points: number | null;
  round_2_points: number | null;
  round_3_points: number | null;
  round_4_points: number | null;
  total_points: number;
  position: number | null;
  source: 'manual' | 'sheet';
  updated_at: string;
}

export interface SyncLog {
  id: string;
  source_type: string;
  source_reference: string | null;
  status: 'pending' | 'success' | 'error';
  rows_processed: number;
  message: string | null;
  synced_at: string;
}

export interface AdminSetting {
  id: string;
  key: string;
  value: string | null;
  updated_at: string;
}

export interface BetSlipItem {
  market: Market;
  selection: MarketSelection;
  stake: number;
}

export interface ExposureData {
  market: Market;
  selections: (MarketSelection & {
    total_staked: number;
    bet_count: number;
    liability: number;
    net_result: number;
  })[];
  total_handle: number;
  worst_case: number;
  best_case: number;
  overround: number;
}
