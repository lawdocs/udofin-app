import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import Button from '../components/Button';
import { useLoanStore } from '../store/loanStore';
import { Shield, Phone, Mail, User, Trash2, Paperclip } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';

export default function RaiseComplaintScreen() {
  const router = useRouter();
  const { addComplaint } = useLoanStore();
  
  const [category, setCategory] = useState('Disbursal Issues');
  const [description, setDescription] = useState('');
  const [attaching, setAttaching] = useState(false);
  const [attachment, setAttachment] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const categories = ['Disbursal Issues', 'Repayment Setup', 'Auto-debit / eNACH', 'Technical Glitch', 'Charges Dispute'];

  const showAlert = (title: string, message: string, onPress?: () => void) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
      if (onPress) onPress();
    } else {
      Alert.alert(
        title,
        message,
        onPress ? [{ text: 'OK', onPress }] : undefined
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
      showAlert('Selection Failed', 'Could not open document picker.');
    } finally {
      setAttaching(false);
    }
  };

  const handleSubmit = () => {
    if (description.trim().length < 10) {
      showAlert('Details Required', 'Please provide a clear description of at least 10 characters.');
      return;
    }

    const tktId = addComplaint(
      category, 
      description, 
      attachment?.name || undefined, 
      attachment?.uri || undefined
    );
    
    showAlert(
      'Complaint Raised',
      `Your grievance ticket ${tktId} has been successfully created. We will update you shortly.`,
      () => router.back()
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Raise Complaint Ticket" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Nodal Officer info box */}
        <View style={styles.nodalBanner}>
          <Shield color="#E47656" size={20} />
          <View style={{ flex: 1 }}>
            <Text style={styles.nodalBannerTitle}>DESIGNATED GRIEVANCE DESK</Text>
            <Text style={styles.nodalBannerText}>
              In accordance with RBI directives, you can directly contact our Grievance Redressal Officer (GRO) for unresolved disputes. All complaints are tracked under a strict 30-day resolution SLA.
            </Text>
            
            <View style={styles.groDetails}>
              <View style={styles.groRow}>
                <User size={12} color="#4B5563" />
                <Text style={styles.groDetailText}>Officer: Mr. Ritesh Kumar</Text>
              </View>
              <View style={styles.groRow}>
                <Mail size={12} color="#4B5563" />
                <Text style={styles.groDetailText}>Email: grievance@udofin.com</Text>
              </View>
              <View style={styles.groRow}>
                <Phone size={12} color="#4B5563" />
                <Text style={styles.groDetailText}>Contact: +91 1800-120-3344</Text>
              </View>
            </View>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>SELECT GRIEVANCE CATEGORY</Text>
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

        <Text style={styles.sectionTitle}>COMPLAINT DETAILS</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Please explain the issue you are facing in detail (minimum 10 characters)..."
          multiline
          numberOfLines={6}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
          placeholderTextColor="#999"
        />

        <Text style={styles.sectionTitle}>ATTACHMENTS</Text>
        {attachment ? (
          <View style={styles.selectedAttachmentCard}>
            <Paperclip size={18} color="#E47656" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.attachmentName} numberOfLines={1}>
                {attachment.name}
              </Text>
              <Text style={styles.attachmentSize}>
                {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Size unknown'}
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
              {attaching ? 'Opening file manager...' : 'Tap to attach screenshots/documents'}
            </Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <Button title="Submit Complaint" onPress={handleSubmit} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
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
    borderColor: '#EAEAEA',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFA',
  },
  categoryCardSelected: {
    borderColor: '#E47656',
    backgroundColor: '#FFF5F2',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  categoryTextSelected: {
    color: '#E47656',
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: '#EAEAEA',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    height: 140,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 24,
  },
  attachmentBox: {
    height: 68,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    marginBottom: 30,
  },
  attachmentText: {
    color: '#E47656',
    fontWeight: '700',
    fontSize: 13,
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  nodalBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF9F7',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FFF0E8',
    marginBottom: 20,
    gap: 12,
  },
  nodalBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E47656',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  nodalBannerText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  groDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FFF0E8',
    gap: 6,
  },
  groRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groDetailText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '700',
  },
  selectedAttachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EAEAEA',
    padding: 16,
    marginBottom: 30,
  },
  attachmentName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  attachmentSize: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 2,
  },
  removeBtn: {
    padding: 4,
  },
});
