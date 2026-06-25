import React from 'react';
import { Tabs } from 'expo-router';
import { Home, ClipboardList, Wallet, Bell, User } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E47656',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          backgroundColor: '#FFFFFF',
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 88 : 68,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Applications',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="loan"
        options={{
          title: 'My Loan',
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
