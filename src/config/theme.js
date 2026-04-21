export const colors = {
  // Backgrounds
  bg: '#0D0F14',
  bgCard: '#161A23',
  bgInput: '#1E2330',
  bgBubbleOwn: '#6C63FF',
  bgBubbleOther: '#1E2330',

  // Accent
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#4F48CC',

  // Text
  textPrimary: '#F0F2FF',
  textSecondary: '#8A92A6',
  textMuted: '#4A5065',
  textOnPrimary: '#FFFFFF',

  // UI
  border: '#252A38',
  divider: '#1E2330',
  error: '#FF6B6B',
  success: '#4ECDC4',
  online: '#4ECDC4',

  // Avatar palette (deterministic colors by index)
  avatarColors: [
    '#6C63FF', '#FF6B9D', '#4ECDC4', '#FFE66D',
    '#FF8E53', '#C471ED', '#12C2E9', '#F64F59',
  ],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  h2: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400', color: colors.textPrimary },
  bodySmall: { fontSize: 13, fontWeight: '400', color: colors.textSecondary },
  caption: { fontSize: 11, fontWeight: '400', color: colors.textMuted },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
};

export const shadows = {
  card: {
    elevation: 5,
  },
  button: {
    elevation: 8,
  },
};
