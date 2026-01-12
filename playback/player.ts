import { useMarketDetailStore } from '@/stores/marketDetailStore';
import { useMarketStore } from '@/stores/marketStore';
import { usePlaybackStore } from '@/stores/playbackStore';

import { upsertBalance } from '@/db/repos/balancesRepo';
import { insertEvent } from '@/db/repos/eventsRepo';
import { upsertMarket } from '@/db/repos/marketsRepo';
import { getOrderbook, replaceOrderbook, upsertLevel } from '@/db/repos/orderbookRepo';
import { insertTrade } from '@/db/repos/tradesRepo';

import type { MarketEvent } from './streamReader';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let running = false;

export async function startPlayer(events: MarketEvent[]) {
  if (running) return;
  running = true;

  if (usePlaybackStore.getState().totalEvents !== events.length) {
    usePlaybackStore.getState().setTotalEvents(events.length);
  }

  while (running) {
    const state = usePlaybackStore.getState();
    if (state.status !== 'playing') {
      await sleep(80);
      continue;
    }

    const idx = state.currentIndex;

    if (idx >= events.length) {
      usePlaybackStore.getState().finish();
      await sleep(150);
      continue;
    }

    const ev = events[idx];

    await insertEvent({
      idx,
      ts: 'ts' in ev ? ev.ts ?? null : null,
      type: ev.type,
      marketId: 'marketId' in ev ? ev.marketId ?? null : null,
      payload: ev,
    });

    await applyEvent(ev);

    usePlaybackStore.getState().advance(1);

    const baseDelay = 120;
    const speed = usePlaybackStore.getState().speed;
    await sleep(Math.max(10, Math.floor(baseDelay / speed)));
  }
}

export function stopPlayer() {
  running = false;
}

async function applyEvent(ev: MarketEvent) {
  switch (ev.type) {
    case 'market_tick': {
      await upsertMarket({
        marketId: ev.marketId,
        lastPrice: ev.lastPrice,
        change24h: ev.change24h,
        volume24h: ev.volume24h,
      });

      useMarketStore.getState().upsertMarket({
        marketId: ev.marketId,
        lastPrice: ev.lastPrice,
        change24h: ev.change24h ?? 0,
      });

      break;
    }

    case 'orderbook_snapshot': {
      await replaceOrderbook({
        marketId: ev.marketId,
        bids: ev.bids.map(([price, size]) => ({ price, size })),
        asks: ev.asks.map(([price, size]) => ({ price, size })),
      });

      const active = useMarketStore.getState().activeMarketId;
      if (active === ev.marketId) {
        const ob = await getOrderbook(ev.marketId);
        useMarketDetailStore.getState().setOrderbook({
          bids: ob.bids.map((l) => ({ price: l.price, size: l.size })),
          asks: ob.asks.map((l) => ({ price: l.price, size: l.size })),
        });
      }
      break;
    }

    case 'orderbook_update': {
      await upsertLevel({
        marketId: ev.marketId,
        side: ev.side,
        price: ev.price,
        size: ev.size,
      });

      const active = useMarketStore.getState().activeMarketId;
      if (active === ev.marketId) {
        const ob = await getOrderbook(ev.marketId);
        useMarketDetailStore.getState().setOrderbook({
          bids: ob.bids.map((l) => ({ price: l.price, size: l.size })),
          asks: ob.asks.map((l) => ({ price: l.price, size: l.size })),
        });
      }
      break;
    }

    case 'trade': {
      await insertTrade({
        trade_id: ev.tradeId,
        market_id: ev.marketId,
        ts: ev.ts,
        side: ev.side,
        price: ev.price,
        size: ev.size,
      });

      const active = useMarketStore.getState().activeMarketId;
      if (active === ev.marketId) {
        useMarketDetailStore.getState().prependTrade({
          tradeId: ev.tradeId,
          ts: ev.ts,
          side: ev.side,
          price: ev.price,
          size: ev.size,
        });
      }

      await upsertMarket({ marketId: ev.marketId, lastPrice: ev.price });
      useMarketStore.getState().upsertMarket({ marketId: ev.marketId, lastPrice: ev.price });

      break;
    }

    case 'balance_update': {
      await upsertBalance({
        asset: ev.asset,
        total: ev.total,
        available: ev.available,
      });
      break;
    }

    default:
      break;
  }
}
