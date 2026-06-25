import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react-native';

// EMPTY STATE
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <View style={styles.centerContainer}>
      <View style={styles.iconWrapper}>
        {icon || <Inbox color="#9CA3AF" size={48} strokeWidth={1.5} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

// LOADING SKELETON
export function LoadingSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <ActivityIndicator color="#E47656" size="large" />
      <Text style={styles.loadingText}>Fetching details...</Text>
    </View>
  );
}

// ERROR STATE
interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.centerContainer}>
      <View style={[styles.iconWrapper, { backgroundColor: '#FEE2E2' }]}>
        <AlertCircle color="#DC2626" size={32} />
      </View>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.description}>{message}</Text>
      
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
          <RefreshCw color="#FFFFFF" size={16} style={{ marginRight: 6 }} />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    textAlign: 'center',
    minHeight: 250,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
    paddingHorizontal: 16,
  },
  skeletonContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E47656',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
