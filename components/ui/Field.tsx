import React from 'react';
import { Text, TextInput, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={{ color: colors.mutText, marginBottom: 6, fontWeight: '700', fontSize: 12 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutText}
        keyboardType={keyboardType}
        style={{
          color: colors.text,
          backgroundColor: colors.surface2,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      />
    </View>
  );
}
