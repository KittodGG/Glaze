import { BalanceCard } from '@/components/home/BalanceCard';
import { HomeHeader } from '@/components/home/HomeHeader';
import { QuickActions } from '@/components/home/QuickActions';
import { RecentTransactions } from '@/components/home/RecentTransactions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PremiumBackground } from '@/components/ui/PremiumBackground';
import React from 'react';

export default function HomeScreen() {
  const { top } = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <PremiumBackground>
      <ScrollView
        contentContainerStyle={{ paddingTop: top + 10, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader />
        <BalanceCard />
        <QuickActions />
        <RecentTransactions />
      </ScrollView>
    </PremiumBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
