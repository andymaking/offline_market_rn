import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Section } from '@/components/layout/Section';
import { AppButton } from '@/components/ui/AppButton';
import { listRecentTrades, type TradeRow } from '@/db/repos/tradesRepo';
import { ensurePlayerAndPlay, useEnsurePlayerReady } from '@/playback/useEnsurePlayerReady';
import { type PlaybackState, usePlaybackStore } from '@/stores/playbackStore';
import { colors } from '@/theme/colors';

export default function MarketTradesScreen() {
  const { marketId } = useLocalSearchParams<{ marketId: string }>();
  const playbackStatus = usePlaybackStore((s: PlaybackState) => s.status);
  const pause = usePlaybackStore((s: PlaybackState) => s.pause);
  const restart = usePlaybackStore((s: PlaybackState) => s.restart);
  const { ready } = useEnsurePlayerReady();

  const [trades, setTrades] = useState<TradeRow[]>([]);

  useEffect(() => {
    if (!marketId) return;
    (async () => {
      const rows = await listRecentTrades(marketId, 500);
      setTrades(rows);
    })();
  }, [marketId]);

  return (
    <Screen>
      <Stack.Screen options={{ title: marketId ? `${marketId} Trades` : 'Trades' }} />

      <Section title="Playback" right={<Text style={{ color: colors.mutText, fontWeight: '700' }}>Control stream</Text>}>
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
        <Text style={{ color: colors.mutText, marginTop: 8 }}>Status: {playbackStatus}</Text>
      </Section>

      <Section title="All Trades">
        <FlatList
          data={trades}
          keyExtractor={(t, idx) => `${t.trade_id}-${idx}`}
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
