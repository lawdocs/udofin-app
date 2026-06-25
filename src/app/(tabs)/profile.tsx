import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import { User, Shield, Settings, FileText, HeartHandshake, LogOut, ChevronRight } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useLoanStore } from '../../store/loanStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { clearState: clearOnboarding, email, mobileNumber } = useOnboardingStore();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearOnboarding();
    router.replace('/');
  };

  const displayName = email ? email.split('@')[0] : 'Borrower';
  const displayPhone = mobileNumber ? `+91 ${mobileNumber}` : '+91 XXXXX XXXXX';
  const displayEmail = email || 'not_configured@udofin.com';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Profile" showBack={false} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card Header */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 36 }}>👨🏻‍🦱</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.phone}>{displayPhone}</Text>
          <Text style={styles.email}>{displayEmail}</Text>
        </View>

        {/* Action List */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuSectionTitle}>ACCOUNT MANAGEMENT</Text>
          
          <MenuItem 
            icon={<User color="#E47656" size={20} />} 
            title="Personal & Employment Details" 
            onPress={() => router.push('/edit-profile' as any)} 
          />

          <MenuItem 
            icon={<FileText color="#E47656" size={20} />} 
            title="My Documents Vault" 
            onPress={() => router.push('/documents' as any)} 
          />

          <MenuItem 
            icon={<Shield color="#E47656" size={20} />} 
            title="Privacy & Consent Dashboard" 
            onPress={() => router.push('/privacy-consent' as any)} 
          />
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.menuSectionTitle}>PREFERENCES & HELP</Text>
          
          <MenuItem 
            icon={<Settings color="#E47656" size={20} />} 
            title="App Settings" 
            onPress={() => router.push('/settings' as any)} 
          />

          <MenuItem 
            icon={<HeartHandshake color="#E47656" size={20} />} 
            title="Support & Raise Complaints" 
            onPress={() => router.push('/support' as any)} 
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut color="#DC2626" size={20} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// Sub components
function MenuItem({ icon, title, onPress }: { icon: React.ReactNode; title: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuLeft}>
        <View style={styles.menuIconWrapper}>{icon}</View>
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      <ChevronRight color="#C7C7CC" size={18} />
    </TouchableOpacity>
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
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FBECE8',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  phone: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 20,
  },
  menuSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF1F1',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: 8,
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 15,
  },
});
