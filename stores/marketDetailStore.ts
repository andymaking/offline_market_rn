import { create } from 'zustand';

export type Level = { price: number; size: number };
export type Trade = { tradeId: string; ts: number; side: 'buy' | 'sell'; price: number; size: number };

export type MarketDetailState = {
  marketId: string | null;
  bids: Level[];
  asks: Level[];
  trades: Trade[];
  setMarket: (id: string) => void;
  setOrderbook: (args: { bids: Level[]; asks: Level[] }) => void;
  setTrades: (t: Trade[]) => void;
  prependTrade: (t: Trade) => void;
  reset: () => void;
};

export const useMarketDetailStore = create<MarketDetailState>()((
  set: (
    partial:
      | MarketDetailState
      | Partial<MarketDetailState>
      | ((state: MarketDetailState) => MarketDetailState | Partial<MarketDetailState>)
  ) => void,
  get: () => MarketDetailState
) => ({
  marketId: null,
  bids: [],
  asks: [],
  trades: [],

  setMarket: (id: string) => set({ marketId: id }),

  setOrderbook: ({ bids, asks }: { bids: Level[]; asks: Level[] }) => set({ bids, asks }),

  setTrades: (t: Trade[]) => set({ trades: t }),

  prependTrade: (t: Trade) => set({ trades: [t, ...get().trades].slice(0, 80) }),

  reset: () => set({ marketId: null, bids: [], asks: [], trades: [] }),
}));
