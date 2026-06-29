import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { Mail, Paperclip, Phone, Shield, Trash2, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Header from '../components/Header';
import { useTranslation } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { useLoanStore } from '../store/loanStore';

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
  const [attachment, setAttachment] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const showAlert = (title: string, message: string, onPress?: () => void) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
      if (onPress) onPress();
    } else {
      Alert.alert(
        title,
        message,
        onPress ? [{ text: t('OK'), onPress }] : undefined
      );
    }
  };

  const handlePickDocument = async () => {
    try {
      setAttaching(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAttachment(result.assets[0]);
      }
    } catch (error) {
      showAlert(t('Selection Failed'), t('Could not open document picker.'));
    } finally {
      setAttaching(false);
    }
  };

  const handleSubmit = () => {
    if (description.trim().length < 10) {
      showAlert(t('Details Required'), t('Please provide a clear description of at least 10 characters.'));
      return;
    }

    const tktId = addComplaint(
      category, 
      description, 
      attachment?.name || undefined, 
      attachment?.uri || undefined
    );
    
    showAlert(
      t('Complaint Raised'),
      t('Your grievance ticket {{id}} has been successfully created. We will update you shortly.').replace('{{id}}', tktId),
      () => router.back()
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t("Raise Complaint Ticket")} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Nodal Officer info box */}
        <View style={styles.nodalBanner}>
          <Shield color={colors.primary} size={20} />
          <View style={{ flex: 1 }}>
            <Text style={styles.nodalBannerTitle}>{t("DESIGNATED GRIEVANCE DESK")}</Text>
            <Text style={styles.nodalBannerText}>
              {t("In accordance with RBI directives, you can directly contact our Grievance Redressal Officer (GRO) for unresolved disputes. All complaints are tracked under a strict 30-day resolution SLA.")}
            </Text>
            
            <View style={styles.groDetails}>
              <View style={styles.groRow}>
                <User size={12} color={colors.textSecondary} />
                <Text style={styles.groDetailText}>{t("Officer: Mr. Ritesh Kumar")}</Text>
              </View>
              <View style={styles.groRow}>
                <Mail size={12} color={colors.textSecondary} />
                <Text style={styles.groDetailText}>{t("Email: grievance@udofin.com")}</Text>
              </View>
              <View style={styles.groRow}>
                <Phone size={12} color={colors.textSecondary} />
                <Text style={styles.groDetailText}>{t("Contact: +91 1800-120-3344")}</Text>
              </View>
            </View>
          </View>
        </View>
        
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
        {attachment ? (
          <View style={styles.selectedAttachmentCard}>
            <Paperclip size={18} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.attachmentName} numberOfLines={1}>
                {attachment.name}
              </Text>
              <Text style={styles.attachmentSize}>
                {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : t('Size unknown')}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => setAttachment(null)}
              style={styles.removeBtn}
            >
              <Trash2 size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.attachmentBox}
            onPress={handlePickDocument}
            activeOpacity={0.7}
            disabled={attaching}
          >
            <Text style={styles.attachmentText}>
              {attaching ? t('Opening file manager...') : t('Tap to attach screenshots/documents')}
            </Text>
          </TouchableOpacity>
        )}

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
  nodalBanner: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
    gap: 12,
  },
  nodalBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  nodalBannerText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  groDetails: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: 6,
  },
  groRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groDetailText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '700',
  },
  selectedAttachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    padding: 16,
    marginBottom: 30,
  },
  attachmentName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  attachmentSize: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  removeBtn: {
    padding: 4,
  },
});
