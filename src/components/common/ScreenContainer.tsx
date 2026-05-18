import { defaultContainerStyle } from '@/styles';
import { keyExtractor } from '@/utils';
import React, { ReactNode } from 'react';
import {
  FlatList,
  ListRenderItem,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { AppHeader } from './AppHeader';
import { Spinner } from './Spinner';

type Props = {
  children?: ReactNode;
  type?: 'view' | 'scrollView' | 'flatList';
  viewType?: 'view' | 'safeAreaView';
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  navigation?: any;
  title?: string | ReactNode;
  logo?: boolean;
  data?: unknown[];
  renderItem?: ListRenderItem<any> | null | undefined;
};

export const ScreenContainer = ({
  children,
  type = 'view',
  viewType = 'view',
  containerStyle,
  style,
  loading,
  navigation,
  title,
  logo,
  data,
  renderItem,
}: Props) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const paddingTop = insets.top;
  const showHeader = title || logo;

  const ViewComponent = viewType === 'view' ? View : SafeAreaView;
  console.log(showHeader, 'showHeader');
  const renderContent = () => {
    if (loading) {
      return (
        <View style={defaultContainerStyle}>
          <Spinner />
        </View>
      );
    }

    return (
      <>
        {showHeader && (
          <AppHeader logo={logo} naviagtion={navigation} title={title} />
        )}
        {type === 'scrollView' ? (
          <ScrollView
            style={containerStyle}
            contentContainerStyle={[
              { backgroundColor: colors.background },
              style,
            ]}
          >
            {children}
          </ScrollView>
        ) : type === 'flatList' ? (
          <FlatList
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={[
              { backgroundColor: colors.background },
              style,
            ]}
          />
        ) : (
          children
        )}
      </>
    );
  };

  return (
    <ViewComponent
      style={[
        defaultContainerStyle,
        { backgroundColor: colors.background },
        !showHeader ? { paddingTop } : {},
        containerStyle,
      ]}
    >
      {renderContent()}
    </ViewComponent>
  );
};
