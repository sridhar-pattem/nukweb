import React from 'react';
import { Text } from 'react-native';
import { colors } from '../styles/theme';

export const Heading = ({ children, style }) => (
  <Text style={[{ fontSize: 24, fontWeight: '700', color: colors.text }, style]}>{children}</Text>
);

export const Subheading = ({ children, style }) => (
  <Text style={[{ fontSize: 16, fontWeight: '500', color: colors.muted }, style]}>{children}</Text>
);

export const Body = ({ children, style }) => (
  <Text style={[{ fontSize: 14, color: colors.text }, style]}>{children}</Text>
);
