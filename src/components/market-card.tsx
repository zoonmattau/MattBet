'use client';

import { useState } from 'react';
import { Market, MarketSelection } from '@/lib/types';
import { StatusBadge, RoundBadge, FeaturedBadge } from './status-badge';
import Link from 'next/link';

const COLLAPSE_THRESHOLD = 6;

interface MarketCardProps {
  market: Market & { selections: MarketSelection[] };
  onSelectBet?: (market: Market, selection: MarketSelection) => void;
  selectedSelectionId?: string;
  showLink?: boolean;
}

export function MarketCard({ market, onSelectBet, selectedSelectionId, showLink = true }: MarketCardProps) {
  const isDisabled = market.status !== 'open';
  const sorted = [...market.selections].sort(
    (a, b) => Number(a.odds_decimal) - Number(b.odds_decimal)
  );
  const shouldCollapse = sorted.length > COLLAPSE_THRESHOLD;
  const [expanded, setExpanded] = useState(false);

  const visible = shouldCollapse && !expanded ? sorted.slice(0, COLLAPSE_THRESHOLD) : sorted;

  return (
    <div className={`card-elevated rounded-xl overflow-hidden ${market.is_featured ? 'card-featured' : ''}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {showLink ? (
              <Link
                href={`/markets/${market.slug}`}
                className="text-white font-bold text-[15px] hover:text-green-bright transition-colors"
              >
                {market.title}
              </Link>
            ) : (
              <h3 className="text-white font-bold text-[15px]">{market.title}</h3>
            )}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <StatusBadge status={market.status} />
              {market.is_featured && <FeaturedBadge />}
              {market.round_label && <RoundBadge label={market.round_label} />}
            </div>
          </div>
          {market.line_value && (
            <div className="text-right shrink-0">
              <div className="text-[10px] text-white/40 uppercase tracking-wide">Line</div>
              <div className="text-xl font-black text-gold">{market.line_value}</div>
            </div>
          )}
        </div>
      </div>

      {/* Selections */}
      <div>
        {visible.map((sel) => {
          const isSelected = selectedSelectionId === sel.id;
          return (
            <button
              key={sel.id}
              onClick={() => !isDisabled && onSelectBet?.(market, sel)}
              disabled={isDisabled}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all border-b border-white/[0.04] last:border-0 ${
                isSelected
                  ? 'bg-green-accent/10'
                  : 'hover:bg-white/[0.03]'
              } disabled:cursor-default`}
            >
              <span className={`text-[14px] ${isSelected ? 'text-white font-bold' : 'text-white/80'}`}>
                {sel.name}
              </span>
              <span className={`text-[15px] font-black font-mono odds-display px-3 py-1.5 rounded-lg odds-btn ${isSelected ? 'selected' : ''}`}>
                ${Number(sel.odds_decimal).toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expand button */}
      {shouldCollapse && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full px-4 py-3 text-sm text-green-bright/60 hover:text-green-bright font-medium transition-colors border-t border-white/[0.04] text-center"
        >
          Show all ({sorted.length - COLLAPSE_THRESHOLD} more)
        </button>
      )}
      {shouldCollapse && expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="w-full px-4 py-3 text-sm text-white/40 hover:text-white/60 font-medium transition-colors border-t border-white/[0.04] text-center"
        >
          Show less
        </button>
      )}
    </div>
  );
}
