'use client';

import { useSyncExternalStore, useCallback } from 'react';
import { BetSlipItem } from './types';

const STORAGE_KEY = 'mattbet-betslip';

// Global state + listeners
let items: BetSlipItem[] = [];
let listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

// Load from localStorage on first import
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) items = JSON.parse(stored);
  } catch {}
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return items;
}

function getServerSnapshot() {
  return [] as BetSlipItem[];
}

export function useBetSlip() {
  const currentItems = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((market: BetSlipItem['market'], selection: BetSlipItem['selection']) => {
    const existing = items.find((item) => item.selection.id === selection.id);
    if (existing) {
      items = items.filter((item) => item.selection.id !== selection.id);
    } else {
      const filtered = items.filter((item) => item.market.id !== market.id);
      items = [...filtered, { market, selection, stake: 0 }];
    }
    emit();
  }, []);

  const removeItem = useCallback((selectionId: string) => {
    items = items.filter((b) => b.selection.id !== selectionId);
    emit();
  }, []);

  const clear = useCallback(() => {
    items = [];
    emit();
  }, []);

  return { items: currentItems, addItem, removeItem, clear, loaded: true };
}
