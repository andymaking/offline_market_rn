import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Section } from '@/components/layout/Section';
import { AppButton } from '@/components/ui/AppButton';
import { Field } from '@/components/ui/Field';
import { Segmented } from '@/components/ui/Segmented';
import { colors } from '@/theme/colors';

export type Order = { orderId: string; marketId: string; side: 'buy' | 'sell'; price: number; amount: number };

export default function OrdersScreen() {
  const [marketId, setMarketId] = useState('USDT-NGN');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('1500');
  const [amount, setAmount] = useState('10');
  const [orders, setOrders] = useState<Order[]>([]);

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900', marginBottom: 10 }}>Orders</Text>

      <Section title="Place Limit Order">
        <Field label="Market" value={marketId} onChangeText={setMarketId} placeholder="USDT-NGN" />
        <View style={{ marginBottom: 14 }}>
          <Text style={{ color: colors.mutText, marginBottom: 6, fontWeight: '700', fontSize: 12 }}>Side</Text>
          <Segmented
            value={side}
            onChange={setSide}
            options={[
              { label: 'BUY', value: 'buy' },
              { label: 'SELL', value: 'sell' },
            ]}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field label="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
          </View>
        </View>

        <AppButton
          title="Create Order"
          tone="primary"
          onPress={() => {
            const p = Number(price);
            const a = Number(amount);
            if (!Number.isFinite(p) || !Number.isFinite(a) || p <= 0 || a <= 0) return;

            setOrders((prev) => [
              {
                orderId: `${Date.now()}`,
                marketId,
                side,
                price: p,
                amount: a,
              },
              ...prev,
            ]);
          }}
        />
      </Section>

      <Section title="Open Orders">
        <FlatList
          data={orders}
          keyExtractor={(o) => o.orderId}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.text, fontWeight: '900' }}>
                {item.marketId} • {item.side.toUpperCase()}
              </Text>
              <Text style={{ color: colors.mutText }}>
                {item.amount} @ {item.price}
              </Text>

              <View style={{ marginTop: 10 }}>
                <AppButton
                  title="Cancel"
                  onPress={() => setOrders((prev) => prev.filter((o) => o.orderId !== item.orderId))}
                />
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: colors.mutText }}>No open orders yet.</Text>}
        />
      </Section>
    </Screen>
  );
}
