import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useLoanStore } from '../../store/loanStore';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import ProfileCard from '../../components/ProfileCard';
import { EmptyState } from '../../components/FeedbackStates';

export default function ComplaintDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { complaints } = useLoanStore();

  const ticket = complaints.find((t) => t.id === id);

  if (!ticket) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Ticket Details" />
        <EmptyState
          title="Ticket Not Found"
          description={`We could not locate support ticket matching identifier: ${id}`}
        />
      </SafeAreaView>
    );
  }

  const details = [
    { label: 'Ticket Reference ID', value: ticket.id },
    { label: 'Category', value: ticket.category },
    { label: 'Created On', value: ticket.date },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Ticket Progress" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Main Details Box */}
        <View style={styles.statusBox}>
          <View style={styles.row}>
            <Text style={styles.statusLabel}>Current Status</Text>
            <StatusBadge status={ticket.status} />
          </View>
        </View>

        <ProfileCard title="TICKET METADATA" items={details} />

        {/* User Description */}
        <View style={styles.contentCard}>
          <Text style={styles.cardTitle}>USER COMPLAINT BRIEF</Text>
          <Text style={styles.descriptionText}>{ticket.description}</Text>
        </View>

        {/* Redressal Response notes */}
        <View style={styles.contentCard}>
          <Text style={styles.cardTitle}>OFFICIAL RESOLUTION RESPONSE</Text>
          <Text style={styles.notesText}>
            {ticket.notes || 'Our customer support officer is reviewing your complaint details. Response is typically posted within 24 hours.'}
          </Text>
        </View>

      </ScrollView>
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
  statusBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
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
    color: '#1F2937',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 20,
    width: '100%',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 13,
    color: '#E47656',
    lineHeight: 18,
    fontWeight: '700',
  },
});
