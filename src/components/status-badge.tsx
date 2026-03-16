import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide',
        `status-${status}`,
        className
      )}
    >
      {status}
    </span>
  );
}

export function RoundBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gold/15 text-gold border border-gold/20',
        className
      )}
    >
      {label}
    </span>
  );
}

export function FeaturedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gold/20 text-gold border border-gold/30',
        className
      )}
    >
      FEATURED
    </span>
  );
}

export function CategoryBadge({ category, className }: { category: string; className?: string }) {
  const labels: Record<string, string> = {
    outrights: 'Outright',
    stableford: 'Stableford',
    score_totals: 'Totals',
    novelty: 'Novelty',
    match_play: 'Match Play',
    trip_specials: 'Special',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/5 text-white/60 border border-white/10',
        className
      )}
    >
      {labels[category] || category}
    </span>
  );
}
