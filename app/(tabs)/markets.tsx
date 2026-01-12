import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppButton } from '@/components/ui/AppButton';
import { Pill } from '@/components/ui/Pill';
import { useMarketStore, type Market } from '@/stores/marketStore';
import { colors } from '@/theme/colors';

// Starter data in case SQLite/stream hasn’t populated yet; real data is hydrated via playback + repos.
const seed: Market[] = [
  { marketId: 'USDT-NGN', lastPrice: 1500, change24h: 0.021, isFavourite: false },
  { marketId: 'USDC-NGN', lastPrice: 1492, change24h: -0.008, isFavourite: true },
];

export default function MarketsScreen() {
  const router = useRouter();
  const markets = useMarketStore((s) => s.markets);
  const setMarkets = useMarketStore((s) => s.setMarkets);
  const toggleFavourite = useMarketStore((s) => s.toggleFavourite);
  const setActiveMarketId = useMarketStore((s) => s.setActiveMarketId);

  // Hydrate UI with seed if nothing is loaded yet (e.g., before playback seeds SQLite).
  useEffect(() => {
    if (markets.length === 0) {
      setMarkets(seed);
    }
  }, [markets.length, setMarkets]);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
        <AppButton title="Orders" onPress={() => router.push('/(tabs)/orders')} />
        <AppButton title="Wallet" onPress={() => router.push('/(tabs)/wallet')} />
      </View>

      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900', marginBottom: 10 }}>Markets</Text>

      <FlatList
        data={markets}
        keyExtractor={(m) => m.marketId}
        renderItem={({ item }) => {
          const changePct = item.change24h * 100;
          const tone = changePct >= 0 ? 'green' : 'red';
          return (
            <Pressable
              onPress={() => {
                setActiveMarketId(item.marketId);
                router.push({ pathname: '/market/[marketId]', params: { marketId: item.marketId } });
              }}
              style={{
                padding: 14,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 14,
                marginBottom: 10,
              }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: colors.text, fontWeight: '900', fontSize: 16 }}>{item.marketId}</Text>
                  <Text style={{ color: colors.mutText, marginTop: 2 }}>Last: {item.lastPrice.toFixed(2)}</Text>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <Pill label={`${changePct.toFixed(2)}%`} tone={tone as any} />
                  <Text
                    style={{ color: item.isFavourite ? colors.yellow : colors.mutText, fontWeight: '900' }}
                    onPress={() => toggleFavourite(item.marketId)}>
                    {item.isFavourite ? '★' : '☆'}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}
