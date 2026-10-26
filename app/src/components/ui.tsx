// Uygulamanın temel yapı taşları. Tüm ekranlar bunları kullanır.

import { type ReactNode, createContext, useCallback, useContext, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IllustratedAvatar } from '@/components/art/avatar';
import { API_URL } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { fonts, gradients, radius, space, type, useColors } from '@/theme';

// ---------- Metin ----------

type TProps = { children: ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number; color?: string };

export function Display({ children, style, numberOfLines, color }: TProps) {
  const c = useColors();
  return (
    <Text numberOfLines={numberOfLines} style={[{ fontFamily: fonts.display, fontSize: type.display, lineHeight: type.display * 1.15, color: color ?? c.ink }, style]}>
      {children}
    </Text>
  );
}

export function Title({ children, style, numberOfLines, color }: TProps) {
  const c = useColors();
  return (
    <Text numberOfLines={numberOfLines} style={[{ fontFamily: fonts.display, fontSize: type.title, lineHeight: type.title * 1.2, color: color ?? c.ink }, style]}>
      {children}
    </Text>
  );
}

/** Bölüm başlığı: yuvarlak başlık harfiyle, küçük boyutta. */
export function Heading({ children, style, color }: TProps) {
  const c = useColors();
  return (
    <Text style={[{ fontFamily: fonts.displayMedium, fontSize: type.lead, lineHeight: type.lead * 1.2, color: color ?? c.ink, marginTop: space.xl, marginBottom: space.sm }, style]}>
      {children}
    </Text>
  );
}

export function Body({ children, style, numberOfLines, color }: TProps) {
  const c = useColors();
  return (
    <Text numberOfLines={numberOfLines} style={[{ fontFamily: fonts.body, fontSize: type.body, lineHeight: type.body * 1.45, color: color ?? c.ink }, style]}>
      {children}
    </Text>
  );
}

export function Strong({ children, style, numberOfLines, color }: TProps) {
  const c = useColors();
  return (
    <Text numberOfLines={numberOfLines} style={[{ fontFamily: fonts.bodyBold, fontSize: type.body, lineHeight: type.body * 1.4, color: color ?? c.ink }, style]}>
      {children}
    </Text>
  );
}

export function Small({ children, style, numberOfLines, color }: TProps) {
  const c = useColors();
  return (
    <Text numberOfLines={numberOfLines} style={[{ fontFamily: fonts.body, fontSize: type.small, lineHeight: type.small * 1.4, color: color ?? c.inkSoft }, style]}>
      {children}
    </Text>
  );
}

// ---------- Düzen ----------

export function Screen({
  children,
  scroll = true,
  padded = true,
  edges = ['top'],
  refreshing,
  footer,
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: ('top' | 'bottom')[];
  refreshing?: ReactNode;
  footer?: ReactNode;
}) {
  const c = useColors();
  const inner = padded ? { paddingHorizontal: space.lg, paddingBottom: space.xxl } : undefined;
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: c.paper }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[inner, { maxWidth: 640, width: '100%', alignSelf: 'center' }]}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshing as any}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, maxWidth: 640, width: '100%', alignSelf: 'center' }, inner]}>{children}</View>
      )}
      {footer}
    </SafeAreaView>
  );
}

export function Row({ children, style, gap = space.sm }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <View
      style={[
        {
          backgroundColor: c.surface,
          borderRadius: radius.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.line,
          padding: space.lg,
          shadowColor: c.shadow,
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ---------- Düğmeler ----------

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  small,
  accessibilityLabel,
}: {
  accessibilityLabel?: string;
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const c = useColors();
  const primary = variant === 'primary';
  const bg = variant === 'danger' ? c.danger : 'transparent';
  const fg = primary ? '#FFFFFF' : variant === 'danger' ? c.onInk : c.ink;
  const border = variant === 'secondary' ? c.ink : 'transparent';
  const off = disabled || loading;
  const label = loading ? (
    <ActivityIndicator color={fg} />
  ) : (
    <Text style={{ fontFamily: fonts.bodyBold, fontSize: small ? type.small : type.body, color: variant === 'ghost' ? c.blue : fg }}>{title}</Text>
  );
  const pad = { paddingVertical: small ? space.sm : space.md + 2, paddingHorizontal: small ? space.md + 2 : space.lg };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!off }}
      onPress={off ? undefined : onPress}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          borderRadius: radius.pill,
          overflow: 'hidden',
          opacity: off ? 0.45 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        primary ? null : [pad, { alignItems: 'center', justifyContent: 'center' }],
        style,
      ]}
    >
      {primary ? (
        // Ana düğme: Hot Pink → Electric Purple degradesi
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[pad, { alignItems: 'center', justifyContent: 'center', flexGrow: 1 }]}
        >
          {label}
        </LinearGradient>
      ) : (
        label
      )}
    </Pressable>
  );
}

/** Seçenek grubu: süre, tür, şehir seçimi gibi. */
export function Choice<T extends string | number>({
  options,
  value,
  onChange,
  wrap = true,
}: {
  options: { value: T; label: string; hint?: string; disabled?: boolean }[];
  value: T | null;
  onChange: (v: T) => void;
  wrap?: boolean;
}) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', flexWrap: wrap ? 'wrap' : 'nowrap', gap: space.sm }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active, disabled: !!o.disabled }}
            onPress={o.disabled ? undefined : () => onChange(o.value)}
            style={{
              paddingVertical: space.sm,
              paddingHorizontal: space.md,
              borderRadius: radius.control,
              borderWidth: 1.5,
              borderColor: active ? c.blue : c.line,
              backgroundColor: active ? c.blue : c.surface,
              opacity: o.disabled ? 0.4 : 1,
            }}
          >
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: type.small, color: active ? c.onBlue : c.ink }}>{o.label}</Text>
            {o.hint ? (
              <Text style={{ fontFamily: fonts.body, fontSize: type.caption, color: active ? c.onBlue : c.inkSoft, opacity: active ? 0.8 : 1 }}>{o.hint}</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------- Girdi ----------

export function Field({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  const c = useColors();
  return (
    <View style={{ marginBottom: space.lg }}>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: type.small, color: c.ink, marginBottom: space.xs }}>{label}</Text>
      <TextInput
        placeholderTextColor={c.inkSoft}
        {...props}
        style={[
          {
            fontFamily: fonts.body,
            fontSize: type.body,
            color: c.ink,
            backgroundColor: c.surface,
            borderWidth: 1.5,
            borderColor: c.line,
            borderRadius: radius.control,
            paddingHorizontal: space.md,
            paddingVertical: space.md,
          },
          props.style,
        ]}
      />
      {hint ? <Small style={{ marginTop: space.xs }}>{hint}</Small> : null}
    </View>
  );
}

// ---------- Göstergeler ----------

/** Yatay gösterge çubuğu (ruh hâli, sağlık, beceri). */
export function Meter({ label, value, max = 100, color, right }: { label: string; value: number; max?: number; color?: string; right?: string }) {
  const c = useColors();
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <View style={{ marginBottom: space.md }} accessible accessibilityLabel={`${label} ${Math.round(value)}`}>
      <Row style={{ justifyContent: 'space-between', marginBottom: space.xs }}>
        <Small color={c.ink}>{label}</Small>
        <Small color={c.ink} style={{ fontFamily: fonts.bodyBold }}>{right ?? Math.round(value)}</Small>
      </Row>
      <View style={{ height: 6, backgroundColor: c.line, borderRadius: 3, overflow: 'hidden' }}>
        {color ? (
          <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: color }} />
        ) : (
          <LinearGradient colors={gradients.progress} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${pct * 100}%`, height: '100%' }} />
        )}
      </View>
    </View>
  );
}

export function Avatar({ name, color, size = 40, uri }: { name: string; color: string; size?: number; uri?: string | null }) {
  if (uri) {
    return (
      <Image
        source={{ uri: uri.startsWith('/') ? `${API_URL}/api${uri}` : uri }}
        accessibilityLabel={name}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }}
      />
    );
  }
  // Fotoğraf yoksa isimden türeyen çizim portre
  return <IllustratedAvatar name={name} color={color} size={size} />;
}

/** Dokunulabilir liste satırı. */
export function ListRow({
  title,
  subtitle,
  right,
  left,
  onPress,
  last,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  left?: ReactNode;
  onPress?: () => void;
  last?: boolean;
}) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        paddingVertical: space.md,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: c.line,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {left}
      <View style={{ flex: 1 }}>
        <Strong numberOfLines={1}>{title}</Strong>
        {subtitle ? <Small numberOfLines={2}>{subtitle}</Small> : null}
      </View>
      {typeof right === 'string' ? <Small color={c.ink}>{right}</Small> : right}
    </Pressable>
  );
}

export function Empty({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <View style={{ paddingVertical: space.lg, gap: space.md }}>
      <Body color={useColors().inkSoft}>{text}</Body>
      {action}
    </View>
  );
}

export function Loading() {
  const c = useColors();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.paper, padding: space.xl }}>
      <ActivityIndicator color={c.pink} size="large" />
    </View>
  );
}

export function ErrorView({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { err, t } = useI18n();
  const c = useColors();
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: space.xl, gap: space.lg, backgroundColor: c.paper }}>
      <Body>{err(error)}</Body>
      {onRetry ? <Button title={t('retry')} variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

/** Şerit başlık: ekran başında, geri düğmesi gerekmeyen sekme ekranları için. */
export function ScreenHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View style={{ paddingTop: space.lg, paddingBottom: space.sm }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Display numberOfLines={2}>{title}</Display>
          {subtitle ? <Small style={{ marginTop: space.xs }}>{subtitle}</Small> : null}
        </View>
        {right}
      </Row>
    </View>
  );
}

// ---------- Kısa bildirimler (toast) ----------

type Toast = { id: number; text: string; tone: 'info' | 'error' };
const ToastCtx = createContext<(text: string, tone?: Toast['tone']) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const c = useColors();
  const [toast, setToast] = useState<Toast | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (text: string, tone: Toast['tone'] = 'info') => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ id: Date.now(), text, tone });
      Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setToast(null));
      }, 3200);
    },
    [anim],
  );

  return (
    <ToastCtx.Provider value={show}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={{
            position: 'absolute',
            left: space.lg,
            right: space.lg,
            bottom: 96,
            opacity: anim,
            transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
            backgroundColor: toast.tone === 'error' ? c.danger : c.ink,
            borderRadius: radius.control,
            padding: space.md,
            maxWidth: 600,
            alignSelf: 'center',
          }}
        >
          <Text style={{ fontFamily: fonts.bodyMedium, fontSize: type.small, color: toast.tone === 'error' ? c.onInk : c.paper }}>{toast.text}</Text>
        </Animated.View>
      ) : null}
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
