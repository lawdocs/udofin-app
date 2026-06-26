import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import Button from '../components/Button';
import { useLoanStore } from '../store/loanStore';
import { useTheme } from '../lib/theme';
import { useTranslation } from '../lib/i18n';

export default function RaiseComplaintScreen() {
  const router = useRouter();
  const { addComplaint } = useLoanStore();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  
  const categories = [
    t('Disbursal Issues'),
    t('Repayment Setup'),
    t('Auto-debit / eNACH'),
    t('Technical Glitch'),
    t('Charges Dispute')
  ];
  
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState('');
  const [attaching, setAttaching] = useState(false);

  const handleSubmit = () => {
    if (description.trim().length < 10) {
      Alert.alert(t('Details Required'), t('Please provide a clear description of at least 10 characters.'));
      return;
    }

    const tktId = addComplaint(category, description);
    
    Alert.alert(
      t('Complaint Raised'),
      t('Your grievance ticket {{id}} has been successfully created. We will update you shortly.').replace('{{id}}', tktId),
      [
        {
          text: t('OK'),
          onPress: () => router.back(),
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t("Raise Complaint Ticket")} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <Text style={styles.sectionTitle}>{t("SELECT GRIEVANCE CATEGORY")}</Text>
        <View style={styles.optionsList}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryCard,
                category === cat && styles.categoryCardSelected
              ]}
              onPress={() => setCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.categoryText,
                category === cat && styles.categoryTextSelected
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t("COMPLAINT DETAILS")}</Text>
        <TextInput
          style={styles.textArea}
          placeholder={t("Please explain the issue you are facing in detail (minimum 10 characters)...")}
          multiline
          numberOfLines={6}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
          placeholderTextColor="#999"
        />

        <Text style={styles.sectionTitle}>{t("ATTACHMENTS")}</Text>
        <TouchableOpacity
          style={styles.attachmentBox}
          onPress={() => {
            setAttaching(true);
            setTimeout(() => {
              setAttaching(false);
              Alert.alert(t('Attachment Mocked'), t('Document attached successfully.'));
            }, 1000);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.attachmentText}>
            {attaching ? t('Opening file manager...') : t('Tap to attach screenshots/documents')}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      <View style={styles.footer}>
        <Button title={t("Submit Complaint")} onPress={handleSubmit} />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 8,
  },
  optionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  categoryCard: {
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
  },
  categoryCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  categoryTextSelected: {
    color: colors.primary,
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    height: 140,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 24,
  },
  attachmentBox: {
    height: 68,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginBottom: 30,
  },
  attachmentText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  footer: {
    padding: 24,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
