import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Text } from 'react-native-paper';
import * as Location from 'expo-location';
import Button from '../../components/Button';
import { colors } from '../../constants/colors';
import { useAppDispatch, useAppSelector } from '../../store';
import { setLocation } from '../../store/slices/locationSlice';
import { useNavigation } from '@react-navigation/native';
import ErrorBanner from '../../components/ErrorBanner';
import { API_URL } from '../../utils/env';
import { authedPutJson } from '../../utils/authFetch';
import { storage } from '../../utils/storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const GRADIENT_COLORS = ['#ffffff', '#f3e8ff', '#ede9fe'] as const; // white -> purple-100 -> violet-100

export default function LocationGate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const token = useAppSelector((s) => s.auth.token);
  const userId = useAppSelector((s) => s.auth.user?.id);

  // Gentle bob + wobble animation for the hero icon
  const anim = useRef(new Animated.Value(0)).current;
  // Success ripple animation values
  const success = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const updateUserAddressRemote = useCallback(
    async (addr: string | null, coords: { latitude: number; longitude: number }) => {
      if (!token || !userId) {
        return;
      }
      try {
        const cookieSaved = await storage.get<any>('auth.cookies');
        const csrfToken = await storage.get<string>('auth.csrfToken');
        const cookieHeader = typeof cookieSaved === 'string' ? cookieSaved : cookieSaved?.setCookie;
        const cookieStr = cookieHeader
          ? String(cookieHeader)
              .split(/,(?=[^;]+?=)/)
              .map((s) => s.split(';')[0].trim())
              .filter(Boolean)
              .join('; ')
          : undefined;

        const body: any = {
          user_id: userId,
          lat: coords.latitude,
          lng: coords.longitude,
          location: addr ?? '',
        };
        await authedPutJson(`${API_URL}/users/${userId}`, body, {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(cookieStr ? { Cookie: cookieStr } : {}),
            ...(csrfToken ? { 'X-CSRF-Token': String(csrfToken) } : {}),
          },
        });
      } catch (e) {
        // Non-blocking: ignore server update errors
      }
    },
    [token, userId],
  );

  // On mount, auto-request location always (fresh launch should re-detect)
  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestLocation = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      // Permissions
      const perm = await Location.getForegroundPermissionsAsync();
      let status = perm.status;
      if (status !== 'granted') {
        const req = await Location.requestForegroundPermissionsAsync();
        status = req.status;
      }
      if (status !== 'granted') {
        setError(
          'Location permission is required. Please allow access or enter location manually.',
        );
        setLoading(false);
        return;
      }

      // Services enabled (GPS)
      const servicesOn = await Location.hasServicesEnabledAsync();
      if (!servicesOn) {
        setError('Location services are turned off. Please enable GPS/location services.');
        setLoading(false);
        return;
      }

      // Get current position
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      let address: string | null = null;
      try {
        const rev = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        if (rev && rev[0]) {
          const a = rev[0];
          address = [a.name, a.street, a.city, a.region, a.postalCode].filter(Boolean).join(', ');
        }
      } catch {}

      // Success ripple transition, then update store to navigate
      await new Promise<void>((resolve) => {
        success.setValue(0);
        Animated.timing(success, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start(() => resolve());
      });

      dispatch(
        setLocation({
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy ?? null,
          },
          address,
        }),
      );
      // Fire-and-forget remote update
      updateUserAddressRemote(address, {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      // AppNavigator will re-route to MainTabs when location is set
    } catch (e: any) {
      setError(e?.message || 'Failed to get location. Please try manual entry.');
    } finally {
      setLoading(false);
    }
  }, [dispatch, updateUserAddressRemote, success]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENT_COLORS} style={StyleSheet.absoluteFill} />
      {!!error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* No back button as per latest request */}

      {/* Hero icon over soft circular gradient */}
      <View style={styles.heroShadow}>
        <View style={styles.hero}>
          <LinearGradient colors={['#f3e8ff', '#ede9fe']} style={styles.heroGradient} />
          <Animated.View
            style={{
              transform: [
                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
                {
                  rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] }),
                },
              ],
            }}
          >
            <MaterialCommunityIcons
              name="navigation-variant-outline"
              size={84}
              color={colors.primary}
              style={{ opacity: 0.9 }}
            />
          </Animated.View>
          {/* Success ripple */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.successPulse,
              {
                opacity: success.interpolate({
                  inputRange: [0, 0.6, 1],
                  outputRange: [0, 0.35, 0],
                }),
                transform: [
                  {
                    scale: success.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.8] }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>

      <Text style={styles.title}>What is Your Location?</Text>
      <Text style={styles.subtitle}>We need your location to suggest nearby services.</Text>

      <View style={{ height: 16 }} />

      <Button
        mode="contained"
        onPress={requestLocation}
        loading={loading}
        disabled={loading}
        style={styles.button}
        contentStyle={{ paddingVertical: 6 }}
      >
        Allow Location Access
      </Button>

      <View style={{ height: 8 }} />

      <Button
        mode="text"
        onPress={() => navigation.navigate('ManualLocation')}
        disabled={loading}
        style={[styles.button, { backgroundColor: 'transparent' }]}
      >
        Enter Location Manually
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 24,
    paddingTop: 24,
    justifyContent: 'center',
  },
  heroShadow: {
    alignSelf: 'center',
    width: 140,
    height: 140,
    borderRadius: 70,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    marginBottom: 24,
  },
  hero: {
    alignSelf: 'center',
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroGradient: {
    ...(StyleSheet.absoluteFillObject as any),
    borderRadius: 70,
  },
  successPulse: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary,
  },
  button: {
    alignSelf: 'center',
    width: '85%',
    borderRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  primary: { backgroundColor: colors.primary },
});
