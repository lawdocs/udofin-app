import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { CreditCard, Download, RefreshCw, FileText, Check, ArrowUpRight, Wallet } from 'lucide-react-native';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>WELCOME BACK</Text>
            <View style={styles.nameRow}>
              <Text style={styles.nameText}>Mohit K.</Text>
              <View style={styles.onlineDot} />
            </View>
          </View>
          <View style={styles.avatarContainer}>
            {/* Using a placeholder view for the avatar, you can replace with an actual Image later */}
            <View style={styles.avatarPlaceholder}>
              <Text style={{fontSize: 24}}>👨🏻‍🦱</Text>
            </View>
          </View>
        </View>

        {/* Credit Card Container */}
        <View style={styles.cardWrapper}>
          <View style={styles.flipBadge}>
            <View style={styles.flipBadgeInner} />
            <Text style={styles.flipText}>Click to flip</Text>
          </View>
          
          <TouchableOpacity activeOpacity={0.9} style={styles.creditCard}>
            <View style={styles.cardTopRow}>
              <View style={styles.chipIcon}>
                <View style={styles.chipLineHorizontal} />
                <View style={styles.chipLineVertical} />
              </View>
              <CreditCard color="#999" size={24} />
            </View>
            
            <View style={styles.cardBottom}>
              <Text style={styles.cardLabel}>AVAILABLE CREDIT</Text>
              <Text style={styles.cardAmount}>₹1,50,000</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <ActionItem icon={<Wallet color="#E47656" size={24} />} label="Pay EMI" />
          <ActionItem icon={<Download color="#E47656" size={24} />} label="Withdraw" />
          <ActionItem icon={<RefreshCw color="#E47656" size={24} />} label="Auto-Pay" />
          <ActionItem icon={<FileText color="#E47656" size={24} />} label="Statements" />
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.activityTitle}>RECENT ACTIVITY</Text>
          
          <ActivityItem 
            icon={<Check color="#059669" size={20} />} 
            iconBg="#D1FAE5"
            title="EMI Paid"
            subtitle="Today, 09:00 AM"
            amount="-₹12,500"
            amountColor="#111827"
          />
          
          <ActivityItem 
            icon={<ArrowUpRight color="#2563EB" size={20} />} 
            iconBg="#DBEAFE"
            title="Loan Disbursed"
            subtitle="1st June"
            amount="+₹1,50,000"
            amountColor="#059669"
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-components
function ActionItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
      <View style={styles.actionCircle}>
        {icon}
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function ActivityItem({ icon, iconBg, title, subtitle, amount, amountColor }: any) {
  return (
    <View style={styles.activityItem}>
      <View style={styles.activityLeft}>
        <View style={[styles.activityIconCircle, { backgroundColor: iconBg }]}>
          {icon}
        </View>
        <View style={styles.activityTextContainer}>
          <Text style={styles.activityItemTitle}>{title}</Text>
          <Text style={styles.activityItemSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Text style={[styles.activityAmount, { color: amountColor }]}>{amount}</Text>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEF8F4',
    height: Platform.OS === 'web' ? '100vh' : '100%',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 12,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E47656',
    marginLeft: 8,
    marginTop: 4,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDECE4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F9D8C9',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Credit Card
  cardWrapper: {
    position: 'relative',
    marginBottom: 40,
  },
  flipBadge: {
    position: 'absolute',
    top: -16,
    right: 16,
    backgroundColor: '#E47656',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
    shadowColor: '#E47656',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  flipBadgeInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
    marginRight: 6,
  },
  flipText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  creditCard: {
    backgroundColor: '#2A2522',
    borderRadius: 24,
    padding: 24,
    height: 200,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chipIcon: {
    width: 40,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#555',
    overflow: 'hidden',
    position: 'relative',
  },
  chipLineHorizontal: {
    position: 'absolute',
    top: 13,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#555',
  },
  chipLineVertical: {
    position: 'absolute',
    left: 19,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#555',
  },
  cardBottom: {
    marginTop: 'auto',
  },
  cardLabel: {
    color: '#999',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
  },
  cardAmount: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: -1,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 48,
  },
  actionItem: {
    alignItems: 'center',
    width: '23%',
  },
  actionCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#E47656',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FFF0E8',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A08A83',
    textAlign: 'center',
  },

  // Activity
  activityContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityTextContainer: {},
  activityItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  activityItemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
