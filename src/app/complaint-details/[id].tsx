import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import { useLocalSearchParams } from 'expo-router';
import { useLoanStore } from '../../store/loanStore';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import ProfileCard from '../../components/ProfileCard';
import { EmptyState } from '../../components/FeedbackStates';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

export default function ComplaintDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { complaints } = useLoanStore();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const ticket = complaints.find((t) => t.id === id);

  if (!ticket) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={t("Ticket Details")} />
        <EmptyState
          title={t("Ticket Not Found")}
          description={t("We could not locate support ticket matching identifier: {{id}}").replace('{{id}}', String(id))}
        />
      </SafeAreaView>
    );
  }

  const details = [
    { label: t('Ticket Reference ID'), value: ticket.id },
    { label: t('Category'), value: t(ticket.category) },
    { label: t('Created On'), value: ticket.date },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t("Ticket Progress")} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Main Details Box */}
        <View style={styles.statusBox}>
          <View style={styles.row}>
            <Text style={styles.statusLabel}>{t("Current Status")}</Text>
            <StatusBadge status={ticket.status} />
          </View>
        </View>

        <ProfileCard title={t("TICKET METADATA")} items={details} />

        {/* User Description */}
        <View style={styles.contentCard}>
          <Text style={styles.cardTitle}>{t("USER COMPLAINT BRIEF")}</Text>
          <Text style={styles.descriptionText}>{ticket.description}</Text>
        </View>

        {/* Redressal Response notes */}
        <View style={styles.contentCard}>
          <Text style={styles.cardTitle}>{t("OFFICIAL RESOLUTION RESPONSE")}</Text>
          <Text style={styles.notesText}>
            {ticket.notes || t('Our customer support officer is reviewing your complaint details. Response is typically posted within 24 hours.')}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
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
  statusBox: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  contentCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
    width: '100%',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 13,
    color: colors.primary,
    lineHeight: 18,
    fontWeight: '700',
  },
});
