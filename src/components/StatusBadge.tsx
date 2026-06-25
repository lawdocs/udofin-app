import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getBadgeStyle = () => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'resolved':
      case 'paid':
      case 'disbursed':
        return { bg: '#D1FAE5', text: '#059669', label: status.toUpperCase() };
        
      case 'submitted':
      case 'kyc':
      case 'open':
      case 'pending':
        return { bg: '#FEF3C7', text: '#D97706', label: status.toUpperCase() };
        
      case 'review':
      case 'in_progress':
        return { bg: '#DBEAFE', text: '#2563EB', label: 'IN PROGRESS' };
        
      case 'offers':
        return { bg: '#F5F3FF', text: '#7C3AED', label: 'OFFERS RECEIVED' };
        
      case 'selected':
        return { bg: '#E0F2FE', text: '#0284C7', label: 'OFFER SELECTED' };
        
      case 'agreement':
        return { bg: '#FFF1F2', text: '#E11D48', label: 'SIGN AGREEMENT' };
        
      case 'overdue':
        return { bg: '#FEE2E2', text: '#DC2626', label: 'OVERDUE' };
        
      default:
        return { bg: '#F3F4F6', text: '#4B5563', label: status.toUpperCase() };
    }
  };

  const config = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
