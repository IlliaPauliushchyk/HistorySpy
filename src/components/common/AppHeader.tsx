import React, { ReactNode } from 'react';
import { Appbar, useTheme } from 'react-native-paper';
import { Logo } from './Logo';

type Props = {
  children?: ReactNode;
  title?: string | ReactNode;
  naviagtion?: any;
  logo?: boolean;
  closeModal?: () => void;
};

export const AppHeader = ({
  title,
  logo,
  children,
  naviagtion,
  closeModal,
}: Props) => {
  const { colors } = useTheme();

  const goBack = () => {
    naviagtion.goBack();
  };

  return (
    <Appbar.Header style={{ backgroundColor: colors.background }}>
      {naviagtion && (
        <Appbar.BackAction
          onPress={() => (closeModal ? closeModal() : goBack())}
        />
      )}
      <Appbar.Content
        title={logo ? <Logo title={title as string} /> : title ? title : ''}
      />
      {children}
    </Appbar.Header>
  );
};
