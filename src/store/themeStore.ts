import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
    mode: ThemeMode;
    toggleTheme: () => Promise<void>;
    setTheme: (mode: ThemeMode) => Promise<void>;
    loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    mode: 'light',
    toggleTheme: async () => {
        const newMode = get().mode === 'light' ? 'dark' : 'light';
        set({ mode: newMode });
        try {
            await AsyncStorage.setItem('app_theme', newMode);
        } catch {
        }
    },
    setTheme: async (mode) => {
        set({ mode });
        try {
            await AsyncStorage.setItem('app_theme', mode);
        } catch {
        }
    },
    loadTheme: async () => {
        try {
            const saved = await AsyncStorage.getItem('app_theme');
            if (saved === 'dark' || saved === 'light') {
                set({ mode: saved });
            }
        } catch {
        }
    }
}));
