import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLoanStore } from '../../store/loanStore';
import Header from '../../components/Header';
import Button from '../../components/Button';
import ProgressStepper from '../../components/ProgressStepper';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

// Define schemas for validation using Zod
const loanFormSchema = z.object({
  loanType: z.string().min(1, 'Please select a loan type'),
  amount: z.number().min(10000, 'Minimum amount is ₹10,000').max(500000, 'Maximum amount is ₹5,00,000'),
  tenure: z.number().min(6, 'Minimum tenure is 6 months').max(60, 'Maximum tenure is 60 months'),
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
});

type LoanFormData = z.infer<typeof loanFormSchema>;

export default function LoanApplicationWizard() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);
  const { draftApplication, setDraftApplication, addApplication, clearDraftApplication } = useLoanStore();
  
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

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
    t('Loan Category'),
    t('Limit & Tenure'),
    t('Employment Info'),
    t('Income Details'),
    t('Address Info'),
    t('Confirm Details'),
  ];

  const loanTypes = [
    t('Personal Loan'), 
    t('Business Loan'), 
    t('Education Loan'), 
    t('Home Renovation'), 
    t('Two Wheeler')
  ];
  
  const employmentTypes = [
    t('Salaried'), 
    t('Self-Employed'), 
    t('Freelancer'), 
    t('Business Owner')
  ];

  const selectedLoanType = watch('loanType');
  const selectedAmount = watch('amount');
  const selectedTenure = watch('tenure');
  const selectedEmploymentType = watch('employmentType');

  const onNextStep = async () => {
    let isValid = false;
    if (activeStep === 1) {
      isValid = await trigger('loanType');
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
      t('Application Submitted'),
      t('Your loan request {{id}} has been successfully submitted!').replace('{{id}}', appId),
      [
        {
          text: t('View Status'),
          onPress: () => router.replace(`/application/${appId}` as any),
        },
      ]
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t("Select Loan Type")}</Text>
            <Text style={styles.stepDesc}>{t("What type of credit access do you need?")}</Text>
            
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
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.loanType && <Text style={styles.errorText}>{t(errors.loanType.message || '')}</Text>}
          </View>
        );
        
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t("Configure Loan Amount")}</Text>
            <Text style={styles.stepDesc}>{t("Adjust parameters to match your repayment comfort.")}</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{t("DESIRED AMOUNT (₹)")}</Text>
              <View style={styles.incrementContainer}>
                <TouchableOpacity 
                  style={styles.incrementBtn} 
                  onPress={() => setValue('amount', Math.max(10000, selectedAmount - 10000))}
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
                    setValue('amount', Math.min(500000, Math.max(0, num)));
                  }}
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity 
                  style={styles.incrementBtn} 
                  onPress={() => setValue('amount', Math.min(500000, selectedAmount + 10000))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.incrementBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sliderLimitRow}>
                <Text style={styles.limitLabel}>{t("Min: ₹10,000")}</Text>
                <Text style={styles.limitLabel}>{t("Max: ₹5,00,000")}</Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{t("REPAYMENT TENURE (MONTHS)")}</Text>
              <View style={styles.incrementContainer}>
                <TouchableOpacity 
                  style={styles.incrementBtn} 
                  onPress={() => setValue('tenure', Math.max(6, selectedTenure - 3))}
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
                    setValue('tenure', Math.min(60, Math.max(0, num)));
                  }}
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity 
                  style={styles.incrementBtn} 
                  onPress={() => setValue('tenure', Math.min(60, selectedTenure + 3))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.incrementBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sliderLimitRow}>
                <Text style={styles.limitLabel}>{t("Min: 6 Months")}</Text>
                <Text style={styles.limitLabel}>{t("Max: 60 Months")}</Text>
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t("Employment Details")}</Text>
            <Text style={styles.stepDesc}>{t("Please tell us about your current job profile.")}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{t("EMPLOYMENT TYPE")}</Text>
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
              {errors.employmentType && <Text style={styles.errorText}>{t(errors.employmentType.message || '')}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{t("COMPANY NAME")}</Text>
              <Controller
                control={control}
                name="companyName"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={styles.textInput}
                    placeholder={t("e.g. Google India")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor={colors.textMuted}
                  />
                )}
              />
              {errors.companyName && <Text style={styles.errorText}>{t(errors.companyName.message || '')}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{t("DESIGNATION")}</Text>
              <Controller
                control={control}
                name="designation"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={styles.textInput}
                    placeholder={t("e.g. Software Engineer")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor={colors.textMuted}
                  />
                )}
              />
              {errors.designation && <Text style={styles.errorText}>{t(errors.designation.message || '')}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{t("WORK EXPERIENCE (YEARS)")}</Text>
              <Controller
                control={control}
                name="experience"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={styles.textInput}
                    placeholder={t("e.g. 4")}
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor={colors.textMuted}
                  />
                )}
              />
              {errors.experience && <Text style={styles.errorText}>{t(errors.experience.message || '')}</Text>}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t("Income Parameters")}</Text>
            <Text style={styles.stepDesc}>{t("State your verified net monthly cash inflow.")}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{t("NET MONTHLY SALARY (₹)")}</Text>
              <Controller
                control={control}
                name="monthlySalary"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={styles.textInput}
                    placeholder={t("e.g. 75000")}
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor={colors.textMuted}
                  />
                )}
              />
              {errors.monthlySalary && <Text style={styles.errorText}>{t(errors.monthlySalary.message || '')}</Text>}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>{t("Why do we need this?")}</Text>
              <Text style={styles.infoText}>
                {t("Regulated lenders use your income levels to ensure you are not overburdened with debt ratios.")}
              </Text>
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t("Residential Address")}</Text>
            <Text style={styles.stepDesc}>{t("Enter your current operational residential location.")}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{t("ADDRESS LINE 1")}</Text>
              <Controller
                control={control}
                name="addressLine1"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={styles.textInput}
                    placeholder={t("Flat No, Wing, Building Name")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor={colors.textMuted}
                  />
                )}
              />
              {errors.addressLine1 && <Text style={styles.errorText}>{t(errors.addressLine1.message || '')}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{t("ADDRESS LINE 2 (OPTIONAL)")}</Text>
              <Controller
                control={control}
                name="addressLine2"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={styles.textInput}
                    placeholder={t("Street Name, Landmark")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor={colors.textMuted}
                  />
                )}
              />
            </View>

            <View style={styles.addressGrid}>
              <View style={[styles.formGroup, { width: '48%' }]}>
                <Text style={styles.inputLabel}>{t("PINCODE")}</Text>
                <Controller
                  control={control}
                  name="pincode"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={styles.textInput}
                      placeholder={t("e.g. 400001")}
                      keyboardType="numeric"
                      maxLength={6}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholderTextColor={colors.textMuted}
                    />
                  )}
                />
                {errors.pincode && <Text style={styles.errorText}>{t(errors.pincode.message || '')}</Text>}
              </View>

              <View style={[styles.formGroup, { width: '48%' }]}>
                <Text style={styles.inputLabel}>{t("CITY")}</Text>
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={styles.textInput}
                      placeholder={t("e.g. Mumbai")}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholderTextColor={colors.textMuted}
                    />
                  )}
                />
                {errors.city && <Text style={styles.errorText}>{t(errors.city.message || '')}</Text>}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{t("STATE")}</Text>
              <Controller
                control={control}
                name="state"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={styles.textInput}
                    placeholder={t("e.g. Maharashtra")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor={colors.textMuted}
                  />
                )}
              />
              {errors.state && <Text style={styles.errorText}>{t(errors.state.message || '')}</Text>}
            </View>
          </View>
        );

      case 6:
        const currentVals = watch();
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t("Confirm Application Details")}</Text>
            <Text style={styles.stepDesc}>{t("Review parameters before submitting to the underwriting engine.")}</Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summarySectionTitle}>{t("LOAN DETAILS")}</Text>
              <SummaryRow label={t("Loan Type")} value={t(currentVals.loanType)} colors={colors} styles={styles} />
              <SummaryRow label={t("Loan Amount")} value={`₹${currentVals.amount.toLocaleString('en-IN')}`} colors={colors} styles={styles} />
              <SummaryRow label={t("Requested Tenure")} value={t("{{months}} Months").replace('{{months}}', String(currentVals.tenure))} colors={colors} styles={styles} />
              
              <View style={styles.summaryDivider} />

              <Text style={styles.summarySectionTitle}>{t("EMPLOYMENT & INCOME")}</Text>
              <SummaryRow label={t("Work Category")} value={t(currentVals.employmentType)} colors={colors} styles={styles} />
              <SummaryRow label={t("Company Name")} value={currentVals.companyName} colors={colors} styles={styles} />
              <SummaryRow label={t("Designation")} value={currentVals.designation} colors={colors} styles={styles} />
              <SummaryRow label={t("Total Experience")} value={t("{{years}} Years").replace('{{years}}', currentVals.experience)} colors={colors} styles={styles} />
              <SummaryRow label={t("Monthly Salary")} value={`₹${Number(currentVals.monthlySalary).toLocaleString('en-IN')}`} colors={colors} styles={styles} />

              <View style={styles.summaryDivider} />

              <Text style={styles.summarySectionTitle}>{t("ADDRESS PROFILE")}</Text>
              <SummaryRow label={t("Address")} value={`${currentVals.addressLine1}${currentVals.addressLine2 ? ', ' + currentVals.addressLine2 : ''}`} colors={colors} styles={styles} />
              <SummaryRow label={t("Location")} value={`${currentVals.city}, ${currentVals.state} - ${currentVals.pincode}`} colors={colors} styles={styles} />
            </View>

            <Text style={styles.legalDisclaimer}>
              {t("By proceeding, you consent to Udofin retrieving your credit bureau (CIBIL/Experian) history to match you with registered partner bank offers.")}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t("Apply for Loan")} onBackPress={onPrevStep} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <ProgressStepper activeStep={activeStep} totalSteps={6} stepLabels={stepLabels} />
        
        {renderStepContent()}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        {activeStep < 6 ? (
          <Button title={t("Continue")} onPress={onNextStep} />
        ) : (
          <Button title={t("Submit Application")} onPress={handleSubmit(onSubmitForm)} />
        )}
      </View>
    </SafeAreaView>
  );
}

// Sub components
function SummaryRow({ label, value, colors, styles }: any) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryVal}>{value}</Text>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.text,
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 24,
    lineHeight: 20,
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 16,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: colors.primary,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
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
    color: colors.primary,
  },
  sliderLimitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  limitLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  horizontalPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
  },
  pillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  pillTextSelected: {
    color: colors.primary,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  addressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: colors.primary,
    lineHeight: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: '700',
    marginTop: 6,
  },
  summaryCard: {
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    borderRadius: 20,
    padding: 20,
    backgroundColor: colors.surface,
    marginBottom: 20,
  },
  summarySectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
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
    color: colors.textSecondary,
    fontWeight: '600',
  },
  summaryVal: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right'
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 14,
  },
  legalDisclaimer: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.background,
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
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incrementBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
});
