import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

import balancesData from '@/assets/data/new_data/balances.json';
import marketsData from '@/assets/data/new_data/markets.json';
import orderUsdc from '@/assets/data/new_data/order-USDC-NGN.json';
import orderUsdt from '@/assets/data/new_data/order-USDT-NGN.json';

export type MarketSnapshot = {
  marketId: string;
  baseAsset?: string;
  quoteAsset?: string;
  lastPrice?: number;
  change24h?: number;
  volume24h?: number;
};

export type MarketEvent =
  | { type: 'market_tick'; ts?: number; marketId: string; lastPrice: number; change24h?: number; volume24h?: number }
  | { type: 'orderbook_snapshot'; ts?: number; marketId: string; bids: [number, number][]; asks: [number, number][] }
  | { type: 'orderbook_update'; ts?: number; marketId: string; side: 'bid' | 'ask'; price: number; size: number }
  | { type: 'trade'; ts: number; marketId: string; tradeId: string; side: 'buy' | 'sell'; price: number; size: number }
  | { type: 'balance_update'; ts?: number; asset: string; total: number; available: number };

type NdjsonEvent =
  | { type: 'trade'; market: string; tradeId: string; price: number; size: number; side: 'buy' | 'sell'; ts: number; seq?: number }
  | { type: 'ob_delta'; market: string; side: 'bid' | 'ask'; price: number; size: number; ts: number; seq?: number };

async function readNdjson(mod: number): Promise<NdjsonEvent[]> {
  const asset = Asset.fromModule(mod);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  const raw = await FileSystem.readAsStringAsync(uri);
  return raw
    .split('\n')
    .map((line: string) => line.trim())
    .filter(Boolean)
    .map((line: string) => JSON.parse(line) as NdjsonEvent);
}

export async function loadInitialMarkets(): Promise<MarketSnapshot[]> {
  return (marketsData as any[]).map((m) => ({
    marketId: m.marketId,
    baseAsset: m.base,
    quoteAsset: m.quote,
    lastPrice: m.initialLastPrice ?? 0,
    change24h: m.initialChange24h ?? 0,
    volume24h: 0,
  }));
}

export async function loadEvents(): Promise<MarketEvent[]> {
  const ndjsonEvents = await readNdjson(require('../assets/data/new_data/market_stream.ndjson'));

  const snapshots: MarketEvent[] = [orderUsdt, orderUsdc].map((ob) => ({
    type: 'orderbook_snapshot',
    marketId: (ob as any).market,
    bids: (ob as any).bids,
    asks: (ob as any).asks,
    ts: 0,
  }));

  const balanceEvents: MarketEvent[] = (balancesData as any[]).map((b) => ({
    type: 'balance_update',
    asset: b.asset,
    total: (b.available ?? 0) + (b.locked ?? 0),
    available: b.available ?? 0,
    ts: 0,
  }));

  const streamEvents: MarketEvent[] = ndjsonEvents.map((e) => {
    if (e.type === 'trade') {
      return {
        type: 'trade',
        marketId: e.market,
        tradeId: e.tradeId,
        side: e.side,
        price: e.price,
        size: e.size,
        ts: e.ts,
      } satisfies MarketEvent;
    }
    return {
      type: 'orderbook_update',
      marketId: e.market,
      side: e.side,
      price: e.price,
      size: e.size,
      ts: e.ts,
    } satisfies MarketEvent;
  });

  return [...snapshots, ...balanceEvents, ...streamEvents];
}
