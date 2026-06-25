import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLoanStore } from '../../store/loanStore';
import Header from '../../components/Header';
import NotificationCard from '../../components/NotificationCard';
import { EmptyState } from '../../components/FeedbackStates';
import { Bell } from 'lucide-react-native';

export default function NotificationsScreen() {
  const { notifications, markNotificationRead } = useLoanStore();

  const handleNotificationPress = (id: string) => {
    markNotificationRead(id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Alerts & Inbox" showBack={false} />
      
      {notifications.length === 0 ? (
        <EmptyState
          title="No Alerts"
          description="Your inbox is clear! Any changes in loan status or payment schedules will appear here."
          icon={<Bell color="#9CA3AF" size={48} />}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.list}>
            {notifications.map((n) => (
              <NotificationCard
                key={n.id}
                title={n.title}
                message={n.message}
                category={n.category}
                date={n.date}
                read={n.read}
                onPress={() => handleNotificationPress(n.id)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEF8F4',
  },
  scrollContent: {
    padding: 20,
  },
  list: {
    gap: 4,
  },
});
