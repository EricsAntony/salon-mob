import React from 'react';
import { ActivityIndicator } from 'react-native-paper';
import { View } from 'react-native';

const Loader = React.memo(() => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <ActivityIndicator />
  </View>
));

export default Loader;
