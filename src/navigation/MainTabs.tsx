import React, { useEffect, useRef, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
// no navigation needed here; overlay does not programmatically change tabs
import { MaterialIcons } from '@expo/vector-icons';
import {
  View,
  Modal,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Text,
  Image,
  InteractionManager,
  Keyboard,
  StatusBar,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { registerSearchOverlay } from './searchOverlayBus';
// colors import removed; using explicit values to match design

import Bookings from '../screens/Booking/Bookings';
import Profile from '../screens/Profile/Profile';
// Dashboard screen removed
// Stack-pushed screens moved to MainStack
import HomeStack from './HomeStack';
import Search from '../screens/Search/Search';

const Tab = createBottomTabNavigator();

// Stable icon renderers to satisfy react/no-unstable-nested-components
type TabIconProps = { color: string; size: number; focused?: boolean };

const renderHomeIcon = ({ color, size }: TabIconProps) => (
  <View
    style={{
      paddingHorizontal: 4,
      paddingVertical: 3,
      borderRadius: 999,
    }}
  >
    <MaterialIcons name="home" color={color} size={size} />
  </View>
);

const renderSearchIcon = ({ color, size }: TabIconProps) => (
  <View
    style={{
      paddingHorizontal: 4,
      paddingVertical: 3,
      borderRadius: 999,
    }}
  >
    <MaterialIcons name="search" color={color} size={size} />
  </View>
);

const renderBookingsIcon = ({ color, size }: TabIconProps) => (
  <View
    style={{
      paddingHorizontal: 4,
      paddingVertical: 3,
      borderRadius: 999,
    }}
  >
    <MaterialIcons name="bookmark-border" color={color} size={size} />
  </View>
);

const renderProfileIcon = ({ color, size }: TabIconProps) => (
  <View
    style={{
      paddingHorizontal: 4,
      paddingVertical: 3,
      borderRadius: 999,
    }}
  >
    <MaterialIcons name="person-outline" color={color} size={size} />
  </View>
);

export default function MainTabs() {
  const navigation = useNavigation<any>();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const hasTyped = query.length > 0;
  const searchInputRef = useRef<TextInput>(null);
  const focusTimersRef = useRef<NodeJS.Timeout[]>([]);
  const hasFocusedRef = useRef(false);
  const [focusing, setFocusing] = useState(false);
  const focusEnableTimerRef = useRef<NodeJS.Timeout | null>(null);

  const beginFocusing = () => {
    setFocusing(true);
    if (focusEnableTimerRef.current) clearTimeout(focusEnableTimerRef.current);
    focusEnableTimerRef.current = setTimeout(() => setFocusing(false), 900);
  };

  // Robustly try to focus the input a few times to ensure keyboard opens across platforms
  const clearFocusTimers = () => {
    focusTimersRef.current.forEach(clearTimeout);
    focusTimersRef.current = [];
  };

  const scheduleFocus = () => {
    if (hasFocusedRef.current) return;
    const focus = () => {
      if (hasFocusedRef.current) return;
      searchInputRef.current?.focus();
    };
    const tryWithDismiss = () => {
      if (hasFocusedRef.current) return;
      Keyboard.dismiss();
      focus();
    };
    const attempts = Platform.OS === 'android' ? [100, 250, 400, 700, 1000] : [0, 80, 200, 400];
    if ((global as any).requestAnimationFrame) requestAnimationFrame(focus);
    attempts.forEach((ms, i) => {
      const t = setTimeout(i % 2 === 0 ? focus : tryWithDismiss, ms);
      focusTimersRef.current.push(t);
    });
    InteractionManager.runAfterInteractions(focus);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    hasFocusedRef.current = false;
    clearFocusTimers();
    if (focusEnableTimerRef.current) clearTimeout(focusEnableTimerRef.current);
    setFocusing(false);
  };

  const sampleSalons = [
    {
      id: '1',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBwAofBO-dErClKSl4mxC8M4QW22AG75BnUSd0kzj3QKQXxDyEW0X4CbMkUrlAiHBNAzX8f1pn9D2IFmVJJ4mGk_gyd5P_LnUdYCFXobY3UpZeFIMMaJNmX8SaikvFmviNTGBPbTHK-qUeidUv8_9axCw8T9hMg0eOTLjASDyxGmugSlxbi6S_suXw_04qYbMqiKFHaBovVEstSjihmorhjIlg7DjHCVppw0NNQvCYvpBI-ekaYa8R_xMswT24rwSgJWHcHRpl41hc',
      name: 'Chic Cuts',
      addr: '123 Elm Street • 1.2 km',
      meta: '4.5 • 80 reviews',
    },
    {
      id: '2',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC2SCMddfVBhB78IWPMtC-3yXZ0AfN_ys6m4cyXYafe9bFaiyrPxjjux4aHC2Xs9SC8Zbqgr7QUae5FYLARrtL5OA12vHicv-7GHZSU7spwCgAB-LLKbeVWYGipPmNilBJmfGj3aBYE5qfXjI4gsGUOWLkgnkiIaaCFnvucCDjAXn1wmgMS09hr2vFgwEW7rIu4UlpNlK-tUK9J_65132h-DcNo12_n--KWM9R1DGvHMibvfturje0ljC5aO6sR8ulZcKgbnfbHAiU',
      name: 'Tranquil Spa',
      addr: '456 Oak Avenue • 0.8 km',
      meta: '4.8 • 130 reviews',
    },
    {
      id: '3',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBf8aWH9xahW22zEO7jDz0d-fG7sXdPDH4nx5bFS69eAxrTGL6KQZU9CWflNA-_8U_JadN87NF1ie_U0f7cXXbmqZdBrNLpY2VhbjFyOSZn_r9dIx5ENFZTGiyuu9TjLYsH72X1w1qi0xWt9V_KlSQDL6tUbOk9ywECk1ZaqM9g2PfXeWaKXsxF_wWbgUB0_SNXGMv7ru_QKTftVADlLG4EIOblZCsYIL7bL1CSiyLK3Ai2Qh3D8DoZeLM-3__Ztj2HSyHDGDk4kp8',
      name: 'Elegant Nails',
      addr: '789 Pine Lane • 1.5 km',
      meta: '4.6 • 100 reviews',
    },
  ];

  const data = hasTyped
    ? sampleSalons.filter((s) =>
        [s.name, s.addr, s.meta].some((t) => t.toLowerCase().includes(query.toLowerCase())),
      )
    : sampleSalons;

  useEffect(() => {
    const unregister = registerSearchOverlay({
      open: () => {
        // Keep Home active to preserve blur background; visually select Search tab via icon/label color
        setQuery('');
        hasFocusedRef.current = false;
        clearFocusTimers();
        InteractionManager.runAfterInteractions(() => {
          beginFocusing();
          setSearchOpen(true);
        });
      },
      close: () => {
        setSearchOpen(false);
        setQuery('');
      },
    });
    return unregister;
  }, []);

  // Android: trigger focus when overlay opens (non-Modal path)
  useEffect(() => {
    if (Platform.OS === 'android' && searchOpen) {
      beginFocusing();
      scheduleFocus();
    }
  }, [searchOpen]);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarShowLabel: true,
          tabBarActiveTintColor: '#6C63FF',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarLabelStyle: { fontSize: 11, marginBottom: 2, fontWeight: '600' },
          tabBarItemStyle: { justifyContent: 'center' },
          tabBarStyle: {
            backgroundColor: '#ffffff',
            height: 76,
            paddingBottom: 8,
            paddingTop: 6,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: 'hidden',
            borderTopWidth: 0,
            elevation: 8,
          },
        }}
      >
        {/* Home tab */}
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{
            headerShown: false,
            tabBarLabel: 'Home',
            tabBarIcon: renderHomeIcon,
          }}
        />
        {/* Search tab */}
        <Tab.Screen
          name="Search"
          component={Search}
          options={{
            headerShown: true,
            tabBarLabel: 'Search',
            tabBarIcon: renderSearchIcon,
          }}
          listeners={{
            tabPress: (e) => {
              // Prevent switching tabs so blur overlays Home; visually mark Search as active
              e.preventDefault();
              setQuery('');
              hasFocusedRef.current = false;
              clearFocusTimers();
              InteractionManager.runAfterInteractions(() => {
                beginFocusing();
                setSearchOpen(true);
              });
            },
          }}
        />
        <Tab.Screen
          name="Bookings"
          component={Bookings}
          options={{
            headerShown: true,
            tabBarLabel: 'Bookings',
            tabBarIcon: renderBookingsIcon,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{
            headerShown: true,
            tabBarLabel: 'Profile',
            tabBarIcon: renderProfileIcon,
          }}
        />
        {/* Hidden routes removed; handled in MainStack */}
      </Tab.Navigator>

      {/* Search Overlay */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={searchOpen}
          animationType="fade"
          transparent
          onRequestClose={closeSearch}
          statusBarTranslucent
          presentationStyle="overFullScreen"
          hardwareAccelerated
          onShow={() => {
            beginFocusing();
            scheduleFocus();
          }}
        >
          <View style={styles.modalRoot}>
            {!hasTyped ? (
              <Pressable
                onPress={() => {
                  setSearchOpen(false);
                  setQuery('');
                }}
                style={StyleSheet.absoluteFill}
              >
                <View
                  style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.6)' }]}
                />
                <BlurView
                  intensity={65}
                  tint="light"
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />
              </Pressable>
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF' }]} />
            )}

            <View style={styles.topSolid} pointerEvents="box-none" />

            <KeyboardAvoidingView
              behavior="padding"
              style={[styles.kb, { paddingTop: 24 + 16 /* iOS fixed */ }]}
              pointerEvents="box-none"
            >
              <View style={styles.searchBarRow}>
                <View style={styles.searchFieldWrap}>
                  <MaterialIcons name="search" size={20} color="#6B7280" />
                  <TextInput
                    key={searchOpen ? 'open' : 'closed'}
                    ref={searchInputRef}
                    value={query}
                    onChangeText={setQuery}
                    autoFocus
                    showSoftInputOnFocus
                    onFocus={() => {
                      hasFocusedRef.current = true;
                      clearFocusTimers();
                      if (focusEnableTimerRef.current) clearTimeout(focusEnableTimerRef.current);
                      setFocusing(false);
                    }}
                    placeholder="Search for salons"
                    placeholderTextColor="#6B7280"
                    style={styles.searchInput}
                  />
                  <Pressable
                    onPress={() => {
                      if (hasTyped) setQuery('');
                      else closeSearch();
                    }}
                    style={styles.trailingBtn}
                    hitSlop={8}
                  >
                    <MaterialIcons name="close" size={18} color="#6B7280" />
                  </Pressable>
                </View>
              </View>

              {hasTyped && (
                <FlatList
                  keyboardShouldPersistTaps="handled"
                  data={data}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingBottom: 24 }}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.resultRow}
                      onPress={() => {
                        closeSearch();
                        navigation.navigate(
                          'Tabs' as never,
                          {
                            screen: 'Home',
                            params: {
                              screen: 'SalonDetail',
                              params: {
                                name: item.name,
                                heroImageUrl: item.image,
                                address: item.addr,
                              },
                            },
                          } as never,
                        );
                      }}
                    >
                      <Image source={{ uri: item.image }} style={styles.resultThumb} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.resultTitle}>{item.name}</Text>
                        <Text style={styles.resultSub}>{item.addr}</Text>
                        <Text style={styles.resultMeta}>{item.meta}</Text>
                      </View>
                    </Pressable>
                  )}
                />
              )}
            </KeyboardAvoidingView>
          </View>
        </Modal>
      ) : searchOpen ? (
        <View
          style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]}
          pointerEvents="auto"
        >
          <View style={styles.modalRoot}>
            {!hasTyped ? (
              focusing ? (
                <>
                  <View
                    style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.6)' }]}
                  />
                  <BlurView
                    intensity={65}
                    tint="light"
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  />
                </>
              ) : (
                <Pressable
                  onPress={() => {
                    setSearchOpen(false);
                    setQuery('');
                  }}
                  style={StyleSheet.absoluteFill}
                >
                  <View
                    style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.6)' }]}
                  />
                  <BlurView
                    intensity={65}
                    tint="light"
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  />
                </Pressable>
              )
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF' }]} />
            )}

            <View style={styles.topSolid} pointerEvents="box-none" />

            <View
              style={[
                styles.kb,
                {
                  paddingTop:
                    24 + (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 16) : 16),
                },
              ]}
              pointerEvents="box-none"
            >
              <View style={styles.searchBarRow}>
                <View style={styles.searchFieldWrap}>
                  <MaterialIcons name="search" size={20} color="#6B7280" />
                  <TextInput
                    key={searchOpen ? 'open' : 'closed'}
                    ref={searchInputRef}
                    value={query}
                    onChangeText={setQuery}
                    autoFocus
                    showSoftInputOnFocus
                    onFocus={() => {
                      hasFocusedRef.current = true;
                      clearFocusTimers();
                      if (focusEnableTimerRef.current) clearTimeout(focusEnableTimerRef.current);
                      setFocusing(false);
                    }}
                    placeholder="Search for salons"
                    placeholderTextColor="#6B7280"
                    style={styles.searchInput}
                  />
                  <Pressable
                    onPress={() => {
                      if (hasTyped) setQuery('');
                      else closeSearch();
                    }}
                    style={styles.trailingBtn}
                    hitSlop={8}
                  >
                    <MaterialIcons name="close" size={18} color="#6B7280" />
                  </Pressable>
                </View>
              </View>

              {hasTyped && (
                <FlatList
                  keyboardShouldPersistTaps="handled"
                  data={data}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingBottom: 24 }}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.resultRow}
                      onPress={() => {
                        closeSearch();
                        navigation.navigate(
                          'Tabs' as never,
                          {
                            screen: 'Home',
                            params: {
                              screen: 'SalonDetail',
                              params: {
                                name: item.name,
                                heroImageUrl: item.image,
                                address: item.addr,
                              },
                            },
                          } as never,
                        );
                      }}
                    >
                      <Image source={{ uri: item.image }} style={styles.resultThumb} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.resultTitle}>{item.name}</Text>
                        <Text style={styles.resultSub}>{item.addr}</Text>
                        <Text style={styles.resultMeta}>{item.meta}</Text>
                      </View>
                    </Pressable>
                  )}
                />
              )}
            </View>
          </View>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    position: 'relative',
  },
  topSolid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  kb: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
    zIndex: 2,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  searchFieldWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    color: '#111827',
    marginLeft: 8,
    fontSize: 16,
  },
  trailingBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  resultThumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  resultTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  resultSub: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
  resultMeta: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
});
