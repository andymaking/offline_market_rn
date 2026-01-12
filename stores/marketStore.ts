import { create } from 'zustand';

export type Market = {
  marketId: string;
  lastPrice: number;
  change24h: number;
  isFavourite: boolean;
};

export type MarketState = {
  markets: Market[];
  activeMarketId: string | null;
  setMarkets: (m: Market[]) => void;
  setActiveMarketId: (id: string) => void;
  toggleFavourite: (id: string) => void;
  upsertMarket: (m: Partial<Market> & { marketId: string }) => void;
};

export const useMarketStore = create<MarketState>()((
  set: (
    partial:
      | MarketState
      | Partial<MarketState>
      | ((state: MarketState) => MarketState | Partial<MarketState>)
  ) => void,
  get: () => MarketState
) => ({
  markets: [],
  activeMarketId: null,

  setMarkets: (m: Market[]) => set({ markets: m }),

  setActiveMarketId: (id: string) => set({ activeMarketId: id }),

  toggleFavourite: (id: string) => {
    set({
      markets: get().markets.map((m: Market) =>
        m.marketId === id ? { ...m, isFavourite: !m.isFavourite } : m
      ),
    });
  },

  upsertMarket: (patch: Partial<Market> & { marketId: string }) => {
    const prev = get().markets;
    const idx = prev.findIndex((m: Market) => m.marketId === patch.marketId);

    if (idx === -1) {
      set({
        markets: [
          {
            marketId: patch.marketId,
            lastPrice: patch.lastPrice ?? 0,
            change24h: patch.change24h ?? 0,
            isFavourite: patch.isFavourite ?? false,
          },
          ...prev,
        ],
      });
      return;
    }

    const updated = [...prev];
    updated[idx] = { ...updated[idx], ...patch } as Market;
    set({ markets: updated });
  },
}));
