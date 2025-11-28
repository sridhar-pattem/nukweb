import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { colors, radius, spacing } from '../styles/theme';

const Button = ({ title, onPress, loading = false, style, textStyle, variant = 'primary' }) => {
  const backgroundColor = variant === 'ghost' ? 'transparent' : colors.primary;
  const color = variant === 'ghost' ? colors.primary : '#ffffff';
  const borderColor = variant === 'ghost' ? colors.primary : 'transparent';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={[
        {
          backgroundColor,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={[{ color, fontWeight: '600' }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
