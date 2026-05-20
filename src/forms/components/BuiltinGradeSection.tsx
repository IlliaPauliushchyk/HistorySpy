import { AppText } from '@/components';
import { BuiltinSetTypeId } from '@/constants/builtinCurriculum';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type BuiltinGradeSectionProps = {
  title: string;
  setIds: BuiltinSetTypeId[];
  renderSetButton: (setId: BuiltinSetTypeId) => React.ReactNode;
};

export const BuiltinGradeSection = ({
  title,
  setIds,
  renderSetButton,
}: BuiltinGradeSectionProps) => (
  <View style={styles.container}>
    <AppText variant="titleSmall" fontWeight="bold" style={styles.gradeTitle}>
      {title}
    </AppText>
    <View style={styles.sets}>{setIds.map(setId => renderSetButton(setId))}</View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginBottom: 4,
  },
  gradeTitle: {
    fontSize: 16,
    opacity: 0.9,
    marginLeft: 4,
  },
  sets: {
    gap: 8,
  },
});
