import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLoanStore } from '../../store/loanStore';
import Header from '../../components/Header';
import NotificationCard from '../../components/NotificationCard';
import { EmptyState } from '../../components/FeedbackStates';
import { Bell } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

export default function NotificationsScreen() {
  const { notifications, markNotificationRead } = useLoanStore();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const handleNotificationPress = (id: string) => {
    markNotificationRead(id);
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <Header title={t("Alerts & Inbox")} showBack={false} />
      
      {notifications.length === 0 ? (
        <EmptyState
          title={t("No Alerts")}
          description={t("Your inbox is clear! Any changes in loan status or payment schedules will appear here.")}
          icon={<Bell color={colors.textMuted} size={48} />}
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
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  list: {
    gap: 4,
  },
});
