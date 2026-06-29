import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import Header from '../../components/Header';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

// Questions for the credit score estimator quiz
const QUESTIONS = [
  {
    id: 'payment_history',
    question: 'How consistent have you been with loan/credit card payments?',
    options: [
      { label: 'Always on time', points: 35 },
      { label: 'Missed 1-2 payments', points: 20 },
      { label: 'Frequently late', points: 5 },
      { label: 'Defaulted on loans', points: 0 },
    ],
  },
  {
    id: 'credit_utilization',
    question: 'What % of your credit card limit do you typically use?',
    options: [
      { label: 'Below 30%', points: 30 },
      { label: '30–50%', points: 20 },
      { label: '50–75%', points: 10 },
      { label: 'Above 75%', points: 2 },
    ],
  },
  {
    id: 'credit_age',
    question: 'How long have you had credit accounts?',
    options: [
      { label: 'More than 5 years', points: 15 },
      { label: '2–5 years', points: 10 },
      { label: '6 months – 2 years', points: 5 },
      { label: 'Just started', points: 1 },
    ],
  },
  {
    id: 'credit_mix',
    question: 'What types of credit do you have?',
    options: [
      { label: 'Home loan + personal loan + credit card', points: 10 },
      { label: 'Personal loan + credit card', points: 7 },
      { label: 'Only credit card', points: 4 },
      { label: 'None', points: 0 },
    ],
  },
  {
    id: 'new_credit',
    question: 'How many new credit applications in the last 6 months?',
    options: [
      { label: 'None', points: 10 },
      { label: '1–2', points: 7 },
      { label: '3–4', points: 3 },
      { label: '5 or more', points: 0 },
    ],
  },
];

// Max possible = 35+30+15+10+10 = 100 points → scaled to 300–900 range
function estimateScore(totalPoints: number): number {
  const score = 300 + Math.round((totalPoints / 100) * 600);
  return Math.min(900, Math.max(300, score));
}

function scoreColor(score: number, colors: any): string {
  if (score >= 750) return '#10B981'; // green
  if (score >= 650) return '#F59E0B'; // amber
  return colors.danger; // red
}

function scoreLabel(score: number): string {
  if (score >= 750) return 'EXCELLENT';
  if (score >= 700) return 'GOOD';
  if (score >= 650) return 'FAIR';
  return 'POOR';
}

export default function CreditScoreEstimatorScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  // answers: questionId → points selected
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const totalPoints = Object.values(answers).reduce((a, b) => a + b, 0);
  const estimatedScore = estimateScore(totalPoints);
  const allAnswered = Object.keys(answers).length === QUESTIONS.length;

  const reset = () => { setAnswers({}); setSubmitted(false); };

  if (submitted) {
    const color = scoreColor(estimatedScore, colors);
    const label = scoreLabel(estimatedScore);
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={t('Credit Score Estimator')} />
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.scoreCard}>
            <Star color={color} size={32} />
            <Text style={styles.scoreLabel}>{t('YOUR ESTIMATED SCORE')}</Text>
            <Text style={[styles.scoreValue, { color }]}>{estimatedScore}</Text>
            <Text style={[styles.scoreBadge, { backgroundColor: color + '20', color }]}>{label}</Text>

            {/* Score range bar */}
            <View style={styles.rangeBar}>
              <View style={[styles.rangeFill, {
                width: `${Math.round(((estimatedScore - 300) / 600) * 100)}%` as any,
                backgroundColor: color,
              }]} />
            </View>
            <View style={styles.rangeLabelRow}>
              <Text style={styles.rangeTick}>300</Text>
              <Text style={styles.rangeTick}>550</Text>
              <Text style={styles.rangeTick}>700</Text>
              <Text style={styles.rangeTick}>900</Text>
            </View>
          </View>

          {/* Lender eligibility */}
          <View style={styles.eligibilityCard}>
            <Text style={styles.eligibilityTitle}>{t('LENDER ELIGIBILITY OUTLOOK')}</Text>
            {[
              { threshold: 750, label: t('Premium banks (HDFC, ICICI, SBI)'), eligible: estimatedScore >= 750 },
              { threshold: 700, label: t('NBFCs and co-operative banks'), eligible: estimatedScore >= 700 },
              { threshold: 650, label: t('Digital lenders and fintechs'), eligible: estimatedScore >= 650 },
              { threshold: 0, label: t('Secured loans only (against collateral)'), eligible: estimatedScore >= 300 },
            ].map((item, i) => (
              <View key={i} style={styles.eligRow}>
                {item.eligible
                  ? <CheckCircle2 color="#10B981" size={16} />
                  : <AlertCircle color={colors.textMuted} size={16} />}
                <Text style={[styles.eligText, !item.eligible && { color: colors.textMuted }]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.retakeBtn} onPress={reset} activeOpacity={0.8}>
            <Text style={styles.retakeBtnText}>{t('Retake Quiz')}</Text>
          </TouchableOpacity>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              {t('This is an estimate only, not your actual CIBIL or Experian score. Apply on Udofin to get your real bureau score checked (soft pull — no credit score impact).')}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t('Credit Score Estimator')} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.introCard}>
          <Star color={colors.primary} size={24} />
          <Text style={styles.introTitle}>{t('Estimate Your Credit Score')}</Text>
          <Text style={styles.introDesc}>
            {t('Answer 5 quick questions to get an estimated CIBIL score range. No bureau pull.')}
          </Text>
        </View>

        {QUESTIONS.map((q, qi) => (
          <View key={q.id} style={styles.questionCard}>
            <Text style={styles.questionNum}>{t('Q{{n}}').replace('{{n}}', String(qi + 1))}</Text>
            <Text style={styles.questionText}>{t(q.question)}</Text>
            <View style={styles.optionsList}>
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === opt.points;
                return (
                  <TouchableOpacity
                    key={oi}
                    style={[styles.option, selected && styles.optionSelected]}
                    onPress={() => setAnswers(prev => ({ ...prev, [q.id]: opt.points }))}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.optionDot, selected && styles.optionDotSelected]} />
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {t(opt.label)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitBtn, !allAnswered && styles.submitBtnDisabled]}
          onPress={() => allAnswered && setSubmitted(true)}
          activeOpacity={0.9}
        >
          <Text style={styles.submitBtnText}>{t('Estimate My Score')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 40 },

  // Quiz intro
  introCard: {
    backgroundColor: colors.primaryLight, borderRadius: 20, padding: 20,
    alignItems: 'center', marginBottom: 20, gap: 8,
  },
  introTitle: { fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center' },
  introDesc: { fontSize: 13, color: colors.primary, fontWeight: '600', textAlign: 'center', lineHeight: 18 },

  // Questions
  questionCard: {
    backgroundColor: colors.surface, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: colors.surfaceBorder, marginBottom: 16,
  },
  questionNum: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 1, marginBottom: 6 },
  questionText: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 16, lineHeight: 22 },
  optionsList: { gap: 10 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: colors.surfaceBorder,
    backgroundColor: colors.background,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  optionDot: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 2, borderColor: colors.surfaceBorder, backgroundColor: 'transparent',
  },
  optionDotSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  optionText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, flex: 1 },
  optionTextSelected: { color: colors.primary, fontWeight: '700' },

  submitBtn: {
    backgroundColor: colors.primary, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Result
  scoreCard: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 28,
    alignItems: 'center', borderWidth: 1, borderColor: colors.surfaceBorder, marginBottom: 20,
  },
  scoreLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5, marginTop: 12, marginBottom: 6 },
  scoreValue: { fontSize: 64, fontWeight: '900', marginBottom: 8 },
  scoreBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20, fontSize: 12, fontWeight: '800', marginBottom: 20 },
  rangeBar: { width: '100%', height: 8, backgroundColor: colors.background, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  rangeFill: { height: 8, borderRadius: 4 },
  rangeLabelRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  rangeTick: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },

  eligibilityCard: {
    backgroundColor: colors.surface, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: colors.surfaceBorder, marginBottom: 16,
  },
  eligibilityTitle: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 14 },
  eligRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  eligText: { fontSize: 13, fontWeight: '600', color: colors.text, flex: 1 },

  retakeBtn: {
    borderWidth: 1.5, borderColor: colors.primary, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginBottom: 16,
  },
  retakeBtnText: { color: colors.primary, fontSize: 14, fontWeight: '700' },

  disclaimer: { backgroundColor: colors.background, borderRadius: 12, padding: 14 },
  disclaimerText: { fontSize: 11, color: colors.textMuted, lineHeight: 16, fontWeight: '500', textAlign: 'center' },
});
