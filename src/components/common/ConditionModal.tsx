import { AppButton, AppText, ScreenContainer } from '@/components';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText } from 'react-native-paper';
import { Input } from './Input';

type Props = {
  title: string;
  description: string;
  buttonTitle: string;
  showBackButton?: boolean;
  onPressButton: (value?: string) => any;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputSecureTextEntry?: boolean;
  inputValue?: string;
  onChangeInput?: (value: string) => void;
  errorMessage?: string;
};

export const ConditionModal = ({
  title,
  description,
  buttonTitle,
  showBackButton = true,
  onPressButton,
  inputLabel,
  inputPlaceholder,
  inputSecureTextEntry = false,
  inputValue,
  onChangeInput,
  errorMessage,
}: Props) => {
  const navigation = useNavigation();
  const [loading, setIsLoading] = useState(false);
  const [internalValue, setInternalValue] = useState('');

  const handleInputChange = (value: string) => {
    setInternalValue(value);
    onChangeInput?.(value);
  };

  const currentValue = inputValue ?? internalValue;
  const shouldRenderInput =
    inputLabel !== undefined ||
    inputPlaceholder !== undefined ||
    onChangeInput !== undefined ||
    inputValue !== undefined ||
    inputSecureTextEntry;
  const hasError = Boolean(errorMessage);

  const onPress = async () => {
    try {
      setIsLoading(true);
      await onPressButton(currentValue);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer navigation={showBackButton && navigation} title=" ">
      <View style={styles.container}>
        <AppText
          variant="headlineMedium"
          fontWeight="bold"
          lineH={40}
          size={35}
        >
          {title}
        </AppText>
        <AppText
          mt={30}
          mb={shouldRenderInput || hasError ? 24 : 50}
          lineH={24}
        >
          {description}
        </AppText>
        {shouldRenderInput ? (
          <Input
            value={currentValue}
            onChangeText={handleInputChange}
            label={inputLabel}
            placeholder={inputPlaceholder}
            secureTextEntry={inputSecureTextEntry}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={() => onPress()}
          />
        ) : null}
        <View>
          <AppButton loading={loading} style={styles.button} onPress={onPress}>
            {buttonTitle}
          </AppButton>
          {hasError ? (
            <HelperText type="error" visible={true} style={styles.helper}>
              {errorMessage}
            </HelperText>
          ) : null}
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  button: {
    alignSelf: 'flex-end',
  },
  helper: {
    marginBottom: 16,
    textAlign: 'right',
  },
});
