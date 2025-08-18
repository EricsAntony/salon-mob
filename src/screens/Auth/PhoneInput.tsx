import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  Animated,
  Easing,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const GRADIENT_COLORS = ['#ffffff', '#f3e8ff', '#ede9fe'] as const; // white -> purple-100 -> violet-100
const VIOLET_600 = '#7c3aed';
const VIOLET_200 = '#ddd6fe';
const VIOLET_100 = '#ede9fe';
const GREEN_500 = '#22c55e';
const RED_400 = '#f87171';
const TEXT_DARK = '#1f2937';
const TEXT_MUTED = '#6b7280';

export default function PhoneInput() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const initialPhoneNumber: string | undefined = route?.params?.initialPhoneNumber;
  const returnTo: string | undefined = route?.params?.returnTo;
  const insets = useSafeAreaInsets();

  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber ?? '');
  const [isValid, setIsValid] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<RNTextInput>(null);

  // Enter animation
  const enterTranslateY = useRef(new Animated.Value(16)).current;
  const enterOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(enterTranslateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(enterOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => inputRef.current?.focus(), 300);
    });
  }, [enterOpacity, enterTranslateY]);

  // If navigated from OTP with a prefill, normalize value and validity once
  useEffect(() => {
    if (initialPhoneNumber) {
      const formatted = formatPhoneNumber(initialPhoneNumber);
      const digits = initialPhoneNumber.replace(/\D/g, '');
      setPhoneNumber(formatted);
      const valid = validateIndianNumber(digits);
      setIsValid(valid);
      if (digits.length < 10) setError('Please enter a complete 10-digit number');
      else if (!valid) setError('Please enter a valid Indian mobile number');
      else setError('');
    }
  }, [initialPhoneNumber]);

  const validateIndianNumber = (number: string): boolean => {
    const digits = number.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(digits);
  };

  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length > 5) return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    return digits;
  };

  const onChangeNumber = (raw: string) => {
    const formatted = formatPhoneNumber(raw);
    const digits = raw.replace(/\D/g, '');
    setPhoneNumber(formatted);

    const valid = validateIndianNumber(digits);
    setIsValid(valid);

    if (digits.length === 0) setError('');
    else if (digits.length < 10) setError('Please enter a complete 10-digit number');
    else if (!valid) setError('Please enter a valid Indian mobile number');
    else setError('');
  };

  const handleSubmit = async () => {
    const digits = phoneNumber.replace(/\D/g, '');
    if (!validateIndianNumber(digits)) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch('https://salon-service.onrender.com/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: digits }),
      });
      const data = await res.json().catch(() => ({}) as any);

      if (!res.ok) {
        const msg = (data && (data.message || data.error)) || 'Failed to send OTP';
        setError(msg);
        console.warn('OTP request failed:', data);
        return;
      }

      console.log('OTP request success:', data);
      if ((data as any).otp) console.log('OTP code:', (data as any).otp);

      const payload = { phoneNumber: `+91 ${phoneNumber}` };
      if (returnTo === 'OTPInput') {
        (navigation as any).replace('OTPInput', payload);
      } else {
        (navigation as any).navigate('OTPInput', payload);
      }
    } catch (e) {
      console.error('OTP request error:', e);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBorderColor = useMemo(() => {
    if (isFocused) return VIOLET_600;
    if (error) return RED_400;
    if (isValid) return GREEN_500;
    return VIOLET_200;
  }, [error, isFocused, isValid]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'} />
      <LinearGradient colors={GRADIENT_COLORS} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#6b7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phone Number</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main */}
      <Animated.View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          transform: [{ translateY: enterTranslateY }],
          opacity: enterOpacity,
        }}
      >
        {/* Icon */}
        <View style={styles.iconWrap}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="phone" size={26} color={VIOLET_600} />
          </View>
        </View>

        {/* Title & description */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={styles.title}>Enter your mobile number</Text>
          <Text style={styles.description}>
            We\'ll send you a verification code to confirm your number
          </Text>
        </View>

        {/* Phone input */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            {/* Country code */}
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>+91</Text>
            </View>

            {/* Input */}
            <View style={{ flex: 1 }}>
              <View style={[styles.inputWrap, { borderColor: inputBorderColor }]}>
                <RNTextInput
                  ref={inputRef}
                  value={phoneNumber}
                  onChangeText={onChangeNumber}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  maxLength={12} // 5 digits + space + 5 digits
                  style={styles.input}
                  returnKeyType="done"
                />

                {/* Validation indicator */}
                {!!phoneNumber && (
                  <View style={styles.validationIndicator}>
                    {isValid ? (
                      <View style={styles.validPill}>
                        <MaterialCommunityIcons name="check" size={14} color="#fff" />
                      </View>
                    ) : (
                      <View style={styles.invalidDot} />
                    )}
                  </View>
                )}
              </View>

              {/* Error/Success */}
              {!!error && <Text style={styles.errorText}>{error}</Text>}
              {isValid && !error && <Text style={styles.successText}>✓ Valid mobile number</Text>}
            </View>
          </View>
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <View style={styles.infoDotWrap}>
            <View style={styles.infoDot} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Secure & Private</Text>
            <Text style={styles.infoDesc}>
              Your number is encrypted and will only be used for account verification and important
              updates.
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Bottom button */}
      <Animated.View
        style={[styles.bottomWrap, { paddingBottom: Math.max(24, insets.bottom + 12) }]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSubmit}
          disabled={!isValid || isSubmitting}
          style={{ borderRadius: 16, overflow: 'hidden' }}
        >
          {isSubmitting ? (
            <View style={[styles.cta, { backgroundColor: '#ede9fe' }]}>
              <ActivityIndicator size="small" color="#4f46e5" />
              <Text style={[styles.ctaText, { marginLeft: 8, color: VIOLET_600 }]}>sending...</Text>
            </View>
          ) : isValid ? (
            <LinearGradient
              colors={[VIOLET_600, '#6d28d9'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cta}
            >
              <Text style={styles.ctaText}>Continue</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
            </LinearGradient>
          ) : (
            <View style={[styles.cta, { backgroundColor: '#e5e7eb' }]}>
              <Text style={[styles.ctaText, { color: '#9ca3af' }]}>Continue</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: VIOLET_100,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: VIOLET_100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  codeBox: {
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: VIOLET_200,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  inputWrap: {
    height: 56,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: VIOLET_200,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  validationIndicator: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  validPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GREEN_500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invalidDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED_400,
  },
  errorText: {
    marginTop: 6,
    color: RED_400,
    fontSize: 12,
  },
  successText: {
    marginTop: 6,
    color: '#16a34a',
    fontSize: 12,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: VIOLET_100,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  infoDotWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ddd6fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: VIOLET_600,
  },
  infoTitle: {
    color: '#4c1d95',
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 2,
  },
  infoDesc: {
    color: '#6d28d9',
    fontSize: 12,
    lineHeight: 18,
  },
  bottomWrap: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  cta: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
