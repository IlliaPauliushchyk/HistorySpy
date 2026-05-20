import React from 'react';
import { AdaptiveCardText, AdaptiveCardTextProps } from './AdaptiveCardText';

const HINT_MAX_FONT = 22;
const HINT_MIN_FONT = 13;

type AdaptiveHintTextProps = Pick<
  AdaptiveCardTextProps,
  'text' | 'color' | 'maxHeight' | 'style'
>;

export const AdaptiveHintText = (props: AdaptiveHintTextProps) => (
  <AdaptiveCardText
    {...props}
    maxFontSize={HINT_MAX_FONT}
    minFontSize={HINT_MIN_FONT}
    maxLines={24}
  />
);
