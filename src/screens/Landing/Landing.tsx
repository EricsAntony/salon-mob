import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const violet600 = '#7c3aed';
const purple600 = '#9333ea';
const violet100 = '#e9d5ff';
const violet50 = '#f3e8ff';
const violet200 = '#ddd6fe';
const pink200 = '#fecdd3';
const pink400 = '#fb7185';
const pink100 = '#fbcfe8';
const purple100 = '#e9d5ff';
const gray800 = '#1f2937';
const gray600 = '#4b5563';
const gray300 = '#d1d5db';
const white = '#ffffff';

export default function Landing() {
  const nav = useNavigation<any>();

  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const arrowShift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopFloat = (anim: Animated.Value, distance: number, duration = 3000, delay = 0) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -distance,
            duration: duration / 2,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(anim, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
        ]),
      ).start();

    loopFloat(float1, 10, 3000, 0);
    loopFloat(float2, 8, 3000, 750);

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -6, duration: 600, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ).start();
  }, [bounce, float1, float2]);

  const onPressIn = () => {
    Animated.timing(arrowShift, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    Animated.timing(arrowShift, { toValue: 0, duration: 150, useNativeDriver: true }).start();
  };

  const arrowTranslate = arrowShift.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });

  return (
    <LinearGradient
      colors={[white, violet50, violet100]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandWrapper}>
          <MaterialCommunityIcons name="crown-outline" size={28} color={violet600} />
        </View>
      </View>

      {/* Main content */}
      <View style={styles.main}>
        {/* Welcome */}
        <View style={styles.welcome}>
          <Text style={styles.title}>Welcome to</Text>
          <Text style={[styles.title, { color: violet600, marginTop: 4 }]}>Zlotly</Text>
          <Text style={styles.subtitle}>
            Your perfect salon experience awaits. Book appointments, discover services, and pamper
            yourself with ease.
          </Text>
        </View>

        {/* Illustration card */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.card}>
            {/* Floating icons */}
            <Animated.View style={[styles.sparkle, { transform: [{ translateY: bounce }] }]}>
              <MaterialCommunityIcons name="star-four-points-outline" size={20} color={white} />
            </Animated.View>
            <Animated.View
              style={[
                styles.heart,
                {
                  transform: [
                    { scale: float2.interpolate({ inputRange: [-8, 0], outputRange: [1.05, 1] }) },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons name="heart" size={14} color={white} />
            </Animated.View>

            {/* Salon chair and mirror (shapes) */}
            <View>
              {/* Chair */}
              <View style={styles.chairWrapper}>
                <View style={styles.chairBack} />
                <View style={styles.chairBase} />
                <View style={styles.chairSeat} />
              </View>

              {/* Mirror */}
              <View style={styles.mirrorOuter}>
                <View style={styles.mirrorInner} />
                <View style={styles.mirrorDot} />
              </View>

              {/* Decorative pings */}
              <Animated.View style={[styles.pingViolet, { transform: [{ translateY: float1 }] }]} />
              <Animated.View style={[styles.pingPink, { transform: [{ translateY: float2 }] }]} />
            </View>

            {/* Service icons */}
            <View style={styles.serviceRow}>
              <View style={[styles.serviceCircle, { backgroundColor: violet100 }]}>
                <View style={[styles.serviceDot, { backgroundColor: violet600 }]} />
              </View>
              <View style={[styles.serviceCircle, { backgroundColor: pink100 }]}>
                <View style={[styles.serviceDot, { backgroundColor: pink400 }]} />
              </View>
              <View style={[styles.serviceCircle, { backgroundColor: purple100 }]}>
                <View style={[styles.serviceDot, { backgroundColor: purple600 }]} />
              </View>
            </View>
          </View>

          {/* Floating background circles */}
          <Animated.View style={[styles.floatCircle1, { transform: [{ translateY: float1 }] }]} />
          <Animated.View style={[styles.floatCircle2, { transform: [{ translateY: float2 }] }]} />
        </View>
      </View>

      {/* Get Started */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={() => nav.navigate('PhoneInput' as never)}
        >
          <LinearGradient
            colors={[violet600, purple600]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>Get Started</Text>
            <Animated.View style={{ transform: [{ translateX: arrowTranslate }] }}>
              <MaterialCommunityIcons name="arrow-right" size={22} color={white} />
            </Animated.View>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.footerText}>Join thousands of happy customers</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 48, paddingHorizontal: 24 },
  brandWrapper: {
    alignSelf: 'center',
    backgroundColor: white,
    borderRadius: 999,
    padding: 12,
    borderWidth: 1,
    borderColor: violet200,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  main: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  welcome: { marginBottom: 32, alignItems: 'center', gap: 8, maxWidth: 360 },
  title: { fontSize: 32, fontWeight: '700', color: gray800, textAlign: 'center' },
  subtitle: { fontSize: 16, color: gray600, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  illustrationWrapper: { marginBottom: 40, alignItems: 'center', justifyContent: 'center' },
  card: {
    position: 'relative',
    backgroundColor: white,
    borderRadius: 24,
    padding: 24,
    width: Math.min(360, width - 48),
    borderWidth: 1,
    borderColor: violet200,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  sparkle: {
    position: 'absolute',
    right: 8,
    top: -12,
    backgroundColor: violet600,
    borderRadius: 999,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  heart: {
    position: 'absolute',
    left: -6,
    bottom: -6,
    backgroundColor: pink400,
    borderRadius: 999,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  chairWrapper: { width: 128, height: 128, alignSelf: 'center', marginBottom: 16 },
  chairBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 128,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: violet600,
  },
  chairBase: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 32,
    backgroundColor: '#374151',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  chairSeat: {
    position: 'absolute',
    top: 40,
    left: '50%',
    marginLeft: -40,
    width: 80,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#a78bfa',
  },
  mirrorOuter: {
    width: 96,
    height: 128,
    alignSelf: 'center',
    backgroundColor: gray300,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  mirrorInner: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
  },
  mirrorDot: {
    position: 'absolute',
    top: 12,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    backgroundColor: '#a78bfa',
    borderRadius: 999,
  },
  pingViolet: {
    position: 'absolute',
    top: 24,
    left: 8,
    width: 8,
    height: 8,
    backgroundColor: '#c4b5fd',
    borderRadius: 999,
  },
  pingPink: {
    position: 'absolute',
    top: 72,
    right: 12,
    width: 4,
    height: 4,
    backgroundColor: '#f9a8d4',
    borderRadius: 999,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  serviceCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceDot: { width: 12, height: 12, borderRadius: 6 },
  floatCircle1: {
    position: 'absolute',
    top: -24,
    left: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: violet200,
    opacity: 0.2,
  },
  floatCircle2: {
    position: 'absolute',
    bottom: -16,
    right: 32,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: pink200,
    opacity: 0.3,
  },
  footer: { paddingBottom: 24, paddingHorizontal: 24 },
  cta: {
    width: Math.min(360, width - 48),
    alignSelf: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  ctaText: { color: white, fontWeight: '600', fontSize: 18, marginRight: 8 },
  footerText: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 12 },
});
