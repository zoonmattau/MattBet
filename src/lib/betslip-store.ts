'use client';

import { useState, useEffect } from 'react';
import { BetSlipItem } from './types';

const STORAGE_KEY = 'mattbet-betslip';

export function useBetSlip() {
  const [items, setItems] = useState<BetSlipItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {}
    setLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {}
    }
  }, [items, loaded]);

  const addItem = (market: BetSlipItem['market'], selection: BetSlipItem['selection']) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.selection.id === selection.id);
      if (existing) {
        return prev.filter((item) => item.selection.id !== selection.id);
      }
      // Remove any other selection from same market
      const filtered = prev.filter((item) => item.market.id !== market.id);
      return [...filtered, { market, selection, stake: 0 }];
    });
  };

  const removeItem = (selectionId: string) => {
    setItems((prev) => prev.filter((b) => b.selection.id !== selectionId));
  };

  const clear = () => {
    setItems([]);
  };

  return { items, addItem, removeItem, clear, loaded };
}
