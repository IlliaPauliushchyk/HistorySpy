import { AppText } from './AppText';
import { STEP_NUMBER_SIZE } from '@/constants';
import { commonColors } from '@/styles/colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

type NumberedStepProps = {
  number: number;
  children: React.ReactNode;
};

export const NumberedStep = ({ number, children }: NumberedStepProps) => {
  const theme = useTheme();

  return (
    <View style={styles.stepSection}>
      <View
        style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}
      >
        <AppText
          variant="titleMedium"
          fontWeight="bold"
          color={commonColors.white}
        >
          {number}
        </AppText>
      </View>
      <View style={styles.stepContent}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepSection: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: STEP_NUMBER_SIZE.WIDTH,
    height: STEP_NUMBER_SIZE.HEIGHT,
    borderRadius: STEP_NUMBER_SIZE.RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
});
