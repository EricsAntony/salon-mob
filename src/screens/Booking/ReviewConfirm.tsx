import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ErrorBanner from '../../components/ErrorBanner';

// Types for incoming params
export type ConfirmItem = {
  id: string;
  name: string;
  duration: string;
  price: number;
  category?: string;
};

type Params = {
  items: ConfirmItem[];
  stylist?: string;
  appointmentDate?: string; // e.g., 'Saturday, July 20'
  appointmentTime?: string; // e.g., '10:00 AM'
  heroImageUrl?: string;
  salonName?: string;
  addressLine?: string; // e.g., '123 Main St, Anytown, USA'
  phone?: string; // e.g., '(555) 123-4567'
};

export default function ReviewConfirm() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {
    items = [],
    stylist = 'Any',
    appointmentDate,
    appointmentTime,
    heroImageUrl,
    salonName = 'Selected Salon',
    addressLine,
    phone,
  } = (route.params || {}) as Params;

  const [bannerError, setBannerError] = useState<string | null>(null);
  const [upiApp, setUpiApp] = useState<string | null>(null);

  const subtotal = useMemo(() => items.reduce((s, it) => s + (it.price || 0), 0), [items]);
  const taxRate = 0.08;
  const taxes = useMemo(() => Math.round(subtotal * taxRate * 100) / 100, [subtotal]);
  const total = useMemo(() => Math.round((subtotal + taxes) * 100) / 100, [subtotal, taxes]);

  const dateTimeLine = useMemo(() => {
    const d = appointmentDate ? appointmentDate : undefined;
    const t = appointmentTime ? appointmentTime : undefined;
    if (d && t) return `${d} · ${t}`;
    if (d) return d;
    if (t) return t;
    return undefined;
  }, [appointmentDate, appointmentTime]);

  const stylistLine = stylist && stylist !== 'Any' ? `With ${stylist}` : 'With Any Stylist';

  useEffect(() => {
    if (bannerError && upiApp) setBannerError(null);
  }, [bannerError, upiApp]);

  const canConfirm = !!upiApp;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerIcon} onPress={() => navigation.goBack()} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#141118" />
        </Pressable>
        <Text style={styles.headerTitle}>Review & Confirm</Text>
        <View style={styles.headerSpacer} />
        {!!bannerError && (
          <View style={styles.bannerOverlay} pointerEvents="box-none">
            <ErrorBanner
              message={bannerError}
              onDismiss={() => setBannerError(null)}
              style={{ marginHorizontal: 0 }}
            />
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Salon card */}
        <View style={{ padding: 16 }}>
          <View style={styles.salonCard}>
            <ImageBackground
              source={{
                uri:
                  heroImageUrl ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuA18EoRKMCjmfldih9rQJxymjjE_wLxMYvYRK5LuOH6AKwmMbQVz0nz5YhKjtFJ_22XzxRtxt_yUwZlLHJpmY1TkoEmAKbkcevufFPXy0Emk9Srv2tbn3XVPP-uty03BNZMvmEtC_46KgmW0-_2agsFWHQfLVAgOeU5xAGF70pvuYr9zxfVe6DChKy517vefyorVvtnqiauoUBy7HFAT_LrpGAUbjEEuBcvhRXrJ-NLh5dik4mqx9kETc2wpS_M0wgAi7ioWXDuVyU',
              }}
              resizeMode="cover"
              style={styles.salonImage}
              imageStyle={{ borderRadius: 12 }}
            />
            <View style={styles.salonInfo}>
              <Text style={styles.salonSubtitle}>Background shading</Text>
              <Text style={styles.salonTitle}>{salonName}</Text>
              {!!(addressLine || dateTimeLine) && (
                <View style={{ marginTop: 4 }}>
                  {!!addressLine && (
                    <Text style={styles.salonMeta}>
                      {addressLine}
                      {dateTimeLine ? ' · ' + dateTimeLine : ''}
                    </Text>
                  )}
                  {!addressLine && !!dateTimeLine && (
                    <Text style={styles.salonMeta}>{dateTimeLine}</Text>
                  )}
                </View>
              )}
              {!!phone && <Text style={styles.salonMeta}>{phone}</Text>}
            </View>
          </View>
        </View>

        {/* Services */}
        <Text style={styles.sectionTitle}>Services</Text>
        {items.map((it) => (
          <View key={it.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{it.name}</Text>
              <Text style={styles.rowMeta}>{stylistLine}</Text>
            </View>
            <Text style={styles.rowPrice}>${it.price}</Text>
          </View>
        ))}

        {/* Payment */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Payment</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Subtotal</Text>
            <Text style={styles.rowMeta}>${subtotal.toFixed(2)}</Text>
          </View>
          <Text style={styles.rowPrice}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Taxes</Text>
            <Text style={styles.rowMeta}>${taxes.toFixed(2)}</Text>
          </View>
          <Text style={styles.rowPrice}>${taxes.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Total</Text>
            <Text style={styles.rowMeta}>${total.toFixed(2)}</Text>
          </View>
          <Text style={styles.rowPrice}>${total.toFixed(2)}</Text>
        </View>

        {/* Payment Options: UPI-only card */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Payment Options</Text>
        <View style={{ paddingHorizontal: 16 }}>
          <View style={styles.upiCard}>
            <View
              style={[
                styles.row,
                { minHeight: 48, paddingHorizontal: 16, paddingVertical: 8, paddingRight: 26 },
              ]}
            >
              <View style={styles.optionLeft}>
                <MaterialCommunityIcons name="currency-inr" size={18} color="#141118" />
                <Text style={[styles.rowTitle, { fontSize: 14 }]}>Pay by any UPI App</Text>
              </View>
            </View>

            {[
              {
                key: 'swiggy',
                title: 'Unlock Swiggy UPI',
                subtitle: 'Activate fastest UPI in 10 seconds.',
                icon: 'flash-outline',
                badge: 'NEW',
              },
              { key: 'gpay', title: 'Google Pay', icon: 'google' },
              {
                key: 'phonepe',
                title: 'PhonePe UPI',
                subtitle:
                  'Up to ₹100 cashback using RuPay Credit Card on UPI on transactions above ₹299',
                icon: 'phone-outline',
              },
              { key: 'cred', title: 'CRED UPI', icon: 'alpha-c-circle-outline' },
            ].map((item) => (
              <Pressable
                key={item.key}
                style={[styles.upiItemRow]}
                onPress={() => setUpiApp(item.key)}
              >
                <View style={styles.optionLeft}>
                  <View style={styles.optionIconBox}>
                    <MaterialCommunityIcons name={item.icon as any} size={18} color="#141118" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.optionTitle}>{item.title}</Text>
                      {!!item.badge && (
                        <View style={styles.badgeNew}>
                          <Text style={styles.badgeNewText}>{item.badge}</Text>
                        </View>
                      )}
                    </View>
                    {!!item.subtitle && <Text style={styles.optionSubtitle}>{item.subtitle}</Text>}
                  </View>
                </View>
                <MaterialCommunityIcons
                  name={upiApp === item.key ? 'radiobox-marked' : 'radiobox-blank'}
                  size={22}
                  color="#6C63FF"
                />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View>
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <Pressable
            style={[styles.primaryBtn, !canConfirm && { opacity: 0.5 }]}
            disabled={!canConfirm}
            onPress={() => {
              if (!canConfirm) {
                setBannerError('Please select a UPI app to continue.');
                return;
              }
              navigation.navigate('BookingSuccess', {
                salonName,
                appointmentDate,
                appointmentTime,
              });
            }}
          >
            <Text style={styles.primaryBtnText}>Confirm Booking</Text>
          </Pressable>
        </View>
        <View style={{ height: 5, backgroundColor: '#FFFFFF' }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  headerIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#141118',
    fontSize: 18,
    fontWeight: 'bold',
    paddingRight: 48,
  },
  headerSpacer: { width: 0, height: 0 },
  bannerOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: -8,
    zIndex: 10,
  },

  salonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  salonImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#F3F4F6',
  },
  salonInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  salonSubtitle: {
    color: '#756388',
    fontSize: 13,
  },
  salonTitle: {
    color: '#141118',
    fontSize: 18,
    fontWeight: '700',
  },
  salonMeta: {
    color: '#756388',
    fontSize: 14,
  },

  sectionTitle: {
    color: '#141118',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    minHeight: 72,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  rowTitle: {
    color: '#141118',
    fontSize: 16,
    fontWeight: '600',
  },
  rowMeta: {
    color: '#756388',
    fontSize: 13,
  },
  rowPrice: {
    color: '#141118',
    fontSize: 16,
  },

  optionList: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    // Table-view look: no lines, subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  optionRowSelected: {
    borderColor: '#6C63FF',
  },
  optionText: {
    color: '#141118',
    fontSize: 16,
    fontWeight: '500',
  },

  groupTitle: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  optionTitle: {
    color: '#141118',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    color: '#6B7280',
    fontSize: 12,
  },

  // UPI-only card styles
  upiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  upiItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    paddingRight: 32,
  },
  badgeNew: {
    backgroundColor: '#FF8A00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeNewText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Collapsible bodies and inputs
  optionBody: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: -4,
    marginBottom: 8,
  },
  subRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  chipSelected: {
    backgroundColor: '#EEF2FF',
  },
  chipText: {
    color: '#141118',
    fontSize: 13,
    fontWeight: '500',
  },
  cardRow: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#141118',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  primaryBtn: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
