import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

export default function BookingSuccess() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { salonName, appointmentDate, appointmentTime } = route.params || {};

  // Animations
  const circleScale = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const overlayFade = useRef(new Animated.Value(0)).current;

  // Simple confetti using emoji particles
  const particles = useMemo(() => {
    return new Array(24).fill(0).map((_, i) => ({
      key: `p-${i}`,
      x: Math.random() * width,
      delay: Math.random() * 400,
      duration: 1200 + Math.random() * 800,
      rotate: new Animated.Value(0),
      translateY: new Animated.Value(-40),
      opacity: new Animated.Value(0),
      emoji: ['🎉', '✨', '🎊', '💜', '⭐️'][i % 5],
    }));
  }, []);

  useEffect(() => {
    // Hide bottom tab bar for full-screen experience
    const parent = navigation.getParent?.();
    parent?.setOptions?.({ tabBarStyle: { display: 'none' } });

    Animated.sequence([
      Animated.parallel([
        Animated.timing(overlayFade, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(circleScale, { toValue: 1, useNativeDriver: true }),
      ]),
      Animated.spring(checkScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
    ]).start();

    // launch confetti
    particles.forEach((p) => {
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.parallel([
          Animated.timing(p.translateY, {
            toValue: height + 60,
            duration: p.duration,
            useNativeDriver: true,
          }),
          Animated.timing(p.rotate, { toValue: 1, duration: p.duration, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(p.opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(p.opacity, {
              toValue: 0,
              duration: 300,
              delay: p.duration - 500,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    });
    return () => {
      // Restore tab bar (let the parent recalc defaults if available)
      parent?.setOptions?.({ tabBarStyle: undefined });
    };
  }, [circleScale, checkScale, overlayFade, particles, navigation]);

  const subtitle = useMemo(() => {
    if (appointmentDate && appointmentTime) return `${appointmentDate} · ${appointmentTime}`;
    if (appointmentDate) return `${appointmentDate}`;
    if (appointmentTime) return `${appointmentTime}`;
    return undefined;
  }, [appointmentDate, appointmentTime]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.overlay, { opacity: overlayFade }]} />

      {/* Confetti */}
      {particles.map((p) => (
        <Animated.Text
          key={p.key}
          style={{
            position: 'absolute',
            left: p.x,
            top: -20,
            transform: [
              { translateY: p.translateY },
              {
                rotate: p.rotate.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
            opacity: p.opacity,
            fontSize: 22,
          }}
        >
          {p.emoji}
        </Animated.Text>
      ))}

      {/* Check circle */}
      <Animated.View style={[styles.circle, { transform: [{ scale: circleScale }] }]}>
        <Animated.View style={{ transform: [{ scale: checkScale }] }}>
          <MaterialCommunityIcons name="check" size={64} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>

      {/* Text */}
      <View style={{ alignItems: 'center', marginTop: 24, paddingHorizontal: 24 }}>
        <Text style={styles.title}>Booking Confirmed</Text>
        {!!salonName && <Text style={styles.salon}>{salonName}</Text>}
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <Pressable style={styles.primaryBtn} onPress={() => navigation.popToTop()}>
          <Text style={styles.primaryBtnText}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#6C63FF10',
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  title: {
    fontSize: 22,
    color: '#141118',
    fontWeight: '800',
    textAlign: 'center',
  },
  salon: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 2,
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
  },
  primaryBtn: {
    minHeight: 52,
    borderRadius: 14,
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
