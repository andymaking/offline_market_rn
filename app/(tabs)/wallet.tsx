import React from 'react';
import { Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { colors } from '@/theme/colors';

export default function WalletScreen() {
	return (
		<Screen>
			<Text style={{ color: colors.text, fontSize: 22, fontWeight: '900', marginBottom: 12 }}>Wallet</Text>
			<View style={{ padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 12 }}>
				<Text style={{ color: colors.mutText }}>
					Coming soon: balances, funding, and transfers. Playback updates balances from the event stream.
				</Text>
			</View>
		</Screen>
	);
}
