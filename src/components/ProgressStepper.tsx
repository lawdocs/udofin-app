import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressStepperProps {
  activeStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export default function ProgressStepper({ activeStep, totalSteps, stepLabels }: ProgressStepperProps) {
  return (
    <View style={styles.container}>
      {/* Numbers and Labels preview */}
      <View style={styles.topRow}>
        <Text style={styles.stepText}>
          Step {activeStep} of {totalSteps}
        </Text>
        {stepLabels && stepLabels[activeStep - 1] && (
          <Text style={styles.labelActive}>
            {stepLabels[activeStep - 1]}
          </Text>
        )}
      </View>

      {/* Progress indicators */}
      <View style={styles.indicatorContainer}>
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === activeStep;
          const isCompleted = stepNum < activeStep;

          return (
            <View
              key={idx}
              style={[
                styles.stepSegment,
                isActive && styles.segmentActive,
                isCompleted && styles.segmentCompleted,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.5,
  },
  labelActive: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E47656',
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    height: 6,
  },
  stepSegment: {
    flex: 1,
    height: '100%',
    backgroundColor: '#F0F0F0',
    borderRadius: 99,
  },
  segmentActive: {
    backgroundColor: '#E47656',
  },
  segmentCompleted: {
    backgroundColor: '#E47656',
    opacity: 0.6,
  },
});
