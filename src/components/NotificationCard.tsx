import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, Tag, ShieldCheck, CreditCard, HeartHandshake } from 'lucide-react-native';

interface NotificationCardProps {
  title: string;
  message: string;
  category: 'applications' | 'offers' | 'loan' | 'payments' | 'support';
  date: string;
  read: boolean;
  onPress?: () => void;
}

export default function NotificationCard({
  title,
  message,
  category,
  date,
  read,
  onPress,
}: NotificationCardProps) {
  const getIcon = () => {
    const size = 18;
    switch (category) {
      case 'applications':
        return { icon: <ShieldCheck color="#2563EB" size={size} />, bg: '#DBEAFE' };
      case 'offers':
        return { icon: <Tag color="#7C3AED" size={size} />, bg: '#F5F3FF' };
      case 'payments':
        return { icon: <CreditCard color="#059669" size={size} />, bg: '#D1FAE5' };
      case 'support':
        return { icon: <HeartHandshake color="#D97706" size={size} />, bg: '#FEF3C7' };
      case 'loan':
      default:
        return { icon: <Bell color="#E47656" size={size} />, bg: '#FFF5F2' };
    }
  };

  const config = getIcon();
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      style={[styles.card, !read && styles.unreadCard]}
      disabled={!onPress}
    >
      <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
        {config.icon}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, !read && styles.unreadText]}>{title}</Text>
          {!read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.date}>{formatTime(date)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  unreadCard: {
    borderColor: '#FFF5F2',
    backgroundColor: '#FFFBF9',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  unreadText: {
    color: '#111827',
    fontWeight: '800',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E47656',
  },
  message: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 6,
  },
  date: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
