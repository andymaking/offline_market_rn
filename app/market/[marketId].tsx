import { Link, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Section } from '@/components/layout/Section';
import { AppButton } from '@/components/ui/AppButton';
import { Pill } from '@/components/ui/Pill';
import { getOrderbook } from '@/db/repos/orderbookRepo';
import { listRecentTrades, type TradeRow } from '@/db/repos/tradesRepo';
import { ensurePlayerAndPlay, useEnsurePlayerReady } from '@/playback/useEnsurePlayerReady';
import { type MarketDetailState, useMarketDetailStore } from '@/stores/marketDetailStore';
import { type PlaybackState, usePlaybackStore } from '@/stores/playbackStore';
import { colors } from '@/theme/colors';

export default function MarketDetailScreen() {
  const { marketId } = useLocalSearchParams<{ marketId: string }>();

  const playbackStatus = usePlaybackStore((s: PlaybackState) => s.status);
  const pause = usePlaybackStore((s: PlaybackState) => s.pause);
  const restart = usePlaybackStore((s: PlaybackState) => s.restart);

  const asks = useMarketDetailStore((s: MarketDetailState) => s.asks);
  const bids = useMarketDetailStore((s: MarketDetailState) => s.bids);
  const trades = useMarketDetailStore((s: MarketDetailState) => s.trades);
  const setMarket = useMarketDetailStore((s: MarketDetailState) => s.setMarket);
  const setOrderbook = useMarketDetailStore((s: MarketDetailState) => s.setOrderbook);
  const setTrades = useMarketDetailStore((s: MarketDetailState) => s.setTrades);
  const { ready } = useEnsurePlayerReady();

  useEffect(() => {
    if (marketId) {
      setMarket(marketId);
      (async () => {
        try {
          const ob = await getOrderbook(marketId);
          setOrderbook({
            bids: ob.bids.map((l) => ({ price: l.price, size: l.size })),
            asks: ob.asks.map((l) => ({ price: l.price, size: l.size })),
          });
          const recent = await listRecentTrades(marketId, 80);
          setTrades(
            recent.map((t: TradeRow) => ({
              tradeId: t.trade_id,
              ts: t.ts,
              side: t.side,
              price: t.price,
              size: t.size,
            }))
          );
        } catch (e) {
          console.warn('Failed to load market detail', e);
        }
      })();
    }
  }, [marketId, setMarket, setOrderbook, setTrades]);

  return (
    <Screen>
      <Stack.Screen options={{ title: marketId ?? 'Market' }} />
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900' }}>{marketId}</Text>
      <View style={{ marginTop: 8, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pill
          label={(playbackStatus ?? 'paused').toUpperCase()}
          tone={playbackStatus === 'playing' ? 'blue' : playbackStatus === 'finished' ? 'yellow' : 'default'}
        />
        <Text style={{ color: colors.mutText }}>Orderbook + trades update from stream</Text>
      </View>

      <Section title="Playback" right={<Text style={{ color: colors.mutText, fontWeight: '700' }}>NDJSON → SQLite</Text>}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <AppButton
            title="Play"
            tone="primary"
            onPress={async () => {
              if (!ready) return;
              await ensurePlayerAndPlay();
            }}
            style={{ flex: 1 }}
          />
            <AppButton title="Pause" onPress={pause} style={{ flex: 1 }} />
            <AppButton title="Restart" onPress={restart} style={{ flex: 1 }} />
        </View>
        {!ready && <Text style={{ color: colors.mutText, marginTop: 8 }}>Preparing data...</Text>}
      </Section>

      <View style={{ flexDirection: 'row', gap: 12, flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Section title="Asks">
            <RowHeader />
            <FlatList
              data={asks}
              keyExtractor={(i) => String(i.price)}
              renderItem={({ item }) => <LevelRow price={item.price} size={item.size} tone="red" />}
            />
          </Section>
        </View>

        <View style={{ flex: 1 }}>
          <Section title="Bids">
            <RowHeader />
            <FlatList
              data={bids}
              keyExtractor={(i) => String(i.price)}
              renderItem={({ item }) => <LevelRow price={item.price} size={item.size} tone="green" />}
            />
          </Section>
        </View>
      </View>

      <Section
        title="Recent Trades"
        right={
          marketId ? (
            <Link href={{ pathname: '/market/[marketId]/trades', params: { marketId } as any }} style={{ color: colors.blue, fontWeight: '700' }}>
              See all
            </Link>
          ) : null
        }>
        <FlatList
          data={trades.slice(0, 10)}
          keyExtractor={(t, idx) => `${t.tradeId}-${idx}`}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text, fontWeight: '800' }}>
                  {item.side.toUpperCase()} • {item.price.toFixed(2)}
                </Text>
                <Text style={{ color: colors.mutText }}>{new Date(item.ts).toLocaleTimeString()}</Text>
              </View>
              <Text style={{ color: colors.mutText }}>Size: {item.size.toFixed(4)}</Text>
            </View>
          )}
        />
      </Section>
    </Screen>
  );
}

function RowHeader() {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 8 }}>
      <Text style={{ color: colors.mutText, fontWeight: '800', fontSize: 12 }}>Price</Text>
      <Text style={{ color: colors.mutText, fontWeight: '800', fontSize: 12 }}>Size</Text>
    </View>
  );
}

function LevelRow({ price, size, tone }: { price: number; size: number; tone: 'green' | 'red' }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: colors.border }}>
      <Text style={{ color: tone === 'green' ? colors.green : colors.red, fontWeight: '900' }}>
        {price.toFixed(2)}
      </Text>
      <Text style={{ color: colors.text, fontWeight: '800' }}>{size.toFixed(4)}</Text>
    </View>
  );
}
