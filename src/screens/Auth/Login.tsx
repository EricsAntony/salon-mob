import React, { useState } from 'react';
import { View } from 'react-native';
import { Text, HelperText } from 'react-native-paper';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import { useLoginMutation } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();
  const { signIn } = useAuth();

  const onSubmit = async () => {
    try {
      const res = await login({ email, password }).unwrap();
      signIn(res.token, res.user);
    } catch (e) {}
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text variant="headlineSmall">Welcome Back</Text>
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {error ? <HelperText type="error">Login failed</HelperText> : null}
      <Button onPress={onSubmit} loading={isLoading}>
        Login
      </Button>
    </View>
  );
}
