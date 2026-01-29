import { EditTransactionSheet } from '@/components/EditTransactionSheet';
import { MagicInputSheet } from '@/components/MagicInputSheet';
import FloatingTabBar from '@/components/navigation/FloatingTabBar';
import { EditSheetProvider } from '@/context/EditSheetContext';
import { MagicSheetProvider } from '@/context/MagicSheetContext';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <MagicSheetProvider>
      <EditSheetProvider>
        <View style={{ flex: 1 }}>
          <Tabs
            tabBar={(props) => <FloatingTabBar {...props} />}
            screenOptions={{
              headerShown: false,
              // We need transparent background for the tabs to sit on the orb background
              sceneStyle: { backgroundColor: 'transparent' }
            }}>
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
            <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
          </Tabs>
          <MagicInputSheet />
          <EditTransactionSheet />
        </View>
      </EditSheetProvider>
    </MagicSheetProvider>
  );
}

