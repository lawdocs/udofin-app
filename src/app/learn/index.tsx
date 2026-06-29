import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, TrendingUp, Landmark, PenLine, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

// Learn categories — dummy content using slug-based routing
const CATEGORIES = [
  {
    slug: 'credit-score',
    title: 'Credit Score',
    desc: 'What is a CIBIL score, how it is calculated, and how to improve it.',
    icon: Star,
    color: '#6366F1',
    readTime: '5 min read',
  },
  {
    slug: 'loan-guides',
    title: 'Loan Guides',
    desc: 'Step-by-step guides for personal, home, vehicle, and gold loans.',
    icon: BookOpen,
    color: '#E47656',
    readTime: '8 min read',
  },
  {
    slug: 'financial-planning',
    title: 'Financial Planning',
    desc: 'Budgeting, debt management, and building a financial safety net.',
    icon: TrendingUp,
    color: '#10B981',
    readTime: '6 min read',
  },
  {
    slug: 'rbi-updates',
    title: 'RBI Updates',
    desc: 'Latest regulatory changes affecting borrowers and digital lending.',
    icon: Landmark,
    color: '#F59E0B',
    readTime: '4 min read',
  },
  {
    slug: 'blog',
    title: 'Blog',
    desc: 'Practical tips, industry news, and borrower success stories.',
    icon: PenLine,
    color: '#3B82F6',
    readTime: 'Various',
  },
];

export default function LearnHubScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t('Learn & Finance')} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.subtitle}>
          {t('Master money concepts, understand loans, and make smarter financial decisions.')}
        </Text>

        {/* Featured banner */}
        <TouchableOpacity
          style={styles.featured}
          onPress={() => router.push('/learn/credit-score' as any)}
          activeOpacity={0.88}
        >
          <Star color="#FFFFFF" size={20} />
          <View style={styles.featuredBody}>
            <Text style={styles.featuredTag}>{t('FEATURED')}</Text>
            <Text style={styles.featuredTitle}>{t('How to improve your CIBIL score')}</Text>
            <Text style={styles.featuredDesc}>{t('The most important factor for your loan approval')}</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>{t('BROWSE TOPICS')}</Text>

        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <TouchableOpacity
              key={cat.slug}
              style={styles.card}
              onPress={() => router.push(`/learn/${cat.slug}` as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.iconBox, { backgroundColor: cat.color + '18' }]}>
                <Icon color={cat.color} size={26} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{t(cat.title)}</Text>
                <Text style={styles.cardDesc}>{t(cat.desc)}</Text>
                <Text style={[styles.readTime, { color: cat.color }]}>{cat.readTime}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  subtitle: {
    fontSize: 13, color: colors.textSecondary, fontWeight: '500', lineHeight: 18, marginBottom: 20,
  },
  featured: {
    backgroundColor: colors.primary, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 24,
  },
  featuredBody: { flex: 1 },
  featuredTag: { fontSize: 10, fontWeight: '800', color: '#FFFFFF99', letterSpacing: 1.5, marginBottom: 4 },
  featuredTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 4, lineHeight: 22 },
  featuredDesc: { fontSize: 12, color: '#FFFFFFCC', fontWeight: '500' },
  sectionTitle: {
    fontSize: 11, fontWeight: '800', color: colors.textMuted,
    letterSpacing: 1.5, marginBottom: 14,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: colors.surfaceBorder,
    flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 12,
  },
  iconBox: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 4 },
  cardDesc: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', lineHeight: 16, marginBottom: 6 },
  readTime: { fontSize: 11, fontWeight: '700' },
});
