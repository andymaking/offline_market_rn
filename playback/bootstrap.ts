import { upsertMarket } from '@/db/repos/marketsRepo';
import { initDb } from '@/db/schema';
import { useMarketStore } from '@/stores/marketStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { loadEvents, loadInitialMarkets } from './streamReader';

export async function bootstrapData() {
  await initDb();

  const markets = await loadInitialMarkets();
  for (const m of markets) {
    await upsertMarket({
      marketId: m.marketId,
      baseAsset: m.baseAsset ?? null,
      quoteAsset: m.quoteAsset ?? null,
      lastPrice: m.lastPrice ?? 0,
      change24h: m.change24h ?? 0,
      volume24h: m.volume24h ?? 0,
    });
  }

  useMarketStore.getState().setMarkets(
    markets.map((m) => ({
      marketId: m.marketId,
      lastPrice: m.lastPrice ?? 0,
      change24h: m.change24h ?? 0,
      isFavourite: false,
    }))
  );

  const events = await loadEvents();
  usePlaybackStore.getState().setTotalEvents(events.length);

  return { events };
}
