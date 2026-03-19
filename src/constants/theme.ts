export const Colors = {
  light: {
    primary: '#DA251D', // 🔴 Brand Red
    secondary: '#1565C0', // 🔵 Trust Blue
    accent: '#FFCC00', // 🟡 Yellow Accent
    background: '#F9FAFB',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#1F2933',
    textSecondary: '#616161',
    border: '#E0E0E0',
    divider: '#EEEEEE',
    icon: '#424242',
    notification: '#D32F2F',
    success: '#2E7D32',
    warning: '#F9A825',
    error: '#D32F2F',
    info: '#0288D1',
    overlay: 'rgba(0,0,0,0.55)',
  },
  dark: {
    primary: '#FF6F61', // 🔴 Softer red for dark
    secondary: '#64B5F6', // 🔵 Lighter blue for dark
    accent: '#FFD54F', // 🟡 Softer yellow for dark
    background: '#121212',
    surface: '#1E1E1E',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#BDBDBD',
    border: '#333333',
    divider: '#2A2A2A',
    icon: '#E0E0E0',
    notification: '#EF5350',
    success: '#66BB6A',
    warning: '#FBC02D',
    error: '#EF5350',
    info: '#4FC3F7',
    overlay: 'rgba(0,0,0,0.65)',
  },
};

export type ThemeColors = typeof Colors.light;
