import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Phone, Globe, Landmark, Shield } from 'lucide-react-native';
import Header from '../components/Header';
import { useTheme } from '../lib/theme';
import { useTranslation } from '../lib/i18n';

const STATS = [
  { value: '10+', label: 'Partner Lenders' },
  { value: '₹500Cr+', label: 'Loans Facilitated' },
  { value: '50K+', label: 'Happy Borrowers' },
  { value: '4.8★', label: 'App Rating' },
];

const PILLARS = [
  { icon: Shield, title: 'RBI Compliant', desc: 'All lender partners are RBI-registered NBFCs or scheduled banks.' },
  { icon: Landmark, title: 'DPDP Act 2023', desc: 'Your data rights are protected under India\'s new data protection law.' },
  { icon: Globe, title: 'Transparent Pricing', desc: 'Zero hidden charges — full cost disclosed before you sign.' },
];

export default function AboutScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t('About Udofin')} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{t('Connecting India with\nTrusted Lenders')}</Text>
          <Text style={styles.heroDesc}>
            {t('Udofin is a RBI-compliant digital lending marketplace that matches borrowers with regulated banks and NBFCs — transparently, fairly, and quickly.')}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {STATS.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{t(s.label)}</Text>
            </View>
          ))}
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('OUR MISSION')}</Text>
          <Text style={styles.bodyText}>
            {t('To democratize access to affordable credit for every Indian — salaried, self-employed, or MSME owner — through a transparent, digital-first, and borrower-friendly process.')}
          </Text>
        </View>

        {/* Trust Pillars */}
        <Text style={styles.pillarsTitle}>{t('BUILT ON TRUST')}</Text>
        {PILLARS.map((p, i) => {
          const Icon = p.icon;
          return (
            <View key={i} style={styles.pillarCard}>
              <View style={styles.pillarIcon}>
                <Icon color={colors.primary} size={22} />
              </View>
              <View style={styles.pillarBody}>
                <Text style={styles.pillarTitle}>{t(p.title)}</Text>
                <Text style={styles.pillarDesc}>{t(p.desc)}</Text>
              </View>
            </View>
          );
        })}

        {/* Contact */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>{t('CONTACT US')}</Text>
          {[
            { icon: Mail, label: 'support@udofin.com', action: () => Linking.openURL('mailto:support@udofin.com') },
            { icon: Phone, label: '+91 1800-120-3344', action: () => Linking.openURL('tel:+911800120334') },
            { icon: Globe, label: 'www.udofin.com', action: () => Linking.openURL('https://udofin.com') },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <TouchableOpacity key={i} style={styles.contactRow} onPress={c.action} activeOpacity={0.7}>
                <View style={styles.contactIconBox}>
                  <Icon color={colors.primary} size={16} />
                </View>
                <Text style={styles.contactLabel}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.version}>{t('Udofin App v1.0.0 · Made in India 🇮🇳')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  heroCard: {
    backgroundColor: colors.primary, borderRadius: 24, padding: 24, marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24, fontWeight: '900', color: '#FFFFFF', marginBottom: 10, lineHeight: 32,
  },
  heroDesc: { fontSize: 13, color: '#FFFFFFCC', fontWeight: '500', lineHeight: 20 },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24,
  },
  statCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.surfaceBorder,
    flex: 1, minWidth: '40%', alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '900', color: colors.primary, marginBottom: 4 },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600', textAlign: 'center' },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 11, fontWeight: '800', color: colors.textMuted,
    letterSpacing: 1.5, marginBottom: 10,
  },
  bodyText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, fontWeight: '500' },
  pillarsTitle: {
    fontSize: 11, fontWeight: '800', color: colors.textMuted,
    letterSpacing: 1.5, marginBottom: 14,
  },
  pillarCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.surfaceBorder, marginBottom: 12,
  },
  pillarIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  pillarBody: { flex: 1 },
  pillarTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 4 },
  pillarDesc: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', lineHeight: 17 },
  contactCard: {
    backgroundColor: colors.surface, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: colors.surfaceBorder, marginTop: 8, marginBottom: 20,
  },
  contactTitle: {
    fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 14,
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  contactIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  contactLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
  version: { fontSize: 11, color: colors.textMuted, textAlign: 'center', fontWeight: '600' },
});
