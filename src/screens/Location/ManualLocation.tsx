import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, TextInput as PaperTextInput } from 'react-native-paper';
import TextInput from '../../components/TextInput';
import { getJson } from '../../utils/network';
import { useAppSelector } from '../../store';
import { API_URL } from '../../utils/env';
import { authedPutJson } from '../../utils/authFetch';
import { storage } from '../../utils/storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { colors } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
// Back button removed per latest request

// Stable, top-level small presentational components to avoid react/no-unstable-nested-components
const Separator = () => (
  <View
    style={{
      height: 12,
      backgroundColor: 'transparent',
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
  const token = useAppSelector((s) => s.auth.token);
  const userId = useAppSelector((s) => s.auth.user?.id);
  // Colors for reference styling
  const VIOLET = '#6C63FF'; // primary accent for interactive elements (app theme)
  const coords = useAppSelector((s) => s.location.coords);
  const navigation = useNavigation<any>();
  const searchAbortRef = useRef<AbortController | null>(null);

  const updateUserAddressRemote = useCallback(
    async (addr: string | null, newCoords: { latitude: number; longitude: number }) => {
      if (!token || !userId) {
        throw new Error('Not authenticated');
      }
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
        lat: newCoords.latitude,
        lng: newCoords.longitude,
        location: addr ?? '',
      };
      const url = `${API_URL}/users/${userId}`;
      // authedPutJson throws on non-2xx or { success: false }
      return authedPutJson(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(cookieStr ? { Cookie: cookieStr } : {}),
          ...(csrfToken ? { 'X-CSRF-Token': String(csrfToken) } : {}),
        },
      });
    },
    [token, userId],
  );

  useEffect(() => {
    const id = setTimeout(async () => {
      // Cancel previous in-flight request if any
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
        searchAbortRef.current = null;
      }

      const q = query.trim();
      if (!q || q.length < 3) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }

      const controller = new AbortController();
      searchAbortRef.current = controller;

      setLoading(true);
      setError(null);
      try {
        // Tune query to reduce server work and latency
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q,
        )}&limit=5&addressdetails=0&countrycodes=in`;
        const { data } = await getJson<NominatimItem[]>(url, {
          headers: {
            'User-Agent': 'salon-mob/1.0',
            Accept: 'application/json',
            'Accept-Language': 'en-IN,en;q=0.9',
            Referer: API_URL,
          },
          signal: controller.signal as any,
          timeoutMs: 15000,
        });
        // If aborted after resolution, ignore
        if (controller.signal.aborted) return;
        setResults((data as any) || []);
      } catch (e: any) {
        // If this request was aborted by a newer query, do not surface error
        if (controller.signal.aborted) return;
        console.error('[ManualLocation] Nominatim search failed', {
          message: e?.message,
          status: e?.status,
          type: e?.type,
          code: e?.code,
        });
        setError(e?.message || 'Failed to search. Please try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 700);

    return () => {
      clearTimeout(id);
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
        searchAbortRef.current = null;
      }
    };
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

  const onPick = async (item: NominatimItem) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      setError(null);
      try {
        await updateUserAddressRemote(item.display_name, { latitude: lat, longitude: lon });
        // Only after successful update, navigate to Dashboard with pending location
        const pending = {
          coords: { latitude: lat, longitude: lon, accuracy: null as any },
          address: item.display_name,
        };
        navigation.navigate(
          'Tabs' as never,
          { screen: 'Home', params: { pendingLocation: pending } } as never,
        );
      } catch (e: any) {
        setError(e?.message || 'Failed to update location. Please try again.');
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
      setError(null);
      try {
        await updateUserAddressRemote(address, {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        const pending = {
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: (pos.coords.accuracy as any) ?? null,
          },
          address,
        };
        navigation.navigate(
          'Tabs' as never,
          { screen: 'Home', params: { pendingLocation: pending } } as never,
        );
      } catch (e: any) {
        setError(e?.message || 'Failed to update location. Please try again.');
      }
    } catch (e) {
      // ignore
    }
  }, [updateUserAddressRemote, navigation]);

  return (
    <View style={styles.container}>
      {/* Header title only (no close button) */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Set location</Text>
      </View>

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
          outlineStyle={{ borderRadius: 14, borderColor: 'transparent' }}
          style={{ backgroundColor: '#F7F7F7' }}
          left={<PaperTextInput.Icon icon="magnify" color="#6B7280" />}
          right={
            query ? (
              <PaperTextInput.Icon
                icon="close-circle-outline"
                onPress={() => setQuery('')}
                forceTextInputFocus={false}
                color="#6B7280"
              />
            ) : undefined
          }
        />
      </View>

      {/* Inline "Use current location" */}
      <View style={{ height: 12 }} />
      <TouchableOpacity onPress={requestLocation} style={styles.useCurrentInline}>
        <MaterialCommunityIcons name="map-marker-outline" size={18} color={VIOLET} />
        <Text style={[styles.useCurrentInlineText, { color: VIOLET }]}> Use current location</Text>
      </TouchableOpacity>

      {/* Spacer before list */}
      <View style={{ height: 12 }} />

      {/* Results */}
      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={{ color: colors.error, marginBottom: 8 }}>{error}</Text> : null}

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
              <View style={styles.leftTile}>
                <MaterialCommunityIcons name="map-marker" size={18} color="#6B7280" />
              </View>
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
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 16, paddingTop: 70 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  closeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 0, fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center' },
  searchWrapper: {
    borderRadius: 14,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  useCurrentInline: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center' },
  useCurrentInlineText: { fontWeight: '600' },
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
  sectionLabel: {
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 8,
    fontSize: 12,
    letterSpacing: 0.6,
  },
  leftTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
