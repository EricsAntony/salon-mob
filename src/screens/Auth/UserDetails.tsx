import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { storage } from '../../utils/storage';
import { useAppDispatch } from '../../store';
import { setCredentials, setToken } from '../../store/slices/authSlice';
import { AppError } from '../../utils/errors';
import { API_URL } from '../../utils/env';
import { postJson } from '../../utils/network';
import ErrorBanner from '../../components/ErrorBanner';

type UserDetails = {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
};

export default function UserDetailsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const prefill: Partial<UserDetails> | undefined = route?.params?.prefill;
  const phoneFromRoute: string | undefined = route?.params?.phoneNumber;
  const otpFromRoute: string | undefined = route?.params?.otp;
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<UserDetails>({
    firstName: prefill?.firstName ?? '',
    lastName: prefill?.lastName ?? '',
    email: prefill?.email ?? '',
    gender: prefill?.gender ?? '',
  });
  const [errors, setErrors] = useState<Partial<UserDetails>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const translateY = useRef(new Animated.Value(12)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 550, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 550, useNativeDriver: true }),
    ]).start();
  }, [translateY, opacity]);

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UserDetails> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (formData.email && !validateEmail(formData.email))
      newErrors.email = 'Please enter a valid email address';
    if (!formData.gender) newErrors.gender = 'Please select your gender';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserDetails, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    // Clear any submit-level error when user edits
    if (submitError) setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitError(null);
    // Ensure we have phone and otp
    const digits = (phoneFromRoute || '').replace(/\D/g, '');
    const phone_number = digits.length > 10 ? digits.slice(-10) : digits;
    const otp = (otpFromRoute || '').replace(/\D/g, '');
    if (!phone_number || phone_number.length !== 10 || !otp || otp.length !== 6) {
      setSubmitError('Missing phone or OTP. Please go back and verify again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cookieSaved = await storage.get<any>('auth.cookies');
      const cookieHeader = typeof cookieSaved === 'string' ? cookieSaved : cookieSaved?.setCookie;
      const payload = {
        phone_number,
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        gender: (formData.gender || '').toLowerCase(),
        email: formData.email || '',
        location: '',
        otp,
      };

      // Normalize saved Set-Cookie into Cookie header (name=value; name2=value2)
      const cookieStr = cookieHeader
        ? String(cookieHeader)
            .split(/,(?=[^;]+?=)/)
            .map((s) => s.split(';')[0].trim())
            .filter(Boolean)
            .join('; ')
        : undefined;

      const { res, data }: any = await postJson(`${API_URL}/user/register`, payload, {
        headers: {
          ...(cookieStr ? { Cookie: cookieStr } : {}),
        },
        credentials: 'include' as any,
      });

      const accessToken: string | undefined = data?.access_token;
      if (accessToken) {
        // Persist and set token; AppNavigator will switch to MainTabs
        dispatch(setToken(accessToken));
        await storage.set('auth.accessToken', accessToken);
      }

      // Extract and store user_id for future use
      const userId: string | undefined = data?.user_id || undefined;
      if (accessToken && userId) {
        dispatch(
          setCredentials({
            token: accessToken,
            user: {
              id: String(userId),
              name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
              email: formData.email || '',
            },
          } as any),
        );
      }

      const setCookie = res.headers.get('set-cookie');
      if (setCookie) {
        await storage.set('auth.cookies', setCookie);
      }

      setIsSubmitting(false);
      // Optionally navigate; AppNavigator will already redirect based on token
      // navigation.reset({ index: 0, routes: [{ name: 'Main' as never }] });
    } catch (err: any) {
      setIsSubmitting(false);
      const msg =
        err instanceof AppError
          ? err.message
          : err?.message || 'Registration failed. Please try again.';
      setSubmitError(msg);
    }
  };

  const isFormValid = useMemo(() => {
    return (
      !!formData.firstName &&
      !!formData.lastName &&
      !!formData.gender &&
      (!formData.email || validateEmail(formData.email)) &&
      consent
    );
  }, [formData, consent]);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#ffffff', '#f3e8ff', '#ede9fe']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            style={styles.backBtn}
          >
            <Feather name="arrow-left" size={22} color="#4b5563" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ transform: [{ translateY }], opacity }}>
            {/* Top error/timeout banner with reserved space to avoid layout flicker */}
            <View style={{ position: 'relative', height: 56, marginBottom: 12 }}>
              <ErrorBanner
                message={submitError}
                onDismiss={() => setSubmitError(null)}
                style={{ position: 'absolute', left: 0, right: 0 }}
              />
            </View>
            {/* Icon */}
            <View style={styles.iconWrap}>
              <View style={styles.iconCircle}>
                <Feather name="user" size={28} color="#7c3aed" />
              </View>
            </View>

            {/* Title */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <Text style={styles.title}>Tell us about yourself</Text>
              <Text style={styles.subtitle}>Help us personalize your salon experience</Text>
            </View>

            {/* Form */}
            <View style={{ gap: 16 }}>
              {/* First Name */}
              <View>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  value={formData.firstName}
                  onChangeText={(t) => handleInputChange('firstName', t)}
                  placeholder="Enter your first name"
                  placeholderTextColor="#9ca3af"
                  style={[styles.input, inputStateStyle(!!errors.firstName, !!formData.firstName)]}
                />
                {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
              </View>

              {/* Last Name */}
              <View>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  value={formData.lastName}
                  onChangeText={(t) => handleInputChange('lastName', t)}
                  placeholder="Enter your last name"
                  placeholderTextColor="#9ca3af"
                  style={[styles.input, inputStateStyle(!!errors.lastName, !!formData.lastName)]}
                />
                {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
              </View>

              {/* Email */}
              <View>
                <Text style={styles.label}>
                  Email <Text style={{ color: '#9ca3af' }}>(Optional)</Text>
                </Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(t) => handleInputChange('email', t)}
                  placeholder="Enter your email address"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[
                    styles.input,
                    inputStateStyle(
                      !!errors.email,
                      !!(formData.email && validateEmail(formData.email)),
                    ),
                  ]}
                />
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              </View>

              {/* Gender */}
              <View>
                <Text style={styles.label}>Gender *</Text>
                <View style={styles.genderRow}>
                  {['Male', 'Female', 'Other'].map((g) => {
                    const selected = formData.gender === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        activeOpacity={0.9}
                        onPress={() => handleInputChange('gender', g)}
                        style={[
                          styles.genderBtn,
                          selected ? styles.genderBtnSelected : styles.genderBtnIdle,
                        ]}
                      >
                        <Text
                          style={[
                            styles.genderText,
                            selected ? { color: '#fff' } : { color: '#4b5563' },
                          ]}
                        >
                          {g}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
              </View>

              {/* Consent */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setConsent((v) => !v)}
                style={styles.consentRow}
              >
                <View
                  style={[styles.consentBox, consent ? styles.consentBoxOn : styles.consentBoxOff]}
                >
                  {consent ? <Feather name="check" size={14} color="#fff" /> : null}
                </View>
                <Text style={styles.consentLabel}>
                  I agree to the Terms of Service and Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={[styles.bottomWrap, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            style={[styles.ctaBase, (!isFormValid || isSubmitting) && styles.ctaDisabled]}
          >
            {isFormValid && !isSubmitting ? (
              <LinearGradient
                colors={['#7c3aed', '#6d28d9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            {isSubmitting ? (
              <>
                <ActivityIndicator color={isFormValid ? '#fff' : '#9ca3af'} />
                <Text
                  style={[
                    styles.ctaText,
                    { marginLeft: 8, color: isFormValid ? '#fff' : '#9ca3af' },
                  ]}
                >
                  Continuing...
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={[
                    styles.ctaText,
                    { color: isFormValid ? '#fff' : '#9ca3af', marginRight: 8 },
                  ]}
                >
                  Continue
                </Text>
                {isFormValid ? (
                  <MaterialCommunityIcons name="arrow-right" size={22} color="#fff" />
                ) : null}
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function inputStateStyle(hasError: boolean, hasValueOrValid: boolean) {
  if (hasError) return { borderColor: '#fca5a5' };
  if (hasValueOrValid) return { borderColor: '#34d399' };
  return { borderColor: '#ddd6fe' };
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },

  scroll: { paddingHorizontal: 24, paddingBottom: 16 },
  iconWrap: { alignItems: 'center', marginBottom: 12 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ede9fe',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: { fontSize: 13, color: '#4b5563', textAlign: 'center' },

  label: { fontSize: 13, color: '#374151', marginBottom: 8, fontWeight: '600' },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
    borderRadius: 16,
    color: '#111827',
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
  textarea: { textAlignVertical: 'top' },

  errorText: { color: '#ef4444', fontSize: 12, marginTop: 6, paddingHorizontal: 6 },

  genderRow: { flexDirection: 'row', gap: 8 },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  genderBtnSelected: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  genderBtnIdle: { backgroundColor: '#fff', borderColor: '#ddd6fe' },
  genderText: { textAlign: 'center', fontSize: 14, fontWeight: '600' },

  consentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  consentBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  consentBoxOff: { backgroundColor: '#fff', borderColor: '#d1d5db' },
  consentBoxOn: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  consentLabel: { flex: 1, color: '#4b5563', fontSize: 12 },

  privacyBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#ede9fe',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  privacyDotWrap: { paddingTop: 2 },
  privacyDotOuter: {
    width: 20,
    height: 20,
    backgroundColor: '#ddd6fe',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyDotInner: { width: 8, height: 8, backgroundColor: '#7c3aed', borderRadius: 4 },
  privacyTitle: { color: '#4c1d95', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  privacyText: { color: '#6d28d9', fontSize: 12, lineHeight: 16 },

  bottomWrap: { paddingHorizontal: 24, paddingTop: 8 },
  ctaBase: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  ctaDisabled: { backgroundColor: '#e5e7eb' },
  ctaText: { fontWeight: '700', fontSize: 16 },
  checkWrap: {
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  progressRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 8 },
  progressBar: { width: 32, height: 4, borderRadius: 2 },
});
