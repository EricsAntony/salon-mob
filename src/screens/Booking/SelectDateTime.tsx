import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ErrorBanner from '../../components/ErrorBanner';

// Types for route params
export type SelectedItem = {
  id: string;
  name: string;
  duration: string;
  price: number;
  category?: string;
};

export default function SelectDateTime() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {
    items: routeItems = [],
    heroImageUrl,
    salonName,
  } = (route.params || {}) as { items?: SelectedItem[]; heroImageUrl?: string; salonName?: string };
  const passedItems = useMemo<SelectedItem[]>(() => routeItems ?? [], [routeItems]);

  // Stylist select
  const stylistOptions = ['Any', 'Stylist A', 'Stylist B'];
  const [stylist, setStylist] = useState<string>('Any');
  const [stylistOpen, setStylistOpen] = useState(false);

  // Calendar state
  const now = new Date();
  const [month, setMonth] = useState<number>(now.getMonth());
  const [year, setYear] = useState<number>(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const monthLabel = useMemo(
    () => new Date(year, month, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    [month, year],
  );

  const weeks = useMemo(() => buildCalendar(year, month), [year, month]);

  const times = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM'];
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Group selected items by category for section headers
  const groups = useMemo(() => {
    const map = new Map<string, SelectedItem[]>();
    for (const it of passedItems) {
      const key = it.category || 'Your Services';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    if (map.size === 0) {
      map.set('Your Services', []);
    }
    return Array.from(map.entries());
  }, [passedItems]);

  useEffect(() => {
    if (bannerError && selectedDay != null && selectedTime) {
      setBannerError(null);
    }
  }, [bannerError, selectedDay, selectedTime]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" color="#141118" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Your Services</Text>
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
        {groups.map(([cat, items], idx) => (
          <View key={cat + idx}>
            <Text style={styles.sectionTitle}>{cat}</Text>

            {/* Service rows (show all selected under this category) */}
            {items.length === 0
              ? null
              : items.map((it) => (
                  <View key={it.id} style={styles.serviceRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.serviceName}>{it.name}</Text>
                      <Text style={styles.serviceMeta}>{it.duration}</Text>
                    </View>
                    <View>
                      <Text style={styles.servicePrice}>${it.price}</Text>
                    </View>
                  </View>
                ))}

            {/* Stylist select (one control, mirrors HTML select look) */}
            <View style={styles.selectRow}>
              <View style={styles.selectWrapper}>
                <Pressable onPress={() => setStylistOpen((v) => !v)} style={styles.selectBox}>
                  <Text style={styles.selectText}>{stylist}</Text>
                  <MaterialCommunityIcons
                    name={stylistOpen ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color="#756388"
                  />
                </Pressable>
                {stylistOpen && (
                  <View style={styles.selectDropdown}>
                    {stylistOptions.map((opt) => (
                      <Pressable
                        key={opt}
                        onPress={() => {
                          setStylist(opt);
                          setStylistOpen(false);
                        }}
                        style={styles.selectOption}
                      >
                        <Text style={styles.selectOptionText}>{opt}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Calendar header with month nav */}
            <View style={styles.calendarHeader}>
              <Pressable onPress={() => prevMonth({ month, year, setMonth, setYear })}>
                <View style={styles.iconBtnSmall}>
                  <MaterialCommunityIcons name="chevron-left" size={18} color="#141118" />
                </View>
              </Pressable>
              <Text style={styles.calendarTitle}>{monthLabel}</Text>
              <Pressable onPress={() => nextMonth({ month, year, setMonth, setYear })}>
                <View style={styles.iconBtnSmall}>
                  <MaterialCommunityIcons name="chevron-right" size={18} color="#141118" />
                </View>
              </Pressable>
            </View>

            {/* Weekday labels */}
            <View style={styles.weekdaysRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <Text key={`${d}-${i}`} style={styles.weekdayText}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.calendarGrid}>
              {weeks.map((week, wi) => (
                <View key={wi} style={styles.calendarWeek}>
                  {week.map((day, di) => {
                    const isSelected = day != null && day === selectedDay;
                    return (
                      <Pressable
                        key={di}
                        style={[styles.calendarCell]}
                        disabled={day == null}
                        onPress={() => setSelectedDay(day!)}
                      >
                        <View
                          style={[styles.calendarDot, isSelected && styles.calendarDotSelected]}
                        >
                          {day != null && (
                            <Text
                              style={[
                                styles.calendarDayText,
                                isSelected && styles.calendarDayTextSelected,
                              ]}
                            >
                              {day}
                            </Text>
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Timeslots */}
            <View style={styles.timesRow}>
              {times.map((t) => {
                const active = t === selectedTime;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setSelectedTime(t)}
                    style={[styles.timeChip, active && styles.timeChipActive]}
                  >
                    <Text style={[styles.timeChipText, active && styles.timeChipTextActive]}>
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom CTA */}
      <View>
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => {
              if (selectedDay == null || !selectedTime) {
                setBannerError('Please select a date and time to continue.');
                return;
              }
              const jsDate = new Date(year, month, selectedDay);
              const appointmentDate = jsDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              });
              navigation.navigate('ReviewConfirm', {
                items: passedItems,
                stylist,
                appointmentDate,
                appointmentTime: selectedTime,
                heroImageUrl,
                salonName,
              });
            }}
          >
            <Text style={styles.primaryBtnText}>Next: Review & Confirm</Text>
          </Pressable>
        </View>
        <View style={{ height: 20, backgroundColor: '#FFFFFF' }} />
      </View>
    </View>
  );
}

// Helpers
function prevMonth({ month, setMonth, setYear }: any) {
  if (month === 0) {
    setMonth(11);
    setYear((y: number) => y - 1);
  } else {
    setMonth((m: number) => m - 1);
  }
}
function nextMonth({ month, setMonth, setYear }: any) {
  if (month === 11) {
    setMonth(0);
    setYear((y: number) => y + 1);
  } else {
    setMonth((m: number) => m + 1);
  }
}
function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: Array<Array<number | null>> = [];
  let current = 1 - startDay;
  while (current <= daysInMonth) {
    const week: Array<number | null> = [];
    for (let i = 0; i < 7; i++) {
      const day = current + i;
      if (day < 1 || day > daysInMonth) week.push(null);
      else week.push(day);
    }
    weeks.push(week);
    current += 7;
  }
  return weeks;
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

  sectionTitle: {
    color: '#141118',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    minHeight: 72,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  serviceName: {
    color: '#141118',
    fontSize: 16,
    fontWeight: '600',
  },
  serviceMeta: {
    color: '#756388',
    fontSize: 14,
  },
  servicePrice: {
    color: '#141118',
    fontSize: 16,
  },

  selectRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectWrapper: {
    flex: 1,
    position: 'relative',
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0dce5',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 15,
  },
  selectText: {
    color: '#141118',
    fontSize: 16,
  },
  selectDropdown: {
    position: 'absolute',
    top: 62, // 56 (box height) + 6 spacing
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectOptionText: {
    color: '#141118',
    fontSize: 16,
  },

  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  iconBtnSmall: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTitle: {
    color: '#141118',
    fontSize: 16,
    fontWeight: '700',
  },
  weekdaysRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  weekdayText: {
    color: '#141118',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    height: 48,
    width: `${100 / 7}%` as any,
    textAlignVertical: 'center',
  },
  calendarGrid: {
    paddingHorizontal: 8,
  },
  calendarWeek: {
    flexDirection: 'row',
  },
  calendarCell: {
    height: 48,
    width: `${100 / 7}%` as any,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDotSelected: {
    backgroundColor: '#6C63FF',
  },
  calendarDayText: {
    color: '#141118',
    fontSize: 14,
    fontWeight: '600',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
  },

  timesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  timeChip: {
    height: 32,
    borderRadius: 12,
    backgroundColor: '#f2f0f4',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  timeChipActive: {
    backgroundColor: '#6C63FF',
  },
  timeChipText: {
    color: '#141118',
    fontSize: 14,
    fontWeight: '500',
  },
  timeChipTextActive: {
    color: '#FFFFFF',
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
