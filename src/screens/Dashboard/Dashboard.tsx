import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store';
import { setLocation } from '../../store/slices/locationSlice';

// Dashboard screen replicating the provided HTML layout as closely as possible
// Using React Native primitives and @expo/vector-icons for icons

const featureCards = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDhBTO0whkAnf8dX4aHqxrmDNNl_vlAYakqkCkUWC7vWKxB7TW4pTIDuye1Grp0Y7gUBgwCW9mawzw7DeHFyr-NlREE8au1ymEHCs68AaRMI2q-wUxVXioxgwpas2Z_1dPEclkTryaSjMkmspDA1QvqxfmUF5fgLFYwJSTsjzU7ZqK-5gh8KRVXrI8F4vtD7MDWeR-lZl6kS00fSXoNTrsmNqSAYTvLzV5PxYzlid0jU5BwlV3g4whgUNYJ_IiUkIpFup9-P8H-NI4',
    title: 'Book your next appointment with us',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCXQ4JkxXB5xhl60KMs0wKaFyZ23TvomxyB4LkR-W2r8W9u-sqAGlJnJR6lq3GlG67hmRhWl2hOWh5mdTVb060VrKGE8qnfiBUeCko5NZLm_GjbAVajDVKkjM5QklVC5uySDqaGThyece8jRNDh5_SWB_nqfH0NjCztlYR5GpW2fLWOi3Za8gO7wueq240-2DAVUaXpv4t2R1ALHm6PudX1oMv_NXxcdLHAPAWAOKk333Bi_Yzh1ku3RJhwOU5G087PricEsjv5qrU',
    title: 'Find the best salons near you',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDlNNkUDPPsy8ZN7TTfOjrmc8_aVLstPzpH-6bJAOvW4MGC0zm7d6dp-4GEF3NL7E2KokS_83zWTIOrsc-qu4WjeEV-5IMJoQsxVQwmwcRYdHCUcpEH_FmvaJnWefToCCT7yqYaAZ50qJKiFJI3fleq8XM8QSR5Bs9KyrCcfx21Itm9FkgTpn9baxoC19M7ajM9idKeYxAf7Kyt3hhZlVTjaZShAzRViEa2o62RQPqVk1Pa99XLR3XTu8nNZmcJXJH1GTE0YqMPiYc',
    title: 'Enjoy a seamless booking experience',
  },
];

const services = [
  { key: 'haircut', label: 'Haircut', icon: 'content-cut' },
  { key: 'spa', label: 'Spa', icon: 'shower' },
  { key: 'manicure', label: 'Manicure', icon: 'hand-back-right' },
  { key: 'pedicure', label: 'Pedicure', icon: 'shoe-heel' },
  { key: 'massage', label: 'Massage', icon: 'hand-coin' },
];

const topRated = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBwAofBO-dErClKSl4mxC8M4QW22AG75BnUSd0kzj3QKQXxDyEW0X4CbMkUrlAiHBNAzX8f1pn9D2IFmVJJ4mGk_gyd5P_LnUdYCFXobY3UpZeFIMMaJNmX8SaikvFmviNTGBPbTHK-qUeidUv8_9axCw8T9hMg0eOTLjASDyxGmugSlxbi6S_suXw_04qYbMqiKFHaBovVEstSjihmorhjIlg7DjHCVppw0NNQvCYvpBI-ekaYa8R_xMswT24rwSgJWHcHRpl41hc',
    name: 'The Hair Lounge',
    meta: '4.8 • 120 reviews',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC2SCMddfVBhB78IWPMtC-3yXZ0AfN_ys6m4cyXYafe9bFaiyrPxjjux4aHC2Xs9SC8Zbqgr7QUae5FYLARrtL5OA12vHicv-7GHZSU7spwCgAB-LLKbeVWYGipPmNilBJmfGj3aBYE5qfXjI4gsGUOWLkgnkiIaaCFnvucCDjAXn1wmgMS09hr2vFgwEW7rIu4UlpNlK-tUK9J_65132h-DcNo12_n--KWM9R1DGvHMibvfturje0ljC5aO6sR8ulZcKgbnfbHAiU',
    name: 'Serenity Spa',
    meta: '4.9 • 150 reviews',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBf8aWH9xahW22zEO7jDz0d-fG7sXdPDH4nx5bFS69eAxrTGL6KQZU9CWflNA-_8U_JadN87NF1ie_U0f7cXXbmqZdBrNLpY2VhbjFyOSZn_r9dIx5ENFZTGiyuu9TjLYsH72X1w1qi0xWt9V_KlSQDL6tUbOk9ywECk1ZaqM9g2PfXeWaKXsxF_wWbgUB0_SNXGMv7ru_QKTftVADlLG4EIOblZCsYIL7bL1CSiyLK3Ai2Qh3D8DoZeLM-3__Ztj2HSyHDGDk4kp8',
    name: 'Nail Haven',
    meta: '4.7 • 90 reviews',
  },
];

const visited = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuADnAKlPJICoq1rCzSJnehmy3v4JS_jn5k9hSAYtshNwtE73pcc3HjfJ2sRy0ynhvGrSzgB4IHRYXfxNjH9o_Y5nT5YRr6GN7SmH7KgEos40bps-RiY7AhTjQVKJn6qdxiwZF8GVYEjJKNnBgIJdFO0jKz1cWa6AAq-NH2wHBfhLpXz4j0NH3Q2-EWONTYY0tIjLntpVFMlFmxAxAoTT1ROqV0PdECaPqXv5VZiP0zxb4yeKgxPSerGZpJWhD740Njsngjq7NES66s',
    name: 'Glamour Studio',
    meta: '4.6 • 100 reviews',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCmgDhgdVWQQrbgWOFeboB2-q7o-maA7cO9rxzs8yV8c46KAlDiVfPPbzjewrd5_ynIk6zk49HZRcJPI7nB2n6w3NN2X_MFGQoBueCAPYhcTjkSEmvDWMmG5aUyaWHFAd9O9-hRbfdDu5jFFjmK7bwPiQmZHOUg-OlYhwPNPBPDj6RhbOmGzWU0dQiK1HPYSp9wSDlgclgU-x57SqGOVRuN7IUXeFd3CObKz0ny6K3cHUMpE1T1ORA0ErZvOxBKzT2dIz4xcHvjLzg',
    name: 'Relaxation Retreat',
    meta: '4.7 • 110 reviews',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAHtb8eFbnOfcDG6trlo7JiCHPOXZIpoU_5pTAPeNBgyJ4MlnYGGznvxzNoCkw6SWeAV1JmNPBVHQgS4yigul_VnBkKsbKDoH9E3CDeq972-T994dGKMolq5NF6FaCjkJOrBWCarZpRtEA1eQU1rRcd8sh1SOvShCYdhv7dv14GwuWjgKxSUKSZf57DZQimQf549MwLbJ_PAunCsuXdi8a6aTQUGCIu-6-k_rIO8oo0htgxKPzPnutCspKGDwiynbpU3XJLoCdE-U8',
    name: 'Polished Nails',
    meta: '4.5 • 80 reviews',
  },
];

const nearby = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDsM4aFnwOF-EYcYiOzIr30vChdubTs3rUwilsuyXxxYTl_qiRp31-WrPW3lSE1vYftzS_2mt3PJpDbTflm9a_KwWjanJbX1Z9xsK6ZwYgDiAtNM54YJwG2nWlYx9WQF8p8N9_YJLIujItlweDq8tCNfqd4K9LWOSNT_Eb7L1CMema1yg9vN8psVf3a2ovPx_RRaMYSP055nFNqrrxKl-9DZwungJ_A-mrjX3VkJrdpjUsxKSsGOH5AW49rdmI3NAzkRc91ELRO5NA',
    name: 'Chic Cuts',
    addr: '123 Elm Street • 1.2 km',
    meta: '4.5 • 80 reviews',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAj3DJ-FnCo-m-X1WqJPhyGDidRbLopFPvOcgYsCc_wQEslj14M9l7JLzi1tMER1rGJlKpfKo0-znMtvLGwa-5L2vJPfsBfGG5yQNWk3uiPD6h5LeLtI3EFWpqReGUfc3MdnS8oUglIIf5MLFfZGcjwBEYWWYKE2Dmk9gwTp2NSpGRIyqS-boWJR06NTzxylmV68y2ismfE1imiUhkXT15mawgjq_DNMAi-pfT5lRyq7QtZPSm4UHY5qDjdToL9lqg7yruvv2jDl8E',
    name: 'Tranquil Spa',
    addr: '456 Oak Avenue • 0.8 km',
    meta: '4.8 • 130 reviews',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD1D13unv18JH3KdxX_-kXIiRowZ45RuA7iWxe73Z8OQ20evhcdAI9cQyoxPSL6S_irZhuVfPhmALey7ZVfdnInkK184TJjvc1BICMTLQqj4uQ407AQGSIAxupqwoHYD2cje7F6vo479RF6fX6lCxJojqwH3XI2obGeWQuuDUXsQxqtP6Ma27Bww0kMnPABQoEnmpz5YfHebh5XUirMTsJNJrjuH9Qf9kA-qL7Wu-HCjuCW7qUvI0YtXP8DFV-iktQtxO_nAcY0xQM',
    name: 'Elegant Nails',
    addr: '789 Pine Lane • 1.5 km',
    meta: '4.6 • 100 reviews',
  },
];

export default function Dashboard() {
  const [nearbyMode, setNearbyMode] = useState<'List' | 'Map'>('List');
  const [featureIndex, setFeatureIndex] = useState(0);
  const screenWidth = useMemo(() => Dimensions.get('window').width, []);
  const carouselRef = useRef<ScrollView>(null);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const savedAddr = useAppSelector((s) => s.location.address);

  useEffect(() => {
    const timer = setInterval(() => {
      setFeatureIndex((prev) => {
        const next = (prev + 1) % featureCards.length;
        carouselRef.current?.scrollTo({ x: next * screenWidth, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [screenWidth]);

  // Apply pending location only after successful backend update
  useEffect(() => {
    const pending = (route as any)?.params?.pendingLocation;
    if (pending) {
      dispatch(setLocation(pending));
      // Clear the param to avoid re-dispatching on re-render/focus
      navigation.setParams?.({ pendingLocation: undefined });
    }
  }, [route, dispatch, navigation]);

  const header = useMemo(() => {
    const fallback = 'San Francisco, 123 Main Street';
    const full = (savedAddr && savedAddr.trim().length > 0 ? savedAddr : fallback) as string;
    const parts = full.split(',');
    const main = (parts[0] || 'San Francisco').trim();
    const rest = parts.slice(1).join(', ').trim();
    return (
      <View style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <Pressable
            style={styles.addressWrap}
            onPress={() =>
              navigation.navigate('ManualLocation' as never, { from: 'dashboard' } as never)
            }
          >
            <View style={styles.addressRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color="#141118" />
              <Text style={styles.addressMain} numberOfLines={1}>
                {main}
              </Text>
            </View>
            {!!rest && (
              <Text style={styles.addressRest} numberOfLines={1}>
                {rest}
              </Text>
            )}
          </Pressable>
          <Pressable style={styles.iconRightBtn}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#141118" />
          </Pressable>
        </View>
      </View>
    );
  }, [savedAddr, navigation]);

  return (
    <View style={styles.container}>
      {header}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Feature cards carousel (paging) */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          ref={carouselRef}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
            setFeatureIndex(idx);
          }}
        >
          {featureCards.map((c, idx) => (
            <View key={idx} style={{ width: screenWidth }}>
              <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
                <ImageBackground
                  source={{ uri: c.image }}
                  resizeMode="cover"
                  style={styles.featureImage}
                  imageStyle={styles.featureImageRadius}
                />
                <Text style={styles.featureTitle}>{c.title}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.dotsRow}>
          {featureCards.map((_, i) => (
            <View key={i} style={[styles.dot, i === featureIndex && styles.dotActive]} />
          ))}
        </View>

        {/* Services */}
        <Text style={styles.sectionTitle}>Services</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.servicesRow}>
            {services.map((s) => (
              <View key={s.key} style={styles.serviceChip}>
                <MaterialCommunityIcons name={s.icon as any} size={20} color="#141118" />
                <Text style={styles.serviceLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Top Rated */}
        <Text style={styles.sectionTitle}>Top Rated Salons</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.hListPad}>
            {topRated.map((s, idx) => (
              <Pressable
                key={idx}
                style={styles.squareCard}
                onPress={() =>
                  navigation.navigate(
                    'SalonDetail' as never,
                    {
                      name: s.name,
                      heroImageUrl: s.image,
                    } as never,
                  )
                }
              >
                <ImageBackground
                  source={{ uri: s.image }}
                  resizeMode="cover"
                  style={styles.squareImage}
                  imageStyle={styles.squareImageRadius}
                />
                <View>
                  <Text style={styles.cardTitle}>{s.name}</Text>
                  <Text style={styles.cardMeta}>{s.meta}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Previously Visited */}
        <Text style={styles.sectionTitle}>Previously Visited</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.hListPad}>
            {visited.map((s, idx) => (
              <Pressable
                key={idx}
                style={styles.squareCard}
                onPress={() =>
                  navigation.navigate(
                    'SalonDetail' as never,
                    {
                      name: s.name,
                      heroImageUrl: s.image,
                    } as never,
                  )
                }
              >
                <ImageBackground
                  source={{ uri: s.image }}
                  resizeMode="cover"
                  style={styles.squareImage}
                  imageStyle={styles.squareImageRadius}
                />
                <View>
                  <Text style={styles.cardTitle}>{s.name}</Text>
                  <Text style={styles.cardMeta}>{s.meta}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Nearby */}
        <Text style={styles.sectionTitle}>Nearby Salons</Text>
        <View style={styles.segmentWrap}>
          {(['List', 'Map'] as const).map((mode) => {
            const checked = nearbyMode === mode;
            return (
              <Pressable
                key={mode}
                onPress={() => setNearbyMode(mode)}
                style={[styles.segmentBtn, checked && styles.segmentBtnChecked]}
              >
                <Text style={[styles.segmentLabel, checked && styles.segmentLabelChecked]}>
                  {mode}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {nearbyMode === 'List' ? (
          <View>
            {nearby.map((s, idx) => (
              <Pressable
                key={idx}
                style={styles.nearbyRow}
                onPress={() =>
                  navigation.navigate(
                    'SalonDetail' as never,
                    {
                      name: s.name,
                      heroImageUrl: s.image,
                      address: s.addr,
                    } as never,
                  )
                }
              >
                <ImageBackground
                  source={{ uri: s.image }}
                  style={styles.nearbyThumb}
                  imageStyle={styles.nearbyThumbRadius}
                />
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={styles.cardTitle}>{s.name}</Text>
                  <Text style={styles.cardSub}>{s.addr}</Text>
                  <Text style={styles.cardSub}>{s.meta}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.cardSub}>Map view coming soon</Text>
          </View>
        )}

        <View style={{ height: 12 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerWrap: {
    backgroundColor: '#FFFFFF',
    // subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 4,
  },
  iconButton: {
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRightBtn: {
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchPill: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#F3F0FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8 as any,
  },
  searchPillText: {
    color: '#6B7280',
    fontSize: 16,
  },
  address: {
    color: '#756388',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  addressWrap: {
    flex: 1,
    paddingRight: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressMain: {
    color: '#141118',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  addressRest: {
    color: '#756388',
    fontSize: 13,
    marginTop: 2,
    marginLeft: 28, // align with text after the icon
  },

  hListPad: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  featureCard: {
    minWidth: 240,
    flex: 1,
    marginRight: 12,
  },
  featureImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
  },
  featureImageRadius: {
    borderRadius: 12,
  },
  featureTitle: {
    color: '#141118',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6 as any,
    paddingBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: '#141118',
  },

  sectionTitle: {
    color: '#141118',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },

  servicesRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8 as any,
  },
  serviceChip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f2f0f4',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  serviceLabel: {
    color: '#141118',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },

  squareCard: {
    width: 160, // fixed width to prevent oversizing
    marginRight: 12,
  },
  squareImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  squareImageRadius: {
    borderRadius: 12,
  },
  cardTitle: {
    color: '#141118',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  cardMeta: {
    color: '#756388',
    fontSize: 14,
  },
  cardSub: {
    color: '#756388',
    fontSize: 13,
  },

  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: '#f2f0f4',
    borderRadius: 12,
    marginHorizontal: 16,
    height: 40,
    padding: 4,
    gap: 6 as any,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentBtnChecked: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  segmentLabel: {
    color: '#756388',
    fontSize: 14,
    fontWeight: '600',
  },
  segmentLabelChecked: {
    color: '#141118',
  },

  nearbyRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12 as any,
    alignItems: 'center',
  },
  nearbyThumb: {
    width: 70,
    height: 70,
  },
  nearbyThumbRadius: {
    borderRadius: 10,
  },

  mapPlaceholder: {
    height: 160,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f0f4',
  },

  // footer search removed to match reference
});
