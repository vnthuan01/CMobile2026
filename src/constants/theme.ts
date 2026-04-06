const common = {
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const COLORS = {
  light: {
    ...common,
    primary: '#4CAF50',
    secondary: '#03A9F4',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: {
      main: '#212121',
      sub: '#757575',
      disabled: '#BDBDBD',
    },
    status: {
      incoming: '#2196F3',
      pending: '#FF9800',
      inProgress: '#9C27B0',
      completed: '#4CAF50',
      cancelled: '#9E9E9E',
      error: '#F44336',
      onHold: '#607D8B',
    },
    border: '#EEEEEE',
  },
  dark: {
    ...common,
    primary: '#66BB6A',
    secondary: '#29B6F6',
    background: '#121212',
    surface: '#1E1E1E',
    text: {
      main: '#FFFFFF',
      sub: '#A0A0A0',
      disabled: '#424242',
    },
    status: {
      incoming: '#64B5F6',
      pending: '#FFB74D',
      inProgress: '#BA68C8',
      completed: '#81C784',
      cancelled: '#757575',
      error: '#E57373',
      onHold: '#90A4AE',
    },
    border: '#2C2C2C',
  },
};

const withAliases = <T extends typeof COLORS.light>(theme: T, isDark: boolean) => ({
  ...theme,
  card: theme.surface,
  text: theme.text.main,
  textSecondary: theme.text.sub,
  divider: theme.border,
  icon: theme.text.sub,
  success: theme.status.completed,
  warning: theme.status.pending,
  error: theme.status.error,
  info: theme.status.incoming,
  notification: theme.status.error,
  accent: theme.secondary,
  overlay: isDark ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.55)',
});

export const Colors = {
  light: withAliases(COLORS.light, false),
  dark: withAliases(COLORS.dark, true),
};

export type ThemeColors = typeof Colors.light;
