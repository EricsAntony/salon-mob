import React, { useEffect, useMemo, useRef } from 'react';
import { Text, TouchableOpacity, Animated, StyleProp, ViewStyle } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export type BannerVariant = 'error' | 'warning' | 'info' | 'success';

type Props = {
  message?: string | null;
  visible?: boolean;
  onDismiss?: () => void;
  variant?: BannerVariant;
  style?: StyleProp<ViewStyle>;
};

const palette = {
  error: {
    bg: '#fee2e2', // red-100
    border: '#fecaca', // red-200
    icon: '#b91c1c', // red-700
    text: '#991b1b', // red-800
    iconName: 'alert-circle-outline' as const,
  },
  warning: {
    bg: '#fef9c3', // yellow-100
    border: '#fde68a', // yellow-300
    icon: '#92400e', // amber-800
    text: '#92400e',
    iconName: 'alert-outline' as const,
  },
  info: {
    bg: '#dbeafe', // blue-100
    border: '#bfdbfe', // blue-200
    icon: '#1e3a8a', // blue-900
    text: '#1e3a8a',
    iconName: 'information-outline' as const,
  },
  success: {
    bg: '#dcfce7', // green-100
    border: '#bbf7d0', // green-200
    icon: '#166534', // green-800
    text: '#166534',
    iconName: 'check-circle-outline' as const,
  },
};

export default function ErrorBanner({
  message,
  visible,
  onDismiss,
  variant = 'error',
  style,
}: Props) {
  const show = !!message && (visible ?? true);

  const translateY = useRef(new Animated.Value(-12)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const colors = useMemo(() => palette[variant], [variant]);

  useEffect(() => {
    if (show) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -12, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [opacity, show, translateY]);

  if (!show) return null;

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateY }],
          opacity,
          marginHorizontal: 4,
          marginBottom: 12,
          backgroundColor: colors.bg,
          borderWidth: 1,
          borderColor: colors.border,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 14,
          flexDirection: 'row',
          alignItems: 'center',
        },
        style,
      ]}
      accessibilityRole="alert"
    >
      <MaterialCommunityIcons name={colors.iconName} size={20} color={colors.icon} />
      <Text style={{ color: colors.text, flex: 1, marginLeft: 10 }}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="close" size={18} color={colors.text} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
