import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import Button from '../components/Button';
import { useLoanStore } from '../store/loanStore';

export default function RaiseComplaintScreen() {
  const router = useRouter();
  const { addComplaint } = useLoanStore();
  
  const [category, setCategory] = useState('Disbursal Issues');
  const [description, setDescription] = useState('');
  const [attaching, setAttaching] = useState(false);

  const categories = ['Disbursal Issues', 'Repayment Setup', 'Auto-debit / eNACH', 'Technical Glitch', 'Charges Dispute'];

  const handleSubmit = () => {
    if (description.trim().length < 10) {
      Alert.alert('Details Required', 'Please provide a clear description of at least 10 characters.');
      return;
    }

    const tktId = addComplaint(category, description);
    
    Alert.alert(
      'Complaint Raised',
      `Your grievance ticket ${tktId} has been successfully created. We will update you shortly.`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Raise Complaint Ticket" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
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
        <TouchableOpacity
          style={styles.attachmentBox}
          onPress={() => {
            setAttaching(true);
            setTimeout(() => {
              setAttaching(false);
              Alert.alert('Attachment Mocked', 'Document attached successfully.');
            }, 1000);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.attachmentText}>
            {attaching ? 'Opening file manager...' : 'Tap to attach screenshots/documents'}
          </Text>
        </TouchableOpacity>

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
});
