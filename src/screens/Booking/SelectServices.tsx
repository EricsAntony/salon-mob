import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ErrorBanner from '../../components/ErrorBanner';

type ServiceItem = {
  id: string;
  name: string;
  duration: string; // e.g., 'Approx. 45 min'
  price: number; // numeric, we'll format with $ in UI
};

type ServiceCategory = {
  id: string;
  title: string;
  items: ServiceItem[];
};

const MOCK_CATEGORIES: ServiceCategory[] = [
  {
    id: 'hair',
    title: 'Hair',
    items: [
      { id: 'haircut', name: 'Haircut', duration: 'Approx. 45 min', price: 30 },
      { id: 'haircut_style', name: 'Haircut & Style', duration: 'Approx. 60 min', price: 25 },
      { id: 'haircut_color', name: 'Haircut & Color', duration: 'Approx. 90 min', price: 40 },
      { id: 'haircut_trim', name: 'Haircut & Trim', duration: 'Approx. 30 min', price: 15 },
      { id: 'haircut_wash', name: 'Haircut & Wash', duration: 'Approx. 60 min', price: 20 },
      {
        id: 'haircut_treatment',
        name: 'Haircut & Treatment',
        duration: 'Approx. 75 min',
        price: 35,
      },
    ],
  },
  {
    id: 'color',
    title: 'Color',
    items: [
      { id: 'color_correction', name: 'Color Correction', duration: 'Approx. 120 min', price: 50 },
      { id: 'color_gloss', name: 'Color Gloss', duration: 'Approx. 60 min', price: 45 },
      { id: 'color_highlights', name: 'Color Highlights', duration: 'Approx. 150 min', price: 60 },
      { id: 'color_ombre', name: 'Color Ombre', duration: 'Approx. 120 min', price: 55 },
      {
        id: 'color_root_touchup',
        name: 'Color Root Touch-Up',
        duration: 'Approx. 90 min',
        price: 70,
      },
      {
        id: 'color_single_process',
        name: 'Color Single Process',
        duration: 'Approx. 120 min',
        price: 65,
      },
    ],
  },
  {
    id: 'styling',
    title: 'Styling',
    items: [
      { id: 'blowout', name: 'Blowout', duration: 'Approx. 45 min', price: 20 },
      { id: 'braids', name: 'Braids', duration: 'Approx. 60 min', price: 25 },
      { id: 'extensions', name: 'Extensions', duration: 'Approx. 90 min', price: 30 },
      { id: 'updo', name: 'Updo', duration: 'Approx. 75 min', price: 35 },
    ],
  },
];

export default function SelectServices() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const heroImageUrl: string | undefined = route.params?.heroImageUrl;

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [openCats, setOpenCats] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MOCK_CATEGORIES.map((c) => [c.id, false])),
  );
  const [bannerError, setBannerError] = useState<string | null>(null);

  useEffect(() => {
    // Avoid no-op warning in New Architecture (Fabric)
    // @ts-ignore
    const isFabric = !!global?.nativeFabricUIManager;
    if (
      Platform.OS === 'android' &&
      !isFabric &&
      (UIManager as any).setLayoutAnimationEnabledExperimental
    ) {
      (UIManager as any).setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCategory = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenCats((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const { count, total } = useMemo(() => {
    let c = 0;
    let t = 0;
    for (const cat of MOCK_CATEGORIES) {
      for (const it of cat.items) {
        if (selected[it.id]) {
          c += 1;
          t += it.price;
        }
      }
    }
    return { count: c, total: t };
  }, [selected]);

  const selectedItems = useMemo(() => {
    const arr: Array<{
      id: string;
      name: string;
      duration: string;
      price: number;
      category: string;
    }> = [];
    for (const cat of MOCK_CATEGORIES) {
      for (const it of cat.items) {
        if (selected[it.id]) {
          arr.push({ ...it, category: cat.title });
        }
      }
    }
    return arr;
  }, [selected]);

  useEffect(() => {
    if (bannerError && selectedItems.length > 0) {
      setBannerError(null);
    }
  }, [bannerError, selectedItems.length]);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerIcon} onPress={() => navigation.goBack()} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#141118" />
        </Pressable>
        <Text style={styles.headerTitle}>Select Services</Text>
        <View style={styles.headerSpacer} />
        {/* Floating error banner overlayed under header without affecting layout */}
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
        {MOCK_CATEGORIES.map((cat) => {
          const isOpen = !!openCats[cat.id];
          const selectedCount = cat.items.reduce((acc, it) => acc + (selected[it.id] ? 1 : 0), 0);
          return (
            <View key={cat.id}>
              {/* Category header row */}
              <Pressable onPress={() => toggleCategory(cat.id)} style={styles.categoryRow}>
                <View style={styles.categoryAccent} />
                <Text numberOfLines={1} style={styles.categoryTitle}>
                  {cat.title}
                </Text>
                <View style={{ flex: 1 }} />
                {selectedCount > 0 && (
                  <View style={styles.countPill}>
                    <Text style={styles.countPillText}>{selectedCount}</Text>
                  </View>
                )}
                <View style={styles.caretWrap}>
                  <MaterialCommunityIcons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color="#141118"
                  />
                </View>
              </Pressable>

              {/* Items */}
              {isOpen && (
                <View style={styles.itemsCard}>
                  {cat.items.map((it, idx) => {
                    const isChecked = !!selected[it.id];
                    return (
                      <Pressable
                        key={it.id}
                        onPress={() => toggle(it.id)}
                        style={[
                          styles.itemRow,
                          idx > 0 && styles.itemDivider,
                          styles.itemIndented,
                          isChecked && styles.itemRowSelected,
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.itemTitle, isChecked && styles.itemTitleSelected]}>
                            {it.name}
                          </Text>
                          <Text style={[styles.itemMeta, isChecked && styles.itemMetaSelected]}>
                            {it.duration}
                          </Text>
                          <Text style={[styles.itemMeta, isChecked && styles.itemMetaSelected]}>
                            ${it.price}
                          </Text>
                        </View>
                        {/* Intentionally NO right arrow icon per requirement */}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Footer summary card (tap to go to date/time) */}
      <View>
        <View style={{ padding: 16 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (selectedItems.length === 0) {
                setBannerError('Please select at least one service to continue.');
                return;
              }
              navigation.navigate('SelectDateTime', {
                items: selectedItems,
                heroImageUrl,
                salonName: route.params?.salonName,
              });
            }}
            style={styles.summaryCard}
          >
            <View style={{ flex: 2 }}>
              <Text style={styles.summaryCount}>
                {count} {count === 1 ? 'service' : 'services'}
              </Text>
              <Text style={styles.summaryPrice}>${total}</Text>
              <Text style={styles.summaryNext}>Next: Assign Stylist & Time</Text>
            </View>
            <ImageBackground
              source={{
                uri:
                  heroImageUrl ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuCmtQM-EL8D-FXwhTiboLOCVAM0BBZvAtOsW8E6PvfoafqneVCS4t7gVtztRW5Da6eJ25Dq87cfA_zs20S9KwG02dBIAtW4S86FmY_iN9RIF1JJRT8DffjwBOarmMsp-wdEVFTJ077_ayppEtQZA1mqICB0Hp0HrnhKZuLKZ9fl3FBA-IkbknhIc7JSfqvfz7mnftwtx-Z69xDQfy-pLE10EHEv08HTRx4go-2hugjmsGfOHl_I9k4lqBH4h5GJmOIAoT4mrDpsmPs',
              }}
              resizeMode="cover"
              style={styles.summaryImage}
              imageStyle={{ borderRadius: 12 }}
            />
          </Pressable>
        </View>
        <View style={{ height: 5, backgroundColor: '#FFFFFF' }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
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
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#141118',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    paddingRight: 48,
  },
  headerSpacer: { width: 48 },
  bannerOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: -8,
    zIndex: 10,
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 56,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginHorizontal: 12,
    marginTop: 8,
  },
  categoryAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#6C63FF',
    marginRight: 10,
  },
  categoryTitle: {
    color: '#141118',
    fontSize: 18,
    fontWeight: '700',
  },
  caretWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPill: {
    backgroundColor: '#EFEEFF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
  },
  countPillText: {
    color: '#6C63FF',
    fontSize: 12,
    fontWeight: '700',
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  itemIndented: {
    paddingLeft: 28,
  },
  itemRowSelected: {
    backgroundColor: '#EFEEFF',
    borderLeftWidth: 4,
    borderLeftColor: '#6C63FF',
  },
  itemDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8E6EF',
  },
  itemTitle: {
    color: '#141118',
    fontSize: 15,
    fontWeight: '600',
  },
  itemTitleSelected: {
    color: '#141118',
  },
  itemMeta: {
    color: '#756388',
    fontSize: 13,
    marginTop: 2,
  },
  itemMetaSelected: {
    color: '#756388',
  },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    // Violet shadow/glow (iOS) + elevation (Android)
    shadowColor: '#6C63FF',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  itemsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 12,
    marginTop: 6,
    overflow: 'hidden',
  },
  summaryCount: {
    color: '#756388',
    fontSize: 13,
  },
  summaryPrice: {
    color: '#141118',
    fontSize: 16,
    fontWeight: '700',
  },
  summaryNext: {
    color: '#756388',
    fontSize: 13,
  },
  summaryImage: {
    flex: 1,
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginLeft: 16,
  },
});
