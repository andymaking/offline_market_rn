import React from 'react';
import { View } from 'react-native';

import { colors } from '@/theme/colors';

export function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />;
}
