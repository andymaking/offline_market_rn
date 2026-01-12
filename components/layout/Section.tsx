import React from 'react';
import { Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.sm,
        }}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{title}</Text>
        {right}
      </View>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.md,
        }}>
        {children}
      </View>
    </View>
  );
}
