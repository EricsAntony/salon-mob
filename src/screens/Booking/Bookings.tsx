import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useGetBookingsQuery } from '../../api/bookingsApi';

export default function Bookings() {
  const { data } = useGetBookingsQuery();
  return (
    <View style={{ padding: 16 }}>
      <Text>Bookings ({data?.length ?? 0})</Text>
    </View>
  );
}
