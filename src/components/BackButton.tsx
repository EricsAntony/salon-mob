import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface Props {
  onPress: () => void;
  style?: ViewStyle;
  iconColor?: string;
}

const BackButton: React.FC<Props> = React.memo(({ onPress, style, iconColor = '#111827' }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: '#F3F4F6',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: '#E5E7EB',
        },
        style,
      ]}
    >
      <MaterialCommunityIcons name="arrow-left" size={22} color={iconColor} />
    </TouchableOpacity>
  );
});

export default BackButton;
