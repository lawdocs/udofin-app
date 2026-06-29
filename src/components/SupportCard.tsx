import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MessageSquare, Phone, Mail, FileWarning } from 'lucide-react-native';

interface SupportCardProps {
  onLiveChat: () => void;
  onCall: () => void;
  onEmail: () => void;
  onRaiseComplaint: () => void;
}

export default function SupportCard({
  onLiveChat,
  onCall,
  onEmail,
  onRaiseComplaint,
}: SupportCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Customer Support Channels</Text>
      <Text style={styles.subtitle}>Our customer care executives are available 9:00 AM - 6:00 PM</Text>
      
      <View style={styles.grid}>
        {/* Live Chat */}
        <TouchableOpacity style={styles.gridBox} onPress={onLiveChat} activeOpacity={0.7}>
          <View style={[styles.iconContainer, { backgroundColor: '#FFF5F2' }]}>
            <MessageSquare color="#E47656" size={22} />
          </View>
          <Text style={styles.boxTitle}>Live Chat</Text>
          <Text style={styles.boxDesc}>Instant helper bot</Text>
        </TouchableOpacity>

        {/* Call Support */}
        <TouchableOpacity style={styles.gridBox} onPress={onCall} activeOpacity={0.7}>
          <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
            <Phone color="#0284C7" size={22} />
          </View>
          <Text style={styles.boxTitle}>Call Support</Text>
          <Text style={styles.boxDesc}>Talk to agent</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {/* Email support */}
        <TouchableOpacity style={styles.gridBox} onPress={onEmail} activeOpacity={0.7}>
          <View style={[styles.iconContainer, { backgroundColor: '#F5F3FF' }]}>
            <Mail color="#7C3AED" size={22} />
          </View>
          <Text style={styles.boxTitle}>Write Email</Text>
          <Text style={styles.boxDesc}>support@udofin.com</Text>
        </TouchableOpacity>

        {/* Raise complaint */}
        <TouchableOpacity style={styles.gridBox} onPress={onRaiseComplaint} activeOpacity={0.7}>
          <View style={[styles.iconContainer, { backgroundColor: '#FFF1F2' }]}>
            <FileWarning color="#E11D48" size={22} />
          </View>
          <Text style={styles.boxTitle}>Grievance Ticket</Text>
          <Text style={styles.boxDesc}>File a complaint</Text>
        </TouchableOpacity>
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
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.04)',
    elevation: 2,
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 16,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  gridBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  boxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  boxDesc: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
});
