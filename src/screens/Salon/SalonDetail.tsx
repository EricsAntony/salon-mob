import React from 'react';
import {
  View,
  Text as RNText,
  ImageBackground,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import { Text, Button, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

const COLORS = {
  textPrimary: '#141118',
  textSecondary: '#756388',
  divider: '#e0dce5',
  surfaceAlt: '#f2f0f4',
  white: '#FFFFFF',
  primaryBtn: '#8019e6',
  accent: '#6C63FF',
};

function renderAccordionRight({ isExpanded }: { isExpanded: boolean }) {
  return (
    <MaterialCommunityIcons
      name={isExpanded ? 'chevron-up' : 'chevron-down'}
      size={20}
      color={COLORS.textPrimary}
    />
  );
}

export type SalonDetailParams = {
  name?: string;
  heroImageUrl?: string;
  gallery?: string[];
  about?: string;
  services?: Array<{ title: string; description: string; open?: boolean }>;
  stylists?: Array<{
    name: string;
    role?: string;
    avatarUrl?: string;
    rating?: number;
    specialties?: string[];
    bio?: string;
  }>;
  locationImageUrl?: string;
  address?: string;
  phone?: string;
  hours?: string;
};

export default function SalonDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params: SalonDetailParams = route?.params || {};

  const name = params.name || 'Salon Bliss';
  const heroImageUrl =
    params.heroImageUrl ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBIeZqOUaPkyZmpjkkGF8O5OV2BqqeZanCeZqbJH4B_qPNvF7WMcE2pH8aJENaQazjtm5eHSMChGJDL8wwJH7d4YI2o8MjBq7Zvk1jyDwgWK0uv2jWWD24nR8Yk_tPTlE1oMOaJdB8wmEg6yOh2EFzW6Q4MQKWT0oo75DXO5PslgNvRbG2wnnVibjzWVVQNszuoE4crNy79ZBxeKsiBdpVdEjajyhz6wlne6qN0SzzgZujyqZRcClTbk2zFEUam1pDAA-xEGcAIR60';
  const gallery = (
    params.gallery && params.gallery.length > 0
      ? params.gallery
      : [
          heroImageUrl,
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBwAofBO-dErClKSl4mxC8M4QW22AG75BnUSd0kzj3QKQXxDyEW0X4CbMkUrlAiHBNAzX8f1pn9D2IFmVJJ4mGk_gyd5P_LnUdYCFXobY3UpZeFIMMaJNmX8SaikvFmviNTGBPbTHK-qUeidUv8_9axCw8T9hMg0eOTLjASDyxGmugSlxbi6S_suXw_04qYbMqiKFHaBovVEstSjihmorhjIlg7DjHCVppw0NNQvCYvpBI-ekaYa8R_xMswT24rwSgJWHcHRpl41hc',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuC2SCMddfVBhB78IWPMtC-3yXZ0AfN_ys6m4cyXYafe9bFaiyrPxjjux4aHC2Xs9SC8Zbqgr7QUae5FYLARrtL5OA12vHicv-7GHZSU7spwCgAB-LLKbeVWYGipPmNilBJmfGj3aBYE5qfXjI4gsGUOWLkgnkiIaaCFnvucCDjAXn1wmgMS09hr2vFgwEW7rIu4UlpNlK-tUK9J_65132h-DcNo12_n--KWM9R1DGvHMibvfturje0ljC5aO6sR8ulZcKgbnfbHAiU',
        ]
  ) as string[];
  const about =
    params.about ||
    'Salon Bliss is a premier salon offering a wide range of services including haircuts, styling, coloring, and spa treatments. Our experienced stylists are dedicated to providing exceptional service in a relaxing atmosphere.';
  const services = params.services || [
    {
      title: 'Haircut',
      description:
        "Women's Haircut (45 min) ($40-$60)  Men's Haircut (30 min) ($30-$40)  Children's Haircut (30 min) ($25-$35)",
      open: true,
    },
    {
      title: 'Hair Coloring',
      description:
        'Full Color (90 min) ($80-$120) Highlights (120 min) ($70-$100) Root Touch-Up (60 min) ($50-$70)',
      open: true,
    },
    {
      title: 'Manicure',
      description:
        'Classic Manicure (30 min) ($30-$40) Gel Manicure (45 min) ($45-$55) Spa Manicure (60 min) ($50-$60)',
      open: true,
    },
  ];
  const stylists = params.stylists || [
    {
      name: 'Emily Carter',
      role: 'Specialist in Color & Highlights',
      avatarUrl: 'https://i.pravatar.cc/100?img=15',
      rating: 5,
      specialties: ['Color', 'Highlights'],
      bio: "Emily has over 10 years of experience in the industry, specializing in color and highlights. She's known for her creative approach and attention to detail.",
    },
    {
      name: 'David Harper',
      role: 'Expert in Haircuts & Styling',
      avatarUrl: 'https://i.pravatar.cc/100?img=3',
      rating: 4,
      specialties: ['Haircuts', 'Styling'],
      bio: 'David is a master stylist with a passion for creating modern and classic looks. He excels in haircuts, styling, and men’s grooming.',
    },
    {
      name: 'Sophia Bennett',
      role: 'Nail Art & Manicure Specialist',
      avatarUrl: 'https://i.pravatar.cc/100?img=47',
      rating: 4,
      specialties: ['Nail Art', 'Manicure'],
      bio: 'Sophia is a talented nail artist with a flair for creativity. She offers a wide range of services, from classic manicures to intricate nail art designs.',
    },
  ];
  const locationImageUrl =
    params.locationImageUrl ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCInCOHW1ATMo_3ILoOpGnKvadxD1Sh0PYAyWztbQREwCpkEynaM677h-we07Rs6MUSAHPkFMDptFEN3NhkSpsFbexzEaMfJlyg77ZeSzqHxGWPv459tMBmX5GATeQR8JUk14Tqkx0mSh5QgzHalC2zTQtnEOFGvP3JlPZ9IQlVVc7dPuuWdFJ80rsO-vhrbhwvFpY13QuDt11FE7qhPTjTxCy4zpLV5OexyJaAhvlT5byoYhzKlD1Bc1EU3fLYHZjs786UTcxYe6E';
  const address = params.address || '123 Main Street, Anytown';
  const phone = params.phone || '(555) 123-4567';
  const hours = params.hours || 'Mon-Fri: 9am-7pm, Sat: 10am-6pm';
  // All accordions collapsed by default, user controls expansion
  const [openMap, setOpenMap] = React.useState<Record<number, boolean>>(() =>
    Object.fromEntries((services || []).map((_, i) => [i, false])),
  );
  const [activeTab, setActiveTab] = React.useState<'Overview' | 'Reviews' | 'Stylists'>('Overview');
  const [heroIndex, setHeroIndex] = React.useState(0);
  const [heroWidth, setHeroWidth] = React.useState(0);
  React.useEffect(() => {
    // Avoid no-op warning in New Architecture (Fabric)
    // @ts-ignore
    const isFabric = !!global?.nativeFabricUIManager;
    if (Platform.OS === 'android' && !isFabric && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);
  const onHeroScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    const idx = Math.round(contentOffset.x / Math.max(layoutMeasurement.width, 1));
    setHeroIndex(Math.min(Math.max(idx, 0), gallery.length - 1));
  };

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[
        styles.container,
        {
          // Match Dashboard: no extra safe-area top padding here
          paddingTop: 0,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" color={COLORS.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name}</Text>
        {/* Spacer to keep title centered */}
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Image with overlay dots */}
        <View
          style={styles.heroWrapper}
          onLayout={(e) => setHeroWidth(Math.max(0, (e.nativeEvent.layout.width || 0) - 32))}
        >
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onHeroScrollEnd}
            style={{ width: '100%' }}
          >
            {gallery.map((uri, i) => (
              <View key={i} style={{ width: heroWidth || '100%' }}>
                <ImageBackground source={{ uri }} style={styles.hero} imageStyle={styles.heroImage}>
                  <View style={styles.heroOverlay} />
                </ImageBackground>
              </View>
            ))}
          </ScrollView>
          <View style={styles.heroDots}>
            {gallery.map((_, i) => (
              <View key={i} style={[styles.dot, { opacity: heroIndex === i ? 1 : 0.5 }]} />
            ))}
          </View>
        </View>

        {/* Pseudo tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setActiveTab('Overview');
            }}
            style={[styles.tabItem, activeTab === 'Overview' && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Overview' ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setActiveTab('Reviews');
            }}
            style={[styles.tabItem, activeTab === 'Reviews' && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Reviews' ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              Reviews
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setActiveTab('Stylists');
            }}
            style={[styles.tabItem, activeTab === 'Stylists' && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Stylists' ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              Stylists
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'Overview' ? (
          <>
            {/* About */}
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.paragraph}>{about}</Text>

            {/* Services */}
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={{ paddingHorizontal: 16 }}>
              {services.map((s, idx) => {
                const isOpen = !!openMap[idx];
                // Try to split description into neat lines if items array is not provided
                const lines =
                  (s as any).items && Array.isArray((s as any).items)
                    ? ((s as any).items as string[])
                    : (s.description || '')
                        .split(/\s{2,}/)
                        .map((t) => t.trim())
                        .filter(Boolean);
                return (
                  <View key={idx} style={styles.serviceGroup}>
                    <List.Accordion
                      title={<RNText style={styles.serviceTitle}>{s.title}</RNText>}
                      right={renderAccordionRight}
                      style={styles.accordion}
                      expanded={isOpen}
                      onPress={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setOpenMap((prev) => ({ ...prev, [idx]: !prev[idx] }));
                      }}
                    >
                      <View style={styles.serviceContent}>
                        <View style={styles.serviceDetailsBox}>
                          {lines.map((ln, i) => {
                            const match = ln.match(/^(.*?)(?:\s*\(([^)]+)\))?(?:\s*\(([^)]+)\))?$/);
                            const svc = (match?.[1] || ln).trim();
                            const a = (match?.[2] || '').trim();
                            const b = (match?.[3] || '').trim();
                            let duration = '';
                            let price = '';
                            [a, b].forEach((p) => {
                              if (!p) return;
                              if (/(min|hr)/i.test(p)) duration = p;
                              else price = p;
                            });
                            return (
                              <View
                                key={i}
                                style={[
                                  styles.serviceItemRow,
                                  i < lines.length - 1 && styles.serviceDivider,
                                ]}
                              >
                                <Text style={styles.serviceItemName}>{svc}</Text>
                                <View style={styles.serviceRight}>
                                  {!!duration && (
                                    <Text style={styles.serviceItemDuration}>{duration}</Text>
                                  )}
                                  {!!duration && !!price && (
                                    <Text style={styles.serviceDot}> • </Text>
                                  )}
                                  {!!price && <Text style={styles.serviceItemPrice}>{price}</Text>}
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    </List.Accordion>
                  </View>
                );
              })}
            </View>
            {/* Location */}
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              <Image
                source={{ uri: locationImageUrl }}
                style={styles.locationImage}
                resizeMode="cover"
              />
            </View>

            {/* Info Rows */}
            <InfoRow icon="map-marker-outline" title="Address" subtitle={address} />
            <InfoRow icon="phone-outline" title="Phone" subtitle={phone} />
            <InfoRow icon="clock-outline" title="Hours" subtitle={hours} />
          </>
        ) : activeTab === 'Reviews' ? (
          <>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={{ paddingHorizontal: 16 }}>
              {/* Summary */}
              <View style={styles.reviewsSummary}>
                <View style={styles.reviewsHeaderRow}>
                  <Text style={styles.avgRating}>4.7</Text>
                  <View style={{ marginLeft: 12 }}>
                    <View style={styles.avgStarsRow}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <MaterialCommunityIcons
                          key={i}
                          name={i < 4 ? 'star' : 'star-outline'}
                          size={18}
                          color={i < 4 ? COLORS.textPrimary : '#d1d5db'}
                        />
                      ))}
                    </View>
                    <Text style={styles.reviewsCount}>125 reviews</Text>
                  </View>
                </View>
                <View style={styles.histogram}>
                  {[
                    { stars: 5, pct: 50 },
                    { stars: 4, pct: 30 },
                    { stars: 3, pct: 10 },
                    { stars: 2, pct: 5 },
                    { stars: 1, pct: 5 },
                  ].map((h) => (
                    <View key={h.stars} style={styles.histRow}>
                      <Text style={styles.histLabel}>{h.stars}</Text>
                      <View style={styles.histBarTrack}>
                        <View style={[styles.histBarFill, { width: `${h.pct}%` }]} />
                      </View>
                      <Text style={styles.histPct}>{h.pct}%</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Reviews List */}
              {[
                {
                  name: 'Sophia Clark',
                  avatarUrl: 'https://i.pravatar.cc/100?img=15',
                  date: '2 weeks ago',
                  rating: 5,
                  text: 'Absolutely loved my experience at Salon Bliss! The staff was incredibly friendly and professional. My stylist, Sarah, did an amazing job with my haircut and color. I left feeling refreshed and confident. Highly recommend!',
                  likes: 12,
                  comments: 2,
                },
                {
                  name: 'Ethan Bennett',
                  avatarUrl: 'https://i.pravatar.cc/100?img=12',
                  date: '1 month ago',
                  rating: 4,
                  text: 'I had a great time at Salon Bliss. The atmosphere was relaxing, and the staff was welcoming. My haircut was good, but I felt it could have been slightly better. Overall, a positive experience.',
                  likes: 8,
                  comments: 1,
                },
              ].map((r, i) => (
                <View key={i} style={styles.reviewCard}>
                  <View style={styles.reviewItemHeaderRow}>
                    {r.avatarUrl ? (
                      <Image source={{ uri: r.avatarUrl }} style={styles.reviewAvatar} />
                    ) : (
                      <View
                        style={[
                          styles.reviewAvatar,
                          { alignItems: 'center', justifyContent: 'center' },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="account"
                          size={22}
                          color={COLORS.textSecondary}
                        />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewName}>{r.name}</Text>
                      <Text style={styles.reviewMeta}>{r.date}</Text>
                    </View>
                  </View>
                  <View style={styles.reviewStars}>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <MaterialCommunityIcons
                        key={idx}
                        name={idx < r.rating ? 'star' : 'star-outline'}
                        size={18}
                        color={idx < r.rating ? COLORS.textPrimary : '#d1d5db'}
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewText}>{r.text}</Text>
                  <View style={styles.reviewActionsRow}>
                    <View style={styles.reviewAction}>
                      <MaterialCommunityIcons
                        name="thumb-up-outline"
                        size={18}
                        color={COLORS.textSecondary}
                      />
                      <Text style={styles.reviewActionText}>{r.likes}</Text>
                    </View>
                    <View style={styles.reviewAction}>
                      <MaterialCommunityIcons
                        name="message-processing-outline"
                        size={18}
                        color={COLORS.textSecondary}
                      />
                      <Text style={styles.reviewActionText}>{r.comments}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Stylists</Text>
            <View style={{ paddingHorizontal: 16 }}>
              {stylists.map((st, i) => (
                <View key={i} style={styles.stylistCard}>
                  <View style={styles.stylistRow}>
                    {st.avatarUrl ? (
                      <Image source={{ uri: st.avatarUrl }} style={styles.stylistAvatar} />
                    ) : (
                      <View
                        style={[
                          styles.stylistAvatar,
                          {
                            backgroundColor: COLORS.surfaceAlt,
                            alignItems: 'center',
                            justifyContent: 'center',
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="account"
                          size={28}
                          color={COLORS.textSecondary}
                        />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stylistName}>{st.name}</Text>
                      {!!st.role && <Text style={styles.stylistRole}>{st.role}</Text>}
                      {st.specialties && st.specialties.length > 0 && (
                        <View style={styles.stylistTagsRow}>
                          {st.specialties.map((sp, idx) => (
                            <View key={idx} style={styles.stylistTag}>
                              <Text style={styles.stylistTagText}>{sp}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                      {!!st.bio && <Text style={styles.stylistBio}>{st.bio}</Text>}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer actions */}
      <View>
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('SelectServices', { heroImageUrl, salonName: name })}
            contentStyle={{ height: 48 }}
            style={styles.bookBtn}
          >
            Book Appointment
          </Button>
        </View>
        <View style={{ height: 5, backgroundColor: COLORS.white }} />
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        <MaterialCommunityIcons name={icon} color={COLORS.textPrimary} size={24} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoSubtitle} numberOfLines={2}>
          {subtitle}
        </Text>
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
    // Match Dashboard headerRow spacing
    paddingTop: 50,
    paddingBottom: 4,
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
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    paddingRight: 48, // keep visual center since left has icon
  },
  headerSpacer: { width: 0, height: 0 },
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  heroWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  hero: {
    width: '100%',
    minHeight: 218,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroImage: {
    borderRadius: 12,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)', // subtle overlay to mimic gradient
  },
  heroDots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
    marginHorizontal: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
    paddingHorizontal: 16,
    gap: 32,
  },
  tabItem: {
    paddingTop: 16,
    paddingBottom: 13,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.textPrimary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: COLORS.textPrimary,
  },
  tabTextInactive: {
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  paragraph: {
    color: COLORS.textPrimary,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  serviceGroup: {
    marginBottom: 12,
  },
  accordion: {
    paddingHorizontal: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    // subtle shadow for premium look
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  serviceTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  serviceDesc: {
    color: COLORS.textSecondary,
    fontSize: 14,
    paddingBottom: 8,
  },
  serviceContent: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  serviceDetailsBox: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  serviceItemRow: {
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
  },
  serviceItemText: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  serviceItemName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    flexShrink: 1,
    paddingRight: 12,
  },
  serviceItemPrice: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  serviceRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceItemDuration: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  serviceDot: {
    color: COLORS.textSecondary,
    marginHorizontal: 4,
  },
  stylistCard: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 12,
    marginBottom: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
  },
  stylistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stylistAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  stylistName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  stylistRole: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  stylistTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  stylistTag: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  stylistTagText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  stylistBio: {
    marginTop: 8,
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  stylistRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 999,
    height: 28,
    paddingHorizontal: 8,
  },
  stylistRatingText: {
    marginLeft: 4,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  locationImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 72,
  },
  infoIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  infoSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  bookBtn: {
    borderRadius: 12,
    backgroundColor: COLORS.primaryBtn,
  },
  reviewCard: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reviewName: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  reviewDate: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  reviewStars: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  reviewText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  // Reviews summary block (avg + histogram)
  reviewsSummary: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 8,
    marginBottom: 12,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avgRating: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  avgStarsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reviewsCount: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  histogram: {
    marginTop: 8,
  },
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  histLabel: {
    width: 16,
    textAlign: 'right',
    marginRight: 8,
    color: COLORS.textPrimary,
    fontSize: 12,
  },
  histBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#EAE7EF',
    overflow: 'hidden',
    marginRight: 8,
  },
  histBarFill: {
    height: '100%',
    backgroundColor: COLORS.textPrimary,
    borderRadius: 8,
  },
  histPct: {
    width: 40,
    textAlign: 'left',
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  // Review item header (avatar + name/date)
  reviewItemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceAlt,
    marginRight: 10,
  },
  reviewMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  reviewActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 20,
  },
  reviewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewActionText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceAlt,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bottomNavLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});
