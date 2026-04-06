import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import create from 'zustand';
import type { AuthTokens, StoredAuthTokens, User } from '../types/auth';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setTokens: (accessToken: string, refreshToken: string | null) => Promise<void>;
  setUser: (user: User) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  logout: () => Promise<void>;
  hydrateAuth: () => Promise<void>;
}

const STORAGE_KEY = 'auth_tokens';
const USER_STORAGE_KEY = 'auth_user';

async function saveTokens(tokens: AuthTokens | StoredAuthTokens | null) {
  if (!tokens?.accessToken) {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    return;
  }

  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(tokens));
}

async function loadTokens(): Promise<StoredAuthTokens> {
  const rawValue = await SecureStore.getItemAsync(STORAGE_KEY);

  if (!rawValue) {
    return { accessToken: null, refreshToken: null };
  }

  try {
    const parsed = JSON.parse(rawValue) as StoredAuthTokens;
    return {
      accessToken: parsed?.accessToken ?? null,
      refreshToken: parsed?.refreshToken ?? null,
    };
  } catch {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    return { accessToken: null, refreshToken: null };
  }
}

export const useAuthStore = create<AuthState>((set: (partial: Partial<AuthState>) => void) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setTokens: async (accessToken: string, refreshToken: string | null) => {
    try {
      await saveTokens({ accessToken, refreshToken });
      set({
        accessToken,
        refreshToken,
        isAuthenticated: Boolean(accessToken),
      });
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  },

  setUser: async (user: User) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Error saving user:', error);
    }
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  logout: async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEY),
        AsyncStorage.removeItem(USER_STORAGE_KEY),
      ]);

      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  hydrateAuth: async () => {
    try {
      const [{ accessToken, refreshToken }, userData] = await Promise.all([
        loadTokens(),
        AsyncStorage.getItem(USER_STORAGE_KEY),
      ]);

      set({
        accessToken,
        refreshToken,
        isAuthenticated: Boolean(accessToken),
      });

      if (userData) {
        const user = JSON.parse(userData) as User;
        set({ user });
      }
    } catch (error) {
      console.error('Error restoring token:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
