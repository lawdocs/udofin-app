import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return [styles.btn, styles.btnSecondary, style];
      case 'outline':
        return [styles.btn, styles.btnOutline, style];
      case 'primary':
      default:
        return [styles.btn, styles.btnPrimary, style];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return [styles.text, styles.textSecondary, textStyle];
      case 'outline':
        return [styles.text, styles.textOutline, textStyle];
      case 'primary':
      default:
        return [styles.text, styles.textPrimary, textStyle];
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), (disabled || loading) && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#E47656' : '#FFFFFF'} size="small" />
      ) : (
        <Text style={[getTextStyle(), disabled && styles.textDisabled]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnPrimary: {
    backgroundColor: '#E47656',
    shadowColor: '#E47656',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  btnSecondary: {
    backgroundColor: '#FFF5F2',
    borderWidth: 1,
    borderColor: '#FBECE8',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E47656',
  },
  btnDisabled: {
    backgroundColor: '#EFEFEF',
    borderColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: '#E47656',
  },
  textOutline: {
    color: '#E47656',
  },
  textDisabled: {
    color: '#A0A0A0',
  },
});
