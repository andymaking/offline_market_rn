import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        overflow: 'hidden',
      }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              paddingVertical: 10,
              backgroundColor: active ? colors.surface2 : colors.surface,
              alignItems: 'center',
            }}>
            <Text style={{ color: active ? colors.text : colors.mutText, fontWeight: '800' }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
