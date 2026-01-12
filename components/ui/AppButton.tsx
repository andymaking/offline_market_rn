import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';

export function AppButton({
  title,
  onPress,
  tone = 'default',
  style,
}: {
  title: string;
  onPress: () => void;
  tone?: 'default' | 'primary';
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: tone === 'primary' ? colors.surface2 : colors.surface,
          alignItems: 'center',
        },
        style,
      ]}>
      <Text style={{ color: colors.text, fontWeight: '700' }}>{title}</Text>
    </Pressable>
  );
}
