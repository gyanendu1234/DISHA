export const Colors = {
  primary: '#C41C1C',
  primaryDark: '#8B1212',
  primaryLight: '#FFF0F0',
  secondary: '#1B4332',
  secondaryLight: '#D1FAE5',
  accent: '#FFD166',
  accentDark: '#F59E0B',

  background: '#FFF8F8',
  surface: '#FFFFFF',
  surfaceAlt: '#FFF5F5',
  border: '#F0E8E8',

  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textInverse: '#FFFFFF',

  weatherBlue: '#0077B6',
  weatherBlueLight: '#E0F2FE',
  holidayRed: '#DC2626',
  holidayRedLight: '#FEE2E2',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',

  shadow: 'rgba(0,0,0,0.08)',
};

export const FontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 21,
  xl: 25,
  xxl: 32,
  hero: 44,
};

export const FontSizeScale = {
  small: 0.85,
  medium: 1,
  large: 1.25,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Font families — use these instead of hardcoding
export const Fonts = {
  or: 'NotoSansOdia',
  orBold: 'NotoSansOdia-Bold',
  en: 'Poppins',
  enSemiBold: 'Poppins-SemiBold',
  enBold: 'Poppins-Bold',
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#C41C1C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 10,
  },
  // 3D card — strong bottom shadow gives a "lifted slab" look
  card3d: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
};
