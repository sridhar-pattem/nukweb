import React from 'react';
import { View } from 'react-native';
import { colors, radius, spacing } from '../styles/theme';

const Card = ({ children, style }) => (
  <View
    style={{
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
      marginBottom: spacing.md,
      ...style,
    }}
  >
    {children}
  </View>
);

export default Card;
