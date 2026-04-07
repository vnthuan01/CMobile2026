const common = {
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const COLORS = {
  light: {
    ...common,
    primary: '#2563EB',
    secondary: '#1E3A8A',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    card: '#FFFFFF',
    text: {
      main: '#111827',
      sub: '#6B7280',
      disabled: '#9CA3AF',
    },
    status: {
      incoming: '#2563EB',
      pending: '#F59E0B',
      inProgress: '#2563EB',
      completed: '#16A34A',
      cancelled: '#6B7280',
      error: '#DC2626',
      onHold: '#64748B',
    },
    border: '#E5E7EB',
  },
  dark: {
    ...common,
    primary: '#2563EB',
    secondary: '#1E3A8A',
    background: '#0F172A',
    surface: '#0F172A',
    card: '#1E293B',
    text: {
      main: '#F1F5F9',
      sub: '#94A3B8',
      disabled: '#64748B',
    },
    status: {
      incoming: '#2563EB',
      pending: '#F59E0B',
      inProgress: '#2563EB',
      completed: '#16A34A',
      cancelled: '#94A3B8',
      error: '#DC2626',
      onHold: '#64748B',
    },
    border: '#334155',
  },
};

const withAliases = <T extends typeof COLORS.light>(
  theme: T,
  isDark: boolean,
) => ({
  ...theme,
  card: theme.card,
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
