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
import { storage } from '../../utils/storage';
import { AppError } from '../../utils/errors';
import { useAppDispatch } from '../../store';
import { setCredentials, setToken } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/env';
import { postJson } from '../../utils/network';
import ErrorBanner from '../../components/ErrorBanner';

const GRADIENT_COLORS = ['#ffffff', '#f3e8ff', '#ede9fe'] as const; // white -> purple-100 -> violet-100
const VIOLET_600 = '#7c3aed';
const VIOLET_500 = '#6d28d9';
const VIOLET_200 = '#ddd6fe';
const VIOLET_100 = '#ede9fe';
const TEXT_DARK = '#1f2937';
const TEXT_MUTED = '#6b7280';

export default function OTPInput() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const phoneNumber: string = route?.params?.phoneNumber ?? '+91 98765 43210';

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<RNTextInput | null>>([]);

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
      setTimeout(() => inputRefs.current[0]?.focus(), 300);
    });
  }, [enterOpacity, enterTranslateY]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isComplete = useMemo(() => otp.every((d) => d !== ''), [otp]);

  const handleChange = (index: number, raw: string) => {
    // digits only
    const value = raw.replace(/\D/g, '');
    if (value.length === 0) {
      const next = [...otp];
      next[index] = '';
      setOtp(next);
      setError('');
      return;
    }

    // If user pasted/typed multiple digits in one box, distribute
    const digits = value.slice(0, 6 - index).split('');
    const next = [...otp];
    for (let i = 0; i < digits.length; i++) {
      if (index + i < 6) next[index + i] = digits[i];
    }
    setOtp(next);
    setError('');

    const nextIndex = Math.min(index + digits.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace') {
      if (otp[index]) {
        // clear current
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...otp];
        next[index - 1] = '';
        setOtp(next);
      }
    }
  };

  const handleSubmit = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    setIsSubmitting(true);
    setError('');

    const digits = String(phoneNumber).replace(/\D/g, '').slice(-10);
    try {
      const { res, data } = await postJson(
        `${API_URL}/user/authenticate`,
        {
          phone_number: digits,
          otp: code,
        },
        { credentials: 'include' as any },
      );

      // Success path: extract tokens from body or headers
      const accessToken: string | undefined =
        data?.access_token || data?.accessToken || data?.token;
      const refreshTokenBody: string | undefined = data?.refresh_token || data?.refreshToken;
      const csrfTokenBody: string | undefined =
        data?.csrf_token || data?.csrfToken || res.headers.get('x-csrf-token') || undefined;

      const setCookie = res.headers.get('set-cookie');
      if (setCookie) {
        // Save raw header for debugging/refresh fallback
        await storage.set('auth.cookies', { setCookie });

        // Best-effort parse cookies to extract refresh/csrf if present
        const parts = String(setCookie).split(/,(?=[^;]+?=)/);
        const getCookie = (name: string): string | undefined => {
          for (const p of parts) {
            const kv = p.split(';')[0];
            const eq = kv.indexOf('=');
            if (eq > -1) {
              const k = kv.slice(0, eq).trim();
              if (k.toLowerCase() === name.toLowerCase()) return kv.slice(eq + 1).trim();
            }
          }
          return undefined;
        };
        const refreshFromCookie =
          getCookie('refresh_token') || getCookie('refreshToken') || getCookie('rt');
        const csrfFromCookie =
          getCookie('csrf_token') ||
          getCookie('csrfToken') ||
          getCookie('xsrf-token') ||
          getCookie('XSRF-TOKEN');

        if (!refreshTokenBody && refreshFromCookie)
          await storage.set('auth.refreshToken', refreshFromCookie);
        if (!csrfTokenBody && csrfFromCookie) await storage.set('auth.csrfToken', csrfFromCookie);
      }

      if (refreshTokenBody) await storage.set('auth.refreshToken', refreshTokenBody);
      if (csrfTokenBody) await storage.set('auth.csrfToken', csrfTokenBody);

      if (accessToken) {
        // Try to capture user_id from response body
        const userId: string | undefined = data?.user_id || undefined;

        if (userId) {
          dispatch(
            setCredentials({
              token: accessToken,
              user: {
                id: String(userId),
                name: (data?.user?.name as string) || '',
                email: (data?.user?.email as string) || '',
              },
            } as any),
          );
        } else {
          dispatch(setToken(accessToken));
        }
        await storage.set('auth.accessToken', accessToken);
      }

      // Navigate to dashboard (Main tabs)
      (navigation as any).reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e: any) {
      if (e instanceof AppError) {
        if (e.type === 'OTP_EXPIRED') {
          setError('OTP expired. Please resend the code.');
          setCanResend(true);
        } else if (e.type === 'USER_NOT_REGISTERED') {
          // Navigate to registration with phone and otp prefilled
          const otpCode = otp.join('');
          const phoneDigits = (phoneNumber || '').replace(/\D/g, '');
          const normalizedPhone = phoneDigits.length > 10 ? phoneDigits.slice(-10) : phoneDigits;
          navigation.navigate('UserDetails', {
            prefill: {},
            phoneNumber: normalizedPhone,
            otp: otpCode,
          });
        } else {
          setError(e.message || 'Verification failed. Please try again.');
        }
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    setError('');
    setIsResending(true);

    // Extract last 10 digits from phoneNumber like "+91 98765 43210"
    const digits = String(phoneNumber).replace(/\D/g, '').slice(-10);
    try {
      const { data } = await postJson(`${API_URL}/otp/request`, { phone_number: digits });
      console.log('OTP resend success:', data);
      const code = (data as any)?.code || (data as any)?.otp;
      if (code) console.log('OTP code:', code);

      // Reset inputs and restart timer
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setResendTimer(30);
      setCanResend(false);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (e) {
      if (__DEV__) {
        console.log('OTP resend error:', e);
      }
      if (e instanceof AppError) setError(e.message || 'Network error. Please try again.');
      else setError('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

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
        <Text style={styles.headerTitle}>Verification</Text>
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
        {/* Error banner (top) with reserved space to avoid layout flicker */}
        <View style={{ position: 'relative', height: 56, marginBottom: 12 }}>
          <ErrorBanner
            message={error || null}
            onDismiss={() => setError('')}
            style={{ position: 'absolute', left: 0, right: 0 }}
          />
        </View>

        {/* Icon */}
        <View style={styles.iconWrap}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="shield-check" size={26} color={VIOLET_600} />
          </View>
        </View>

        {/* Title & description */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.description}>We've sent a 6-digit code to</Text>
          <View style={styles.phoneRow}>
            <Text
              style={[styles.description, { color: VIOLET_600, fontWeight: '700', marginTop: 6 }]}
            >
              {phoneNumber}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                const digits = phoneNumber.replace(/\D/g, '').slice(-10);
                const initial =
                  digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
                (navigation as any).replace('PhoneInput', {
                  initialPhoneNumber: initial,
                  returnTo: 'OTPInput',
                });
              }}
              style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, marginLeft: 8 }}
            >
              <MaterialCommunityIcons name="pencil-outline" size={16} color={VIOLET_600} />
              <Text style={{ color: VIOLET_600, fontWeight: '700', marginLeft: 4 }}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* OTP Inputs */}
        <View style={{ marginBottom: 16 }}>
          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <View key={index} style={styles.otpBox}>
                <RNTextInput
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  value={digit}
                  onChangeText={(t) => handleChange(index, t)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                  maxLength={1}
                  placeholder=""
                  keyboardType="number-pad"
                  returnKeyType="done"
                  style={styles.otpInput}
                />
              </View>
            ))}
          </View>

          {/* Error moved to top banner */}

          {/* Progress dots */}
          <View style={styles.progressRow}>
            {otp.map((d, i) => (
              <View key={i} style={[styles.progressDot, d ? styles.progressDotActive : null]} />
            ))}
          </View>
        </View>

        {/* Resend */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ color: TEXT_MUTED, fontSize: 13, marginBottom: 6 }}>
            Didn't receive the code?
          </Text>
          {canResend ? (
            isResending ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color={VIOLET_600} />
                <Text style={{ marginLeft: 8, color: VIOLET_600, fontWeight: '700' }}>
                  Sending code...
                </Text>
              </View>
            ) : (
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7} disabled={isResending}>
                <Text style={{ color: VIOLET_600, fontWeight: '700' }}>Resend Code</Text>
              </TouchableOpacity>
            )
          ) : (
            <Text style={{ color: '#6b7280', fontSize: 13 }}>Resend in {resendTimer}s</Text>
          )}
        </View>
      </Animated.View>

      {/* Bottom button */}
      <Animated.View
        style={[styles.bottomWrap, { paddingBottom: Math.max(24, insets.bottom + 12) }]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSubmit}
          disabled={!isComplete || isSubmitting}
          style={{ borderRadius: 16, overflow: 'hidden' }}
        >
          {isComplete && !isSubmitting ? (
            <LinearGradient
              colors={[VIOLET_600, VIOLET_500] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cta}
            >
              <Text style={styles.ctaText}>Verify & Continue</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
            </LinearGradient>
          ) : (
            <View style={[styles.cta, { backgroundColor: isSubmitting ? VIOLET_200 : '#e5e7eb' }]}>
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="#4f46e5" />
                  <Text style={[styles.ctaText, { marginLeft: 8, color: VIOLET_600 }]}>
                    Verifying...
                  </Text>
                </>
              ) : (
                <Text style={[styles.ctaText, { color: '#9ca3af' }]}>Verify & Continue</Text>
              )}
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
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: VIOLET_200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  otpInput: {
    width: '100%',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: VIOLET_600,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  progressDotActive: {
    backgroundColor: VIOLET_600,
    transform: [{ scale: 1.1 }],
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: VIOLET_100,
    padding: 16,
    borderRadius: 16,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#4c1d95',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 12,
    color: '#6d28d9',
  },
  bottomWrap: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  cta: {
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
