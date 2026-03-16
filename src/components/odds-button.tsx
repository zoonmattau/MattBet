'use client';

import { cn } from '@/lib/utils';

interface OddsButtonProps {
  name: string;
  odds: number;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export function OddsButton({ name, odds, selected, disabled, onClick, compact }: OddsButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'odds-btn flex flex-col items-center gap-0.5 min-w-[70px] text-center disabled:opacity-50 disabled:cursor-not-allowed',
        selected && 'selected',
        compact ? 'px-2 py-1.5' : 'px-3 py-2'
      )}
    >
      <span className={cn('text-white/80 font-medium', compact ? 'text-[10px]' : 'text-xs')}>
        {name}
      </span>
      <span className={cn('font-bold', compact ? 'text-sm' : 'text-base')}>
        {odds.toFixed(2)}
      </span>
    </button>
  );
}
