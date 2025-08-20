import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, TextInput as PaperTextInput } from 'react-native-paper';
import TextInput from '../../components/TextInput';
import { getJson } from '../../utils/network';
import { useAppDispatch, useAppSelector } from '../../store';
import { setLocation } from '../../store/slices/locationSlice';
import { API_URL } from '../../utils/env';
import { putJson } from '../../utils/network';
import { storage } from '../../utils/storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { colors } from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
// Back button removed per latest request

// Stable, top-level small presentational components to avoid react/no-unstable-nested-components
const Separator = () => (
  <View
    style={{
      height: 2,
      backgroundColor: '#ddd6fe',
      marginLeft: 0,
      opacity: 1,
    }}
  />
);
const Empty = () => <Text style={{ color: '#6B7280' }}>No results</Text>;

interface NominatimItem {
  display_name: string;
  lat: string;
  lon: string;
}

export default function ManualLocation() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const userId = useAppSelector((s) => s.auth.user?.id);
  const GRADIENT_COLORS = ['#ffffff', '#f3e8ff', '#ede9fe'] as const; // white -> purple-100 -> violet-100
  const savedAddr = useAppSelector((s) => s.location.address);
  const coords = useAppSelector((s) => s.location.coords);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

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
          lat: coords.latitude,
          lng: coords.longitude,
          ...(addr ? { location: addr } : {}),
        };
        await putJson(`${API_URL}/users/${userId}`, body, {
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

  useEffect(() => {
    const id = setTimeout(async () => {
      if (!query || query.trim().length < 3) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query.trim(),
        )}&limit=10`;
        const { data } = await getJson<NominatimItem[]>(url, {
          headers: {
            'User-Agent': 'salon-mob/1.0',
            Accept: 'application/json',
          },
        });
        setResults((data as any) || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to search. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(id);
  }, [query]);

  const distanceKm = useCallback(
    (lat: number, lon: number) => {
      if (!coords?.latitude || !coords?.longitude) return null;
      const toRad = (v: number) => (v * Math.PI) / 180;
      const R = 6371; // km
      const dLat = toRad(lat - coords.latitude);
      const dLon = toRad(lon - coords.longitude);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coords.latitude)) *
          Math.cos(toRad(lat)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;
      return d;
    },
    [coords],
  );

  const onPick = (item: NominatimItem) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      dispatch(
        setLocation({
          coords: { latitude: lat, longitude: lon, accuracy: null },
          address: item.display_name,
        }),
      );
      updateUserAddressRemote(item.display_name, { latitude: lat, longitude: lon });
      if (route?.params?.from === 'dashboard') {
        navigation.navigate('Tabs' as never, { screen: 'Home' } as never);
      }
    }
  };

  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
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
      updateUserAddressRemote(address, {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      if (route?.params?.from === 'dashboard') {
        navigation.navigate('Tabs' as never, { screen: 'Home' } as never);
      }
    } catch (e) {
      // ignore
    }
  }, [dispatch, updateUserAddressRemote]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENT_COLORS} style={StyleSheet.absoluteFill} />
      {/* No back button as per latest request */}

      <Text style={styles.title}>Select Your Location</Text>

      {/* Search input - pill */}
      <View style={{ height: 16 }} />
      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="Search an area or address"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          mode="outlined"
          outlineStyle={{ borderRadius: 999, borderColor: 'transparent' }}
          style={{ backgroundColor: '#F3F4F6' }}
          left={<PaperTextInput.Icon icon="magnify" />}
        />
      </View>

      {/* Use Current Location - card button */}
      <View style={{ height: 12 }} />
      <TouchableOpacity onPress={requestLocation} style={styles.useCurrentBtn}>
        <View style={styles.useCurrentIcon}>
          <MaterialCommunityIcons name="navigation-variant" size={18} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.useCurrentTitle}>Use Current Location</Text>
          <Text style={styles.useCurrentSubtitle}>Automatically detect your location</Text>
        </View>
        <View style={styles.useCurrentCheck}>
          <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Current Location - redesigned card */}
      <View style={{ height: 24 }} />
      <Text style={styles.sectionLabel}>Current</Text>
      {!!savedAddr && (
        <View style={styles.currentCard}>
          <View style={styles.currentLeft}>
            <View style={styles.currentIconWrap}>
              <MaterialCommunityIcons name="map-marker" size={18} color="#9CA3AF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.currentTitle}>Current Location</Text>
              <Text numberOfLines={1} style={styles.currentSubtitle}>{savedAddr}</Text>
            </View>
          </View>
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>Using</Text>
          </View>
        </View>
      )}

      {/* Results */}
      <View style={{ height: 16 }} />
      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={{ color: colors.error, marginBottom: 8 }}>{error}</Text> : null}
      {!!results.length && (
        <Text style={styles.sectionLabel}>SUGGESTIONS</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item, idx) => item.lat + ':' + item.lon + ':' + idx}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingVertical: 6 }}
        renderItem={({ item }) => {
          // simple split for a subtitled look
          const [title, ...rest] = item.display_name.split(',');
          const subtitle = rest.join(', ').trim();
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          const dist = Number.isFinite(lat) && Number.isFinite(lon) ? distanceKm(lat, lon) : null;
          const distLabel = dist == null ? null : dist < 0.1 ? '0 km' : `${dist.toFixed(1)} km`;
          return (
            <TouchableOpacity onPress={() => onPick(item)} style={styles.itemRow}>
              <MaterialCommunityIcons name="map-marker" size={22} color="#9CA3AF" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text numberOfLines={1} style={styles.itemTitle}>
                  {title}
                </Text>
                {!!subtitle && (
                  <Text numberOfLines={2} style={styles.itemSubtitle}>
                    {subtitle}
                  </Text>
                )}
              </View>
              {!!distLabel && <Text style={styles.itemDistance}>{distLabel}</Text>}
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={!loading && query.length >= 3 ? <Empty /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent', padding: 16, paddingTop: 56 },
  title: { marginTop: 16, fontSize: 20, fontWeight: '600', color: '#111827', textAlign: 'center' },
  searchWrapper: {
    borderRadius: 999,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  pillsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
  },
  pillText: { marginLeft: 8, color: '#0B1220', fontWeight: '600' },
  currentRow: { flexDirection: 'row', alignItems: 'center' },
  currentText: { marginLeft: 8, color: '#0B1220', fontSize: 16 },
  // Align current location row with the start of the text inside the search pill
  currentRowAligned: { marginLeft: 12 },
  // Use Current Location card button (web design parity)
  useCurrentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ede9fe', // violet-100
    backgroundColor: '#f5f3ff',
  },
  useCurrentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  useCurrentTitle: { color: '#6D28D9', fontWeight: '700' }, // violet-700
  useCurrentSubtitle: { color: '#7C3AED', fontSize: 12 }, // violet-600
  useCurrentCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sectionLabel: { color: '#6B7280', marginTop: 12, marginBottom: 8, fontSize: 12, letterSpacing: 0.6 },
// ... (rest of the code remains the same)
  // Boxed suggestions container
  suggestionsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 2,
    shadowColor: '#111827',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#111827',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  savedIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  savedTitle: { color: '#0B1220', fontWeight: '700', marginBottom: 2 },
  savedSubtitle: { color: '#6B7280', fontSize: 12 },
  currentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#111827',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  currentLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  currentIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currentTitle: { color: '#0B1220', fontWeight: '700', marginBottom: 2 },
  currentSubtitle: { color: '#6B7280', fontSize: 12 },
  currentBadge: {
    backgroundColor: '#DCFCE7', // green-100
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#86EFAC', // green-300
  },
  currentBadgeText: { color: '#15803D', fontWeight: '700', fontSize: 11 }, // green-700
  suggestionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    shadowColor: '#111827',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  itemTitle: { color: '#0B1220', fontWeight: '600' },
  itemSubtitle: { color: '#6B7280', marginTop: 2, fontSize: 12 },
  itemDistance: { color: '#9CA3AF', fontSize: 12, marginLeft: 8 },
});
