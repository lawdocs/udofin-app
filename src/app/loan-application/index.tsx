import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as z from 'zod';
import Button from '../../components/Button';
import Header from '../../components/Header';
import ProgressStepper from '../../components/ProgressStepper';
import { useTranslation } from '../../lib/i18n';
import { useLoanStore } from '../../store/loanStore';

// Define schemas for validation using Zod
export interface LoanTypeConfig {
  minAmount: number;
  maxAmount: number;
  minTenure: number;
  maxTenure: number;
  stepAmount: number;
  stepTenure: number;
}

export const loanTypeConfigs: Record<string, LoanTypeConfig> = {
  'Personal Loan': { minAmount: 10000, maxAmount: 500000, minTenure: 6, maxTenure: 60, stepAmount: 10000, stepTenure: 3 },
  'Business Loan': { minAmount: 100000, maxAmount: 5000000, minTenure: 12, maxTenure: 60, stepAmount: 50000, stepTenure: 6 },
  'Home Loan': { minAmount: 1000000, maxAmount: 50000000, minTenure: 60, maxTenure: 240, stepAmount: 100000, stepTenure: 12 },
  'Gold Loan': { minAmount: 10000, maxAmount: 1000000, minTenure: 3, maxTenure: 24, stepAmount: 5000, stepTenure: 3 },
  'New Vehicle Loan': { minAmount: 100000, maxAmount: 1500000, minTenure: 12, maxTenure: 84, stepAmount: 25000, stepTenure: 12 },
  'Used Vehicle Loan': { minAmount: 50000, maxAmount: 800000, minTenure: 12, maxTenure: 60, stepAmount: 10000, stepTenure: 6 },
  'Education Loan': { minAmount: 50000, maxAmount: 2000000, minTenure: 12, maxTenure: 84, stepAmount: 25000, stepTenure: 6 },
  'MSME Loan': { minAmount: 200000, maxAmount: 5000000, minTenure: 12, maxTenure: 60, stepAmount: 50000, stepTenure: 6 },
  'Loan Against Property (LAP)': { minAmount: 500000, maxAmount: 5000000, minTenure: 12, maxTenure: 84, stepAmount: 50000, stepTenure: 12 },
  'Plot Loan': { minAmount: 300000, maxAmount: 3000000, minTenure: 12, maxTenure: 84, stepAmount: 50000, stepTenure: 12 },
  'Consumer Durable Loan': { minAmount: 5000, maxAmount: 150000, minTenure: 3, maxTenure: 24, stepAmount: 2500, stepTenure: 3 },
};

// Define schemas for validation using Zod
const loanFormSchema = z.object({
  loanType: z.string().min(1, 'Please select a loan type'),
  amount: z.number().min(5000, 'Minimum amount is ₹5,000'),
  tenure: z.number().min(3, 'Minimum tenure is 3 months'),
  employmentType: z.string().min(1, 'Please select employment type'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  designation: z.string().min(2, 'Designation must be at least 2 characters'),
  experience: z.string().min(1, 'Please enter experience'),
  monthlySalary: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 10000, {
    message: 'Monthly salary must be at least ₹10,000',
  }),
  addressLine1: z.string().min(5, 'Address line 1 must be at least 5 characters'),
  addressLine2: z.string().optional(),
  pincode: z.string().length(6, 'Pincode must be exactly 6 digits'),
  city: z.string().min(2, 'City name is too short'),
  state: z.string().min(2, 'State name is too short'),
}).superRefine((data, ctx) => {
  const config = loanTypeConfigs[data.loanType];
  if (config) {
    if (data.amount < config.minAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['amount'],
        message: `Minimum amount for ${data.loanType} is ₹${config.minAmount.toLocaleString('en-IN')}`,
      });
    }
    if (data.amount > config.maxAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['amount'],
        message: `Maximum amount for ${data.loanType} is ₹${config.maxAmount.toLocaleString('en-IN')}`,
      });
    }
    if (data.tenure < config.minTenure) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tenure'],
        message: `Minimum tenure for ${data.loanType} is ${config.minTenure} months`,
      });
    }
    if (data.tenure > config.maxTenure) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tenure'],
        message: `Maximum tenure for ${data.loanType} is ${config.maxTenure} months`,
      });
    }
  }
});

type LoanFormData = z.infer<typeof loanFormSchema>;

export default function LoanApplicationWizard() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);
  const { t } = useTranslation();
  const { draftApplication, setDraftApplication, addApplication, clearDraftApplication } = useLoanStore();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: draftApplication,
    mode: 'onBlur',
  });

  const stepLabels = [
    'Loan Category',
    'Limit & Tenure',
    'Employment Info',
    'Income Details',
    'Address Info',
    'Confirm Details',
  ];

  const loanTypes = Object.keys(loanTypeConfigs);
  const employmentTypes = ['Salaried', 'Self-Employed', 'Freelancer', 'Business Owner'];

  const selectedLoanType = watch('loanType');
  const selectedAmount = watch('amount');
  const selectedTenure = watch('tenure');
  const selectedEmploymentType = watch('employmentType');

  const onNextStep = async () => {
    let isValid = false;
    if (activeStep === 1) {
      isValid = await trigger('loanType');
      if (isValid) {
        const config = loanTypeConfigs[selectedLoanType];
        if (config) {
          if (selectedAmount < config.minAmount || selectedAmount > config.maxAmount) {
            setValue('amount', config.minAmount);
          }
          if (selectedTenure < config.minTenure || selectedTenure > config.maxTenure) {
            setValue('tenure', config.minTenure);
          }
        }
      }
    } else if (activeStep === 2) {
      isValid = await trigger(['amount', 'tenure']);
    } else if (activeStep === 3) {
      isValid = await trigger(['employmentType', 'companyName', 'designation', 'experience']);
    } else if (activeStep === 4) {
      isValid = await trigger('monthlySalary');
    } else if (activeStep === 5) {
      isValid = await trigger(['addressLine1', 'pincode', 'city', 'state']);
    }

    if (isValid) {
      // Save draft state to Zustand
      const currentValues = watch();
      setDraftApplication(currentValues);
      setActiveStep(activeStep + 1);
    }
  };

  const onPrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    } else {
      router.back();
    }
  };

  const onSubmitForm = (data: LoanFormData) => {
    // Add application to store
    const appId = addApplication({
      loanType: data.loanType,
      amount: data.amount,
      tenure: data.tenure,
    });
    
    clearDraftApplication();
    
    Alert.alert(
      'Application Submitted',
      `Your loan request ${appId} has been successfully submitted!`,
      [
        {
          text: 'View Status',
          onPress: () => router.replace(`/application/${appId}` as any),
        },
      ]
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1: {
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Select Loan Type</Text>
            <Text style={styles.stepDesc}>What type of credit access do you need?</Text>
            
            <View style={styles.optionsGrid}>
              {loanTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionCard,
                    selectedLoanType === type && styles.optionCardSelected,
                  ]}
                  onPress={() => setValue('loanType', type)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedLoanType === type && styles.optionTextSelected,
                    ]}
                  >
                    {t(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.loanType && <Text style={styles.errorText}>{errors.loanType.message}</Text>}
          </View>
        );
      }
      case 2: {
        const currentConfig = loanTypeConfigs[selectedLoanType] || {
          minAmount: 10000,
          maxAmount: 500000,
          minTenure: 6,
          maxTenure: 60,
          stepAmount: 10000,
          stepTenure: 3,
        };
        
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Configure Loan Amount</Text>
            <Text style={styles.stepDesc}>Adjust parameters to match your repayment comfort.</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>DESIRED AMOUNT (₹)</Text>
              <View style={styles.incrementContainer}>
                <TouchableOpacity 
                  style={styles.incrementBtn} 
                  onPress={() => setValue('amount', Math.max(currentConfig.minAmount, selectedAmount - currentConfig.stepAmount))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.incrementBtnText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.textInput, { flex: 1, textAlign: 'center', marginHorizontal: 12 }]}
                  keyboardType="numeric"
                  value={String(selectedAmount)}
                  onChangeText={(val) => {
                    const num = Number(val.replace(/[^0-9]/g, ''));
                    setValue('amount', Math.min(currentConfig.maxAmount, Math.max(0, num)));
                  }}
                />
                <TouchableOpacity 
                  style={styles.incrementBtn} 
                  onPress={() => setValue('amount', Math.min(currentConfig.maxAmount, selectedAmount + currentConfig.stepAmount))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.incrementBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sliderLimitRow}>
                <Text style={styles.limitLabel}>Min: ₹{currentConfig.minAmount.toLocaleString('en-IN')}</Text>
                <Text style={styles.limitLabel}>Max: ₹{currentConfig.maxAmount.toLocaleString('en-IN')}</Text>
              </View>
              {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>REPAYMENT TENURE (MONTHS)</Text>
              <View style={styles.incrementContainer}>
                <TouchableOpacity 
                  style={styles.incrementBtn} 
                  onPress={() => setValue('tenure', Math.max(currentConfig.minTenure, selectedTenure - currentConfig.stepTenure))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.incrementBtnText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.textInput, { flex: 1, textAlign: 'center', marginHorizontal: 12 }]}
                  keyboardType="numeric"
                  value={String(selectedTenure)}
                  onChangeText={(val) => {
                    const num = Number(val.replace(/[^0-9]/g, ''));
                    setValue('tenure', Math.min(currentConfig.maxTenure, Math.max(0, num)));
                  }}
                />
                <TouchableOpacity 
                  style={styles.incrementBtn} 
                  onPress={() => setValue('tenure', Math.min(currentConfig.maxTenure, selectedTenure + currentConfig.stepTenure))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.incrementBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sliderLimitRow}>
                <Text style={styles.limitLabel}>Min: {currentConfig.minTenure} Months</Text>
                <Text style={styles.limitLabel}>Max: {currentConfig.maxTenure} Months</Text>
              </View>
              {errors.tenure && <Text style={styles.errorText}>{errors.tenure.message}</Text>}
            </View>
          </View>
        );
      }

      case 3: {
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Employment Details</Text>
            <Text style={styles.stepDesc}>Please tell us about your current job profile.</Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>EMPLOYMENT TYPE</Text>
              <View style={styles.horizontalPills}>
                {employmentTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.pill,
                      selectedEmploymentType === type && styles.pillSelected,
                    ]}
                    onPress={() => setValue('employmentType', type)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        selectedEmploymentType === type && styles.pillTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.employmentType && <Text style={styles.errorText}>{errors.employmentType.message}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>COMPANY NAME</Text>
              <Controller
                control={control}
                name="companyName"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Google India"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor="#999"
                  />
                )}
              />
              {errors.companyName && <Text style={styles.errorText}>{errors.companyName.message}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>DESIGNATION</Text>
              <Controller
                control={control}
                name="designation"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Software Engineer"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor="#999"
                  />
                )}
              />
              {errors.designation && <Text style={styles.errorText}>{errors.designation.message}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>WORK EXPERIENCE (YEARS)</Text>
              <Controller
                control={control}
                name="experience"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 4"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor="#999"
                  />
                )}
              />
              {errors.experience && <Text style={styles.errorText}>{errors.experience.message}</Text>}
            </View>
          </View>
        );
      }

      case 4: {
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Income Parameters</Text>
            <Text style={styles.stepDesc}>State your verified net monthly cash inflow.</Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>NET MONTHLY SALARY (₹)</Text>
              <Controller
                control={control}
                name="monthlySalary"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 75000"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor="#999"
                  />
                )}
              />
              {errors.monthlySalary && <Text style={styles.errorText}>{errors.monthlySalary.message}</Text>}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Why do we need this?</Text>
              <Text style={styles.infoText}>
                Regulated lenders use your income levels to ensure you are not overburdened with debt ratios.
              </Text>
            </View>
          </View>
        );
      }

      case 5: {
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Residential Address</Text>
            <Text style={styles.stepDesc}>Enter your current operational residential location.</Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>ADDRESS LINE 1</Text>
              <Controller
                control={control}
                name="addressLine1"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={styles.textInput}
                    placeholder="Flat No, Wing, Building Name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor="#999"
                  />
                )}
              />
              {errors.addressLine1 && <Text style={styles.errorText}>{errors.addressLine1.message}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>ADDRESS LINE 2 (OPTIONAL)</Text>
              <Controller
                control={control}
                name="addressLine2"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={styles.textInput}
                    placeholder="Street Name, Landmark"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor="#999"
                  />
                )}
              />
            </View>

            <View style={styles.addressGrid}>
              <View style={[styles.formGroup, { width: '48%' }]}>
                <Text style={styles.inputLabel}>PINCODE</Text>
                <Controller
                  control={control}
                  name="pincode"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 400001"
                      keyboardType="numeric"
                      maxLength={6}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholderTextColor="#999"
                    />
                  )}
                />
                {errors.pincode && <Text style={styles.errorText}>{errors.pincode.message}</Text>}
              </View>

              <View style={[styles.formGroup, { width: '48%' }]}>
                <Text style={styles.inputLabel}>CITY</Text>
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Mumbai"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholderTextColor="#999"
                    />
                  )}
                />
                {errors.city && <Text style={styles.errorText}>{errors.city.message}</Text>}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>STATE</Text>
              <Controller
                control={control}
                name="state"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Maharashtra"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor="#999"
                  />
                )}
              />
              {errors.state && <Text style={styles.errorText}>{errors.state.message}</Text>}
            </View>
          </View>
        );
      }

      case 6: {
        const currentVals = watch();
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Confirm Application Details</Text>
            <Text style={styles.stepDesc}>Review parameters before submitting to the underwriting engine.</Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summarySectionTitle}>LOAN DETAILS</Text>
              <SummaryRow label="Loan Type" value={currentVals.loanType} />
              <SummaryRow label="Loan Amount" value={`₹${currentVals.amount.toLocaleString('en-IN')}`} />
              <SummaryRow label="Requested Tenure" value={`${currentVals.tenure} Months`} />
              
              <View style={styles.summaryDivider} />

              <Text style={styles.summarySectionTitle}>EMPLOYMENT & INCOME</Text>
              <SummaryRow label="Work Category" value={currentVals.employmentType} />
              <SummaryRow label="Company Name" value={currentVals.companyName} />
              <SummaryRow label="Designation" value={currentVals.designation} />
              <SummaryRow label="Total Experience" value={`${currentVals.experience} Years`} />
              <SummaryRow label="Monthly Salary" value={`₹${Number(currentVals.monthlySalary).toLocaleString('en-IN')}`} />

              <View style={styles.summaryDivider} />

              <Text style={styles.summarySectionTitle}>ADDRESS PROFILE</Text>
              <SummaryRow label="Address" value={`${currentVals.addressLine1}${currentVals.addressLine2 ? ', ' + currentVals.addressLine2 : ''}`} />
              <SummaryRow label="Location" value={`${currentVals.city}, ${currentVals.state} - ${currentVals.pincode}`} />
            </View>

            <Text style={styles.legalDisclaimer}>
              By proceeding, you consent to Udofin retrieving your credit bureau (CIBIL/Experian) history to match you with registered partner bank offers.
            </Text>
          </View>
        );
      }

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Apply for Loan" onBackPress={onPrevStep} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <ProgressStepper activeStep={activeStep} totalSteps={6} stepLabels={stepLabels} />
        
        {renderStepContent()}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        {activeStep < 6 ? (
          <Button title="Continue" onPress={onNextStep} />
        ) : (
          <Button title="Submit Application" onPress={handleSubmit(onSubmitForm)} />
        )}
      </View>
    </SafeAreaView>
  );
}

// Sub components
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryVal}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 24,
    lineHeight: 20,
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    borderWidth: 2,
    borderColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
    padding: 18,
    borderRadius: 16,
  },
  optionCardSelected: {
    borderColor: '#E47656',
    backgroundColor: '#FFF5F2',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4B5563',
  },
  optionTextSelected: {
    color: '#E47656',
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderValueText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E47656',
  },
  sliderLimitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  limitLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  horizontalPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    borderWidth: 1.5,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
  },
  pillSelected: {
    borderColor: '#E47656',
    backgroundColor: '#FFF5F2',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  pillTextSelected: {
    color: '#E47656',
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#EAEAEA',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  addressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#2563EB',
    lineHeight: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700',
    marginTop: 6,
  },
  summaryCard: {
    borderWidth: 1.5,
    borderColor: '#EAEAEA',
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#FAFAFA',
    marginBottom: 20,
  },
  summarySectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  summaryVal: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 14,
  },
  legalDisclaimer: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  incrementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  incrementBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E47656',
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incrementBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E47656',
  },
});
