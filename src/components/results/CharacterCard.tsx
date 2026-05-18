import { AppText } from '@/components';
import { FONT_SIZES } from '@/constants';
import {
  BUILTIN_SET_ID_TO_ITEM_TYPE,
  CurriculumItemType,
  getLocalizedName,
} from '@/utils/localization';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

type CharacterCardProps = {
  character: string;
  setType: string;
};

export const CharacterCard = ({ character, setType }: CharacterCardProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const itemType: CurriculumItemType | undefined =
    BUILTIN_SET_ID_TO_ITEM_TYPE[setType];

  return (
    <Card style={styles.locationCard}>
      <Card.Content>
        <View style={styles.locationContent}>
          <AppText style={{ fontSize: FONT_SIZES.EMOJI, marginRight: 12 }}>
            🎭
          </AppText>
          <View style={styles.locationText}>
            <AppText
              variant="bodyLarge"
              fontWeight="bold"
              style={{ color: theme.colors.onSurface }}
            >
              {getLocalizedName(character, itemType)}
            </AppText>
            <AppText
              variant="bodyMedium"
              style={{
                color: theme.colors.onSurface,
                opacity: 0.7,
                marginTop: 4,
              }}
            >
              {t('labels.character')}
            </AppText>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  locationCard: {
    marginBottom: 24,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    flex: 1,
    marginLeft: 12,
  },
});
