export const ThemeColors = {
  light: {
    primary: '#6D28D9',      // Violet-700
    primaryLight: '#8B5CF6', // Violet-500
    primaryDark: '#4C1D95',  // Violet-900
    accent: '#A78BFA',       // Violet-400
    background: '#F3F4F6',   // CoolGray-100
    backgroundAlt: '#EDE9FE',// Violet-100
    surface: '#FFFFFF',      // White
    text: '#1F2937',         // Gray-800
    textSecondary: '#6B7280',// Gray-500
    border: '#DDD6FE',       // Violet-200
    success: '#10B981',      // Emerald-500
    warning: '#F59E0B',      // Amber-500
    danger: '#EF4444',       // Red-500
    cardShadow: 'rgba(109, 40, 217, 0.08)'
  },
  dark: {
    primary: '#A78BFA',      // Violet-400
    primaryLight: '#C4B5FD', // Violet-300
    primaryDark: '#7C3AED',  // Violet-600
    accent: '#6D28D9',       // Violet-700
    background: '#0F0A1C',   // Very dark purple-black
    backgroundAlt: '#1E1530',// Slightly lighter deep purple
    surface: '#1A1230',      // Deep purple surface card
    text: '#F9FAFB',         // Gray-50
    textSecondary: '#9CA3AF',// Gray-400
    border: '#312A45',       // Dark purple-gray border
    success: '#34D399',      // Emerald-400
    warning: '#FBBF24',      // Amber-400
    danger: '#F87171',       // Red-400
    cardShadow: 'rgba(0, 0, 0, 0.3)'
  }
};

export const AppStyles = {
  container: {
    flex: 1,
  },
  titleLarge: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  titleMedium: {
    fontSize: 20,
    fontWeight: '700',
  },
  titleSmall: {
    fontSize: 16,
    fontWeight: '600',
  },
  textRegular: {
    fontSize: 14,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
  },
  shadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  }
};
