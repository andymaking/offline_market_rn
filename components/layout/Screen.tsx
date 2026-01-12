import React from 'react';
import { View, ViewStyle } from 'react-native';

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ flex: 1, padding: 14 }, style]}>{children}</View>;
}
