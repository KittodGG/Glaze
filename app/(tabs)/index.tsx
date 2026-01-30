import { BalanceCard } from '@/components/home/BalanceCard';
import { DynamicInsightCard } from '@/components/home/DynamicInsightCard';
import { HomeHeader } from '@/components/home/HomeHeader';
import { QuickActions } from '@/components/home/QuickActions';
import { RecentTransactions } from '@/components/home/RecentTransactions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PremiumBackground } from '@/components/ui/PremiumBackground';

export default function HomeScreen() {
  const { top } = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const [challengeAccepted, setChallengeAccepted] = useState(false);

  const handleChallengeAccepted = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setChallengeAccepted(true);
  };

  return (
    <PremiumBackground>
      <ScrollView
        contentContainerStyle={{ paddingTop: top + 10, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader showChallengeBadge={challengeAccepted} />
        <BalanceCard />
        <DynamicInsightCard onChallengeAccepted={handleChallengeAccepted} />
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
