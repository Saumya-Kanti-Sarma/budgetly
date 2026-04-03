# Budgetly — Frontend Documentation

## Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 52 + React Native |
| Router | Expo Router v4 (file-based, app directory) |
| Language | TypeScript |
| State | Zustand (global) + React Query (server state) |
| HTTP | Axios with interceptors |
| Auth Storage | `expo-secure-store` (tokens) |
| UI Primitives | React Native core + `react-native-reusables` |
| Animations | `react-native-reanimated` v3 |
| Charts | `victory-native` |
| Icons | `lucide-react-native` |
| Fonts | `expo-google-fonts` (Fraunces, DM Sans, DM Mono) |
| Bottom Sheet | `@gorhom/bottom-sheet` |
| Forms | `react-hook-form` + Zod |
| Notifications | `expo-notifications` |

---

## Project Structure

```
budgetly/
├── app/
│   ├── _layout.tsx              # Root layout — font loading, auth gate, QueryClient
│   ├── (auth)/
│   │   ├── _layout.tsx          # Auth stack layout (no tab bar)
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (app)/
│       ├── _layout.tsx          # Authenticated tab/stack layout
│       ├── index.tsx            # Home — Month Grid
│       ├── [monthKey]/
│       │   ├── index.tsx        # Month Detail screen
│       │   └── [day].tsx        # Day Entry screen
│       └── settings.tsx         # User settings
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── PillTab.tsx
│   │   └── Tag.tsx
│   ├── month/
│   │   ├── MonthCard.tsx
│   │   └── MonthGrid.tsx
│   ├── entry/
│   │   ├── EntryRow.tsx
│   │   ├── EntryList.tsx
│   │   └── AddEntrySheet.tsx    # Bottom sheet form
│   ├── charts/
│   │   ├── DonutChart.tsx
│   │   └── SpendingBarChart.tsx
│   └── ai/
│       └── SummaryModal.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useMonths.ts
│   ├── useEntries.ts
│   └── useAISummary.ts
├── stores/
│   ├── authStore.ts             # Zustand — user, tokens
│   └── uiStore.ts              # Zustand — active month, active day
├── services/
│   ├── api.ts                  # Axios instance + interceptors
│   ├── auth.service.ts
│   ├── month.service.ts
│   ├── entry.service.ts
│   └── ai.service.ts
├── constants/
│   ├── colors.ts
│   ├── fonts.ts
│   ├── categories.ts           # Category metadata (label, icon, color)
│   └── spacing.ts
├── types/
│   ├── api.types.ts
│   ├── entry.types.ts
│   └── month.types.ts
├── utils/
│   ├── formatCurrency.ts
│   ├── formatDate.ts
│   └── monthKey.ts             # "2026-01" helpers
├── app.json
├── babel.config.js
├── tsconfig.json
└── package.json
```

---

## Routing Architecture (Expo Router v4)

```
app/
├── _layout.tsx          → Root: load fonts, wrap with QueryClientProvider + AuthProvider
├── (auth)/
│   ├── _layout.tsx      → Stack navigator, no header
│   ├── login.tsx        → /login
│   └── register.tsx     → /register
└── (app)/
    ├── _layout.tsx      → Protected layout — redirects to /login if not authed
    ├── index.tsx        → / — Home (Month Grid)
    ├── [monthKey]/
    │   ├── index.tsx    → /2026-01 — Month Detail
    │   └── [day].tsx    → /2026-01/15 — Day entries
    └── settings.tsx     → /settings
```

### Root `_layout.tsx`
```tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFonts,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  DMSans_400Regular,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';
import {
  DMMono_400Regular,
  DMMono_500Medium,
} from '@expo-google-fonts/dm-mono';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_700Bold,
    DMSans_400Regular,
    DMSans_600SemiBold,
    DMMono_400Regular,
    DMMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
```

### Protected `(app)/_layout.tsx`
```tsx
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

export default function AppLayout() {
  const { accessToken } = useAuthStore();
  if (!accessToken) return <Redirect href="/login" />;

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
```

---

## Constants

### `constants/colors.ts`
```typescript
export const Colors = {
  bg:          '#F5F0E8',
  surface:     '#FFFFFF',
  primary:     '#4A6CF7',
  accentRed:   '#E8533A',
  accentGold:  '#F2C14E',
  accentMint:  '#5ECFA0',
  textDark:    '#1A1A2E',
  textMid:     '#5A5A7A',
  textLight:   '#A0A0B8',
  border:      '#D8D0C4',
} as const;

// Color rotation for month cards
export const CARD_COLORS = [
  Colors.primary,
  Colors.accentRed,
  Colors.accentGold,
  Colors.accentMint,
] as const;
```

### `constants/fonts.ts`
```typescript
export const Fonts = {
  display:       'Fraunces_700Bold',
  body:          'DMSans_400Regular',
  bodySemibold:  'DMSans_600SemiBold',
  mono:          'DMMono_400Regular',
  monoMedium:    'DMMono_500Medium',
} as const;
```

### `constants/categories.ts`
```typescript
import { ShoppingBag, Car, UtensilsCrossed, HeartPulse, Tv, Zap, MoreHorizontal } from 'lucide-react-native';

export const CATEGORIES = [
  { key: 'Food',          label: 'Food',          Icon: UtensilsCrossed, color: '#E8533A' },
  { key: 'Transport',     label: 'Transport',      Icon: Car,             color: '#4A6CF7' },
  { key: 'Shopping',      label: 'Shopping',       Icon: ShoppingBag,     color: '#F2C14E' },
  { key: 'Health',        label: 'Health',         Icon: HeartPulse,      color: '#5ECFA0' },
  { key: 'Entertainment', label: 'Entertainment',  Icon: Tv,              color: '#A78BFA' },
  { key: 'Utilities',     label: 'Utilities',      Icon: Zap,             color: '#60A5FA' },
  { key: 'Other',         label: 'Other',          Icon: MoreHorizontal,  color: '#A0A0B8' },
] as const;

export type CategoryKey = typeof CATEGORIES[number]['key'];
```

### `constants/spacing.ts`
```typescript
export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;
```

---

## State Management

### `stores/authStore.ts` (Zustand)
```typescript
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  user: { _id: string; name: string; email: string; currency: string } | null;
  accessToken:  string | null;
  refreshToken: string | null;
  setAuth: (user: AuthState['user'], access: string, refresh: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:         null,
  accessToken:  null,
  refreshToken: null,

  setAuth: (user, accessToken, refreshToken) => {
    SecureStore.setItemAsync('accessToken',  accessToken);
    SecureStore.setItemAsync('refreshToken', refreshToken);
    set({ user, accessToken, refreshToken });
  },

  clearAuth: () => {
    SecureStore.deleteItemAsync('accessToken');
    SecureStore.deleteItemAsync('refreshToken');
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));
```

---

## API Layer

### `services/api.ts`
```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach access token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      await SecureStore.setItemAsync('accessToken', data.data.accessToken);
      original.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return api(original);
    }
    return Promise.reject(error);
  }
);
```

### `services/month.service.ts`
```typescript
import { api } from './api';
import { IMonth } from '../types/month.types';

export const monthService = {
  getAll: () =>
    api.get<{ data: IMonth[] }>('/months').then((r) => r.data.data),

  getOne: (monthKey: string) =>
    api.get<{ data: IMonth }>(`/months/${monthKey}`).then((r) => r.data.data),
};
```

### `services/entry.service.ts`
```typescript
import { api } from './api';
import { IEntry, CreateEntryInput, UpdateEntryInput } from '../types/entry.types';

export const entryService = {
  getByMonth: (monthKey: string) =>
    api.get<{ data: { entries: IEntry[]; groupedByDay: Record<string, IEntry[]> } }>(
      `/entries/${monthKey}`
    ).then((r) => r.data.data),

  getByDay: (monthKey: string, day: number) =>
    api.get<{ data: IEntry[] }>(`/entries/${monthKey}/${day}`).then((r) => r.data.data),

  create: (body: CreateEntryInput) =>
    api.post<{ data: IEntry }>('/entries', body).then((r) => r.data.data),

  update: (entryId: string, body: UpdateEntryInput) =>
    api.patch<{ data: IEntry }>(`/entries/${entryId}`, body).then((r) => r.data.data),

  remove: (entryId: string) =>
    api.delete(`/entries/${entryId}`),
};
```

---

## React Query Hooks

### `hooks/useMonths.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { monthService } from '../services/month.service';

export const useMonths = () =>
  useQuery({
    queryKey: ['months'],
    queryFn:  monthService.getAll,
    staleTime: 1000 * 60 * 5, // 5 min
  });

export const useMonth = (monthKey: string) =>
  useQuery({
    queryKey: ['months', monthKey],
    queryFn:  () => monthService.getOne(monthKey),
    enabled:  !!monthKey,
  });
```

### `hooks/useEntries.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entryService } from '../services/entry.service';
import { CreateEntryInput } from '../types/entry.types';

export const useEntries = (monthKey: string) =>
  useQuery({
    queryKey: ['entries', monthKey],
    queryFn:  () => entryService.getByMonth(monthKey),
    enabled:  !!monthKey,
  });

export const useCreateEntry = (monthKey: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEntryInput) => entryService.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries', monthKey] });
      qc.invalidateQueries({ queryKey: ['months'] });
    },
  });
};

export const useDeleteEntry = (monthKey: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => entryService.remove(entryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries', monthKey] });
      qc.invalidateQueries({ queryKey: ['months'] });
    },
  });
};
```

### `hooks/useAISummary.ts`
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const useAISummary = (monthKey: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<{ data: { summary: string; cached: boolean } }>(
        `/ai/summarize/${monthKey}`
      ).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['months', monthKey] });
    },
  });
};
```

---

## Screen Implementations

### Home Screen (`app/(app)/index.tsx`)
```tsx
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useMonths } from '../../hooks/useMonths';
import { useAuthStore } from '../../stores/authStore';
import { MonthCard } from '../../components/month/MonthCard';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: months = [], isLoading } = useMonths();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.name}>{user?.name ?? 'There'} 👋</Text>
        </View>
      </View>

      {/* Month Grid */}
      <View style={styles.grid}>
        {months.map((month, index) => (
          <MonthCard
            key={month.monthKey}
            month={month}
            colorIndex={index % 4}
            onPress={() => router.push(`/${month.monthKey}`)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.bg },
  content:    { padding: Spacing.md, paddingBottom: Spacing.xxl },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  greeting:   { fontFamily: Fonts.body, fontSize: 14, color: Colors.textMid, letterSpacing: 1 },
  name:       { fontFamily: Fonts.display, fontSize: 30, color: Colors.textDark },
  grid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
```

---

### Month Detail Screen (`app/(app)/[monthKey]/index.tsx`)
```tsx
import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMonth } from '../../../hooks/useMonths';
import { useEntries } from '../../../hooks/useEntries';
import { DaySelector } from '../../../components/month/DaySelector';
import { DonutChart } from '../../../components/charts/DonutChart';
import { SpendingBarChart } from '../../../components/charts/SpendingBarChart';
import { SummaryModal } from '../../../components/ai/SummaryModal';
import { Button } from '../../../components/ui/Button';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing } from '../../../constants/spacing';
import { formatCurrency } from '../../../utils/formatCurrency';

export default function MonthDetailScreen() {
  const { monthKey } = useLocalSearchParams<{ monthKey: string }>();
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const { data: month } = useMonth(monthKey);
  const { data: entriesData } = useEntries(monthKey);

  const daysInMonth = Object.keys(entriesData?.groupedByDay ?? {}).map(Number).sort((a, b) => a - b);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <Text style={styles.monthTitle}>{month?.label ?? monthKey}</Text>

        {/* Day Selector */}
        <DaySelector
          days={daysInMonth}
          selected={selectedDay}
          onSelect={(day) => {
            setSelectedDay(day);
            router.push(`/${monthKey}/${day}`);
          }}
        />

        {/* Summary Cards */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Spending</Text>
          <Text style={styles.summaryAmount}>
            {formatCurrency(month?.totalSpending ?? 0)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Most Spent On</Text>
          <Text style={styles.summaryValue}>{month?.topCategory ?? '—'}</Text>
        </View>

        {/* Charts */}
        <View style={styles.chartsRow}>
          <View style={[styles.chartCard, { flex: 1 }]}>
            <DonutChart data={month?.categoryBreakdown ?? []} />
          </View>
          <View style={[styles.chartCard, { flex: 1 }]}>
            <SpendingBarChart monthKey={monthKey} groupedByDay={entriesData?.groupedByDay ?? {}} />
          </View>
        </View>

        {/* AI Button */}
        <Button
          label="✦  Summarize with AI"
          onPress={() => setShowSummary(true)}
          style={styles.aiButton}
        />
      </ScrollView>

      <SummaryModal
        visible={showSummary}
        monthKey={monthKey}
        onClose={() => setShowSummary(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content:      { padding: Spacing.md, paddingBottom: 100 },
  monthTitle:   { fontFamily: Fonts.display, fontSize: 28, color: Colors.textDark, marginBottom: Spacing.lg },
  summaryCard:  { backgroundColor: Colors.surface, borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.sm },
  summaryLabel: { fontFamily: Fonts.body, fontSize: 12, color: Colors.textMid, marginBottom: 4 },
  summaryAmount:{ fontFamily: Fonts.monoMedium, fontSize: 28, color: Colors.accentRed },
  summaryValue: { fontFamily: Fonts.bodySemibold, fontSize: 18, color: Colors.textDark },
  chartsRow:    { flexDirection: 'row', gap: 12, marginVertical: Spacing.md },
  chartCard:    { backgroundColor: Colors.surface, borderRadius: 16, padding: Spacing.md },
  aiButton:     { marginTop: Spacing.lg },
});
```

---

### Day Entry Screen (`app/(app)/[monthKey]/[day].tsx`)
```tsx
import { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useEntries } from '../../../hooks/useEntries';
import { EntryRow } from '../../../components/entry/EntryRow';
import { AddEntrySheet } from '../../../components/entry/AddEntrySheet';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing } from '../../../constants/spacing';
import { formatDate } from '../../../utils/formatDate';

export default function DayScreen() {
  const { monthKey, day } = useLocalSearchParams<{ monthKey: string; day: string }>();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const { data: entriesData } = useEntries(monthKey);
  const dayEntries = entriesData?.groupedByDay?.[day] ?? [];

  return (
    <View style={styles.container}>
      <Text style={styles.dateTitle}>{formatDate(monthKey, Number(day))}</Text>

      <FlatList
        data={dayEntries}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <EntryRow entry={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No entries yet. Add one below!</Text>
        }
      />

      {/* Add Entry FAB */}
      <Pressable style={styles.fab} onPress={() => setShowAddSheet(true)}>
        <Plus size={24} color="#fff" />
        <Text style={styles.fabLabel}>Add Entry</Text>
      </Pressable>

      <AddEntrySheet
        visible={showAddSheet}
        monthKey={monthKey}
        day={Number(day)}
        onClose={() => setShowAddSheet(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  dateTitle: { fontFamily: Fonts.display, fontSize: 22, color: Colors.textDark, padding: Spacing.md },
  list:      { padding: Spacing.md, paddingBottom: 120 },
  empty:     { fontFamily: Fonts.body, fontSize: 14, color: Colors.textLight, textAlign: 'center', marginTop: 40 },
  fab: {
    position: 'absolute', bottom: 32, left: Spacing.md, right: Spacing.md,
    backgroundColor: Colors.primary, borderRadius: 50,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  fabLabel: { fontFamily: Fonts.bodySemibold, fontSize: 15, color: '#fff' },
});
```

---

## Key Components

### `components/month/MonthCard.tsx`
```tsx
import { Pressable, Text, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { CARD_COLORS } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { IMonth } from '../../types/month.types';
import { formatCurrency } from '../../utils/formatCurrency';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  month: IMonth;
  colorIndex: number;
  onPress: () => void;
}

export const MonthCard = ({ month, colorIndex, onPress }: Props) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      style={[styles.card, { backgroundColor: CARD_COLORS[colorIndex] }, animStyle]}
      onPressIn={() => { scale.value = withSpring(0.96) }}
      onPressOut={() => { scale.value = withSpring(1) }}
      onPress={onPress}
    >
      <Text style={styles.monthName}>{month.label.split(' ')[0]}</Text>
      <Text style={styles.year}>{month.label.split(' ')[1]}</Text>
      <Text style={styles.amount}>{formatCurrency(month.totalSpending)}</Text>
      <Text style={styles.count}>{month.entryCount} entries</Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card:      { width: '47%', borderRadius: 20, padding: 16, minHeight: 120, justifyContent: 'space-between' },
  monthName: { fontFamily: Fonts.display, fontSize: 20, color: '#fff' },
  year:      { fontFamily: Fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  amount:    { fontFamily: Fonts.monoMedium, fontSize: 18, color: '#fff', marginTop: 8 },
  count:     { fontFamily: Fonts.body, fontSize: 11, color: 'rgba(255,255,255,0.6)' },
});
```

### `components/entry/AddEntrySheet.tsx`
```tsx
import { useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateEntry } from '../../hooks/useEntries';
import { CATEGORIES } from '../../constants/categories';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const schema = z.object({
  description: z.string().min(1),
  category:    z.string(),
  amount:      z.string().transform(Number),
  note:        z.string().optional(),
});

interface Props {
  visible: boolean;
  monthKey: string;
  day: number;
  onClose: () => void;
}

export const AddEntrySheet = ({ visible, monthKey, day, onClose }: Props) => {
  const sheetRef = useRef<BottomSheet>(null);
  const { mutate: createEntry, isPending } = useCreateEntry(monthKey);
  const { control, handleSubmit, reset } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = (values: any) => {
    createEntry({ ...values, monthKey, day }, { onSuccess: () => { reset(); onClose(); } });
  };

  // Render bottom sheet form with category picker, description, amount fields
  // (Implementation follows react-hook-form + @gorhom/bottom-sheet patterns)
  return (
    <BottomSheet ref={sheetRef} snapPoints={['60%']} enablePanDownToClose onClose={onClose}>
      <BottomSheetView style={styles.container}>
        <Text style={styles.title}>New Entry</Text>
        {/* Fields: description, category grid, amount, note */}
        {/* Submit button */}
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title:     { fontFamily: Fonts.display, fontSize: 22, color: Colors.textDark, marginBottom: 16 },
});
```

### `components/ai/SummaryModal.tsx`
```tsx
import { Modal, View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useAISummary } from '../../hooks/useAISummary';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

interface Props {
  visible: boolean;
  monthKey: string;
  onClose: () => void;
}

export const SummaryModal = ({ visible, monthKey, onClose }: Props) => {
  const { mutate, data, isPending } = useAISummary(monthKey);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.handle} />
        <Text style={styles.title}>✦ AI Summary</Text>

        <View style={styles.summaryBox}>
          {isPending ? (
            <ActivityIndicator color={Colors.primary} />
          ) : data ? (
            <Text style={styles.summaryText}>{data.summary}</Text>
          ) : (
            <Text style={styles.placeholder}>Tap the button to get your spending summary.</Text>
          )}
        </View>

        <Pressable style={styles.button} onPress={() => mutate()}>
          <Text style={styles.buttonLabel}>
            {isPending ? 'Generating...' : '✦  Summarize with AI'}
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>Powered by Claude AI</Text>

        <Pressable onPress={onClose} style={styles.close}>
          <Text style={styles.closeLabel}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.bg, padding: 24, paddingTop: 16 },
  handle:      { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  title:       { fontFamily: Fonts.display, fontSize: 26, color: Colors.textDark, marginBottom: 24 },
  summaryBox:  { flex: 1, backgroundColor: Colors.surface, borderRadius: 20, padding: 20, justifyContent: 'center' },
  summaryText: { fontFamily: Fonts.body, fontSize: 16, color: Colors.textDark, lineHeight: 26 },
  placeholder: { fontFamily: Fonts.body, fontSize: 15, color: Colors.textLight, textAlign: 'center' },
  button:      { backgroundColor: Colors.primary, borderRadius: 50, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  buttonLabel: { fontFamily: Fonts.bodySemibold, fontSize: 15, color: '#fff' },
  disclaimer:  { fontFamily: Fonts.body, fontSize: 11, color: Colors.textLight, textAlign: 'center', marginTop: 8 },
  close:       { marginTop: 12, alignItems: 'center' },
  closeLabel:  { fontFamily: Fonts.body, fontSize: 14, color: Colors.textMid },
});
```

---

## Utility Functions

### `utils/formatCurrency.ts`
```typescript
export const formatCurrency = (
  amount: number,
  currency = 'INR',
  locale = 'en-IN'
): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
```

### `utils/formatDate.ts`
```typescript
export const formatDate = (monthKey: string, day: number): string => {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};
```

### `utils/monthKey.ts`
```typescript
export const toMonthKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const currentMonthKey = (): string => toMonthKey(new Date());
```

---

## Types

### `types/month.types.ts`
```typescript
export interface ICategoryBreakdown {
  category: string;
  total: number;
}

export interface IMonth {
  _id: string;
  monthKey: string;
  label: string;
  totalSpending: number;
  topCategory: string;
  categoryBreakdown: ICategoryBreakdown[];
  entryCount: number;
  lastSummary?: string;
  summaryGeneratedAt?: string;
}
```

### `types/entry.types.ts`
```typescript
export type Category = 'Food' | 'Transport' | 'Shopping' | 'Health' | 'Entertainment' | 'Utilities' | 'Other';

export interface IEntry {
  _id: string;
  monthKey: string;
  day: number;
  description: string;
  category: Category;
  amount: number;
  note?: string;
  createdAt: string;
}

export interface CreateEntryInput {
  monthKey: string;
  day: number;
  description: string;
  category: Category;
  amount: number;
  note?: string;
}

export type UpdateEntryInput = Partial<Omit<CreateEntryInput, 'monthKey' | 'day'>>;
```

---

## `app.json` (key config)

```json
{
  "expo": {
    "name": "Budgetly",
    "slug": "budgetly",
    "scheme": "budgetly",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "plugins": [
      "expo-router",
      "expo-secure-store",
      "expo-font"
    ],
    "extra": {
      "router": { "origin": false }
    }
  }
}
```

---

## `package.json` (key deps)

```json
{
  "scripts": {
    "start":    "expo start",
    "android":  "expo run:android",
    "ios":      "expo run:ios"
  },
  "dependencies": {
    "expo":                          "~52.0.0",
    "expo-router":                   "~4.0.0",
    "expo-secure-store":             "~14.0.0",
    "expo-font":                     "~13.0.0",
    "expo-splash-screen":            "~0.29.0",
    "@expo-google-fonts/fraunces":   "^0.3.0",
    "@expo-google-fonts/dm-sans":    "^0.3.0",
    "@expo-google-fonts/dm-mono":    "^0.3.0",
    "react-native-reanimated":       "~3.15.0",
    "@gorhom/bottom-sheet":          "^4.6.0",
    "@tanstack/react-query":         "^5.40.0",
    "zustand":                       "^4.5.4",
    "axios":                         "^1.7.2",
    "react-hook-form":               "^7.52.0",
    "@hookform/resolvers":           "^3.6.0",
    "zod":                           "^3.23.8",
    "victory-native":                "^41.0.0",
    "lucide-react-native":           "^0.396.0",
    "react-native-svg":              "^15.3.0"
  }
}
```

---

## Navigation Flow

```
/login          → on success → /
/register       → on success → /login
/              (Home)       → tap MonthCard → /[monthKey]
/[monthKey]    (Month Detail) → tap Day pill → /[monthKey]/[day]
               → tap "Summarize with AI" → SummaryModal (overlay)
/[monthKey]/[day] (Day) → tap "Add Entry" → AddEntrySheet (bottom sheet)
```

---

*Frontend documentation for Budgetly v1.0 — Expo + App Router + TypeScript*
