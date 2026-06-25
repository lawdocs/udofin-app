import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProfileItem {
  label: string;
  value: string;
}

interface ProfileCardProps {
  title: string;
  items: ProfileItem[];
}

export default function ProfileCard({ title, items }: ProfileCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      
      <View style={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <View key={index} style={[styles.row, !isLast && styles.divider]}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
    width: '100%',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  list: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 14,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },
});
