'use client';

import { useState } from 'react';
import { Market, MarketSelection } from '@/lib/types';
import { StatusBadge, RoundBadge, FeaturedBadge } from './status-badge';
import Link from 'next/link';

const COLLAPSE_THRESHOLD = 4;

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
    <div className="bg-navy-card border border-white/8 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {showLink ? (
              <Link
                href={`/markets/${market.slug}`}
                className="text-white font-semibold text-sm hover:text-green-bright transition-colors"
              >
                {market.title}
              </Link>
            ) : (
              <h3 className="text-white font-semibold text-sm">{market.title}</h3>
            )}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <StatusBadge status={market.status} />
              {market.is_featured && <FeaturedBadge />}
              {market.round_label && <RoundBadge label={market.round_label} />}
            </div>
          </div>
          {market.line_value && (
            <div className="text-right shrink-0">
              <div className="text-xs text-white/40 uppercase tracking-wide">Line</div>
              <div className="text-lg font-bold text-gold">{market.line_value}</div>
            </div>
          )}
        </div>
      </div>

      {/* Selections - list format, favourite to longshot */}
      <div className="divide-y divide-white/3">
        {visible.map((sel) => {
          const isSelected = selectedSelectionId === sel.id;
          return (
            <button
              key={sel.id}
              onClick={() => !isDisabled && onSelectBet?.(market, sel)}
              disabled={isDisabled}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors disabled:cursor-default ${
                isSelected
                  ? 'bg-green-accent/15'
                  : 'hover:bg-white/3'
              }`}
            >
              <span className={`text-sm ${isSelected ? 'text-white font-semibold' : 'text-white/70'}`}>
                {sel.name}
              </span>
              <span className={`text-sm font-bold font-mono ${isSelected ? 'text-green-bright' : 'text-green-bright/80'}`}>
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
          className="w-full px-4 py-2.5 text-xs text-white/40 hover:text-white/60 transition-colors border-t border-white/3 text-left"
        >
          Tap to expand selections (+{sorted.length - COLLAPSE_THRESHOLD} more)
        </button>
      )}
      {shouldCollapse && expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="w-full px-4 py-2.5 text-xs text-white/40 hover:text-white/60 transition-colors border-t border-white/3 text-left"
        >
          Collapse
        </button>
      )}
    </div>
  );
}
