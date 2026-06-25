import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
}

export default function Header({ title, showBack = true, onBackPress, rightElement }: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <ChevronLeft color="#333" size={24} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
      
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {rightElement ? (
        <View style={styles.rightContainer}>{rightElement}</View>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F7F7F9',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 40,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});
