import React from 'react';
import { Text, View } from 'react-native';

import { colors } from '@/theme/colors';

export function Pill({ label, tone }: { label: string; tone?: 'default' | 'green' | 'red' | 'yellow' | 'blue' }) {
  const bg =
    tone === 'green'
      ? 'rgba(34,197,94,0.15)'
      : tone === 'red'
        ? 'rgba(239,68,68,0.15)'
        : tone === 'yellow'
          ? 'rgba(245,158,11,0.15)'
          : tone === 'blue'
            ? 'rgba(96,165,250,0.15)'
            : 'rgba(156,163,175,0.12)';

  const fg =
    tone === 'green'
      ? colors.green
      : tone === 'red'
        ? colors.red
        : tone === 'yellow'
          ? colors.yellow
          : tone === 'blue'
            ? colors.blue
            : colors.mutText;

  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
      <Text style={{ color: fg, fontWeight: '700', fontSize: 12 }}>{label}</Text>
    </View>
  );
}
