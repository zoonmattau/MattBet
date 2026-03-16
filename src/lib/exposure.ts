import type { Market, MarketSelection, Bet, ExposureData } from './types';

export function calculateExposure(
  market: Market,
  selections: MarketSelection[],
  bets: Bet[]
): ExposureData {
  const selectionData = selections.map((sel) => {
    const selBets = bets.filter((b) => b.selection_id === sel.id && b.status !== 'void');
    const total_staked = selBets.reduce((sum, b) => sum + Number(b.stake), 0);
    const bet_count = selBets.length;
    const total_payout = selBets.reduce((sum, b) => sum + Number(b.potential_payout), 0);
    const total_handle = bets
      .filter((b) => b.status !== 'void')
      .reduce((sum, b) => sum + Number(b.stake), 0);

    // If this selection wins: book pays out total_payout but keeps all stakes
    const liability = total_payout - total_handle;
    // Net result for bookmaker if this selection wins
    // Positive = bookmaker profits, Negative = bookmaker loses
    const net_result = total_handle - total_payout;

    return {
      ...sel,
      total_staked,
      bet_count,
      liability: Math.max(0, total_payout - total_handle),
      net_result,
    };
  });

  const total_handle = bets
    .filter((b) => b.status !== 'void')
    .reduce((sum, b) => sum + Number(b.stake), 0);

  const netResults = selectionData.map((s) => s.net_result);
  const worst_case = Math.min(...netResults, 0);
  const best_case = Math.max(...netResults, 0);

  // Overround calculation
  const overround =
    selections.length > 0
      ? selections.reduce((sum, s) => sum + 1 / Number(s.odds_decimal), 0) * 100
      : 100;

  return {
    market,
    selections: selectionData,
    total_handle,
    worst_case,
    best_case,
    overround,
  };
}

export function impliedProbability(odds: number): number {
  return (1 / odds) * 100;
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}
