export const colors = {
  // Backgrounds
  bg: '#FFFFFF',
  bgCard: '#FFFFFF',
  bgInput: '#F5F5F5',
  bgBubbleOwn: '#000000',
  bgBubbleOther: '#F5F5F5',

  // Accent
  primary: '#000000',
  primaryLight: '#333333',
  primaryDark: '#000000',

  // Text
  textPrimary: '#000000',
  textSecondary: '#666666',
  textMuted: '#999999',
  textOnPrimary: '#FFFFFF',

  // UI
  border: '#EEEEEE',
  divider: '#F5F5F5',
  error: '#FF3B30',
  success: '#34C759',
  online: '#34C759',

  // Avatar palette (Grayscale/Minimalist colors)
  avatarColors: [
    '#000000', '#333333', '#555555', '#777777',
    '#999999', '#AAAAAA', '#CCCCCC', '#DDDDDD',
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
  sm: 4, // More squared, minimal edges
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  h1: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 32, color: colors.textPrimary },
  h2: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: colors.textPrimary },
  h3: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: colors.textPrimary },
  body: { fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.textPrimary },
  bodySmall: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary },
  caption: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textMuted },
  label: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
};

export const shadows = {
  card: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  button: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
};
