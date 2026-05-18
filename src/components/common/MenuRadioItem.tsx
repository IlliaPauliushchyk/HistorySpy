import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RadioButton, TouchableRipple } from 'react-native-paper';
import { AppText } from './AppText';

type Props = {
  title: string;
  checked: boolean;
  onPress: () => void;
};

export const MenuRadioItem = ({ title, checked, onPress }: Props) => {
  return (
    <TouchableRipple borderless onPress={onPress}>
      <View style={styles.menuItemWrapper}>
        <View style={styles.menuItemInner}>
          <RadioButton
            value=""
            status={checked ? 'checked' : 'unchecked'}
            onPress={onPress}
          />
          <AppText variant="titleLarge" ml={16}>
            {title}
          </AppText>
        </View>
      </View>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  menuItemWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
