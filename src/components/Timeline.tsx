import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

interface TimelineProps {
  currentStatus: 'submitted' | 'kyc' | 'review' | 'offers' | 'selected' | 'agreement' | 'disbursed' | 'completed';
}

interface TimelineStep {
  key: string;
  label: string;
  description: string;
}

export default function Timeline({ currentStatus }: TimelineProps) {
  const steps: TimelineStep[] = [
    { key: 'submitted', label: 'Application Submitted', description: 'Your application has been received' },
    { key: 'kyc', label: 'KYC Verification', description: 'PAN & Aadhaar validation complete' },
    { key: 'review', label: 'Under Review', description: 'Lenders are reviewing your eligibility' },
    { key: 'offers', label: 'Offers Received', description: 'Select a customized offer from partner banks' },
    { key: 'selected', label: 'Bank Selected', description: 'HDFC Bank selected for funding' },
    { key: 'agreement', label: 'Sign Agreement', description: 'Review KFS and sign digital loan contract' },
    { key: 'disbursed', label: 'Disbursement', description: 'Funds transferred directly to your bank account' }
  ];

  const getStepState = (stepKey: string, index: number) => {
    const statusOrder = ['submitted', 'kyc', 'review', 'offers', 'selected', 'agreement', 'disbursed', 'completed'];
    const currentIdx = statusOrder.indexOf(currentStatus);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (stepIdx < currentIdx || currentStatus === 'completed') {
      return 'completed';
    } else if (stepKey === currentStatus) {
      return 'active';
    } else {
      return 'pending';
    }
  };

  return (
    <View style={styles.container}>
      {steps.map((step, idx) => {
        const state = getStepState(step.key, idx);
        const isLast = idx === steps.length - 1;

        return (
          <View key={step.key} style={styles.stepRow}>
            {/* Left line & node indicator */}
            <View style={styles.indicatorCol}>
              <View style={[
                styles.nodeCircle,
                state === 'completed' && styles.nodeCompleted,
                state === 'active' && styles.nodeActive
              ]}>
                {state === 'completed' ? (
                  <Check color="#FFF" size={14} strokeWidth={3} />
                ) : (
                  <View style={[
                    styles.innerDot,
                    state === 'active' && styles.innerDotActive
                  ]} />
                )}
              </View>
              {!isLast && (
                <View style={[
                  styles.line,
                  state === 'completed' && styles.lineCompleted
                ]} />
              )}
            </View>

            {/* Right text labels */}
            <View style={styles.contentCol}>
              <Text style={[
                styles.stepLabel,
                state === 'active' && styles.stepLabelActive,
                state === 'completed' && styles.stepLabelCompleted
              ]}>
                {step.label}
              </Text>
              <Text style={styles.stepDesc}>
                {step.description}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 65,
  },
  indicatorCol: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  nodeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  nodeCompleted: {
    backgroundColor: '#E47656',
    borderColor: '#E47656',
  },
  nodeActive: {
    borderColor: '#E47656',
    backgroundColor: '#FFF5F2',
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  innerDotActive: {
    backgroundColor: '#E47656',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
    zIndex: 1,
  },
  lineCompleted: {
    backgroundColor: '#E47656',
  },
  contentCol: {
    flex: 1,
    paddingBottom: 20,
    justifyContent: 'flex-start',
  },
  stepLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#888',
    marginBottom: 4,
  },
  stepLabelActive: {
    color: '#E47656',
  },
  stepLabelCompleted: {
    color: '#1A1A1A',
  },
  stepDesc: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
