'use client';

import { useState } from 'react';
import { useBetSlip } from '@/lib/betslip-store';
import { BetSlip } from './bet-slip';

export function FloatingBetSlip() {
  const { items, removeItem, clear } = useBetSlip();
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  const totalOdds = items.length === 1
    ? Number(items[0].selection.odds_decimal)
    : items.reduce((acc, i) => acc * Number(i.selection.odds_decimal), 1);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-up panel */}
      <div className={`fixed left-0 right-0 z-[70] md:hidden transition-transform duration-300 ease-out ${
        open ? 'bottom-0 translate-y-0' : 'bottom-0 translate-y-full'
      }`}>
        <div className="bg-[#141c28] border-t border-white/[0.08] rounded-t-2xl max-h-[85vh] overflow-y-auto">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-bold">Bet Slip</span>
              <button onClick={() => setOpen(false)} className="text-white/40 text-sm hover:text-white/60">Done</button>
            </div>
            <BetSlip
              items={items}
              onRemove={removeItem}
              onClear={() => { clear(); setOpen(false); }}
              onBetPlaced={() => { clear(); setOpen(false); }}
            />
          </div>
        </div>
      </div>

      {/* Sticky tab - always visible above bottom nav */}
      {!open && (
        <div className="fixed left-0 right-0 bottom-[5.5rem] z-[55] md:hidden px-3">
          <button
            onClick={() => setOpen(true)}
            className="w-full bg-green-bright text-white rounded-xl px-4 py-3.5 flex items-center justify-between shadow-lg shadow-black/40"
          >
            <div className="flex items-center gap-2.5">
              <span className="bg-white text-green-bright text-xs font-black w-7 h-7 rounded-full flex items-center justify-center">
                {items.length}
              </span>
              <span className="font-bold text-sm">
                {items.length === 1 ? items[0].selection.name : `${items.length} Selections`}
              </span>
            </div>
            <span className="font-black text-sm">View Slip &rsaquo;</span>
          </button>
        </div>
      )}

      {/* Desktop: show inline at bottom-right */}
      <div className="hidden md:block fixed bottom-4 right-4 z-[60] w-80">
        <BetSlip
          items={items}
          onRemove={removeItem}
          onClear={clear}
          onBetPlaced={clear}
        />
      </div>
    </>
  );
}
