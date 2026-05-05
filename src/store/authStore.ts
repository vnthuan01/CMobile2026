import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { queryClient } from '../lib/queryClient';
import type { AuthTokens, StoredAuthTokens, User } from '../types/auth';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setTokens: (
    accessToken: string,
    refreshToken: string | null,
  ) => Promise<void>;
  setUser: (user: User) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  logout: () => Promise<void>;
  hydrateAuth: () => Promise<void>;
}

const STORAGE_KEY = 'auth_tokens';
const USER_STORAGE_KEY = 'auth_user';

/** Web uses an empty ExpoSecureStore stub; fall back to AsyncStorage. */
const FALLBACK_PREFIX = '@secure_fallback:';

function fallbackKey(key: string) {
  return `${FALLBACK_PREFIX}${key}`;
}

async function secureSetItem(key: string, value: string) {
  if (await SecureStore.isAvailableAsync()) {
    await AsyncStorage.removeItem(fallbackKey(key));
    await SecureStore.setItemAsync(key, value);
  } else {
    await AsyncStorage.setItem(fallbackKey(key), value);
  }
}

async function secureGetItem(key: string): Promise<string | null> {
  if (await SecureStore.isAvailableAsync()) {
    return SecureStore.getItemAsync(key);
  }
  return AsyncStorage.getItem(fallbackKey(key));
}

async function secureRemoveItem(key: string) {
  if (await SecureStore.isAvailableAsync()) {
    await SecureStore.deleteItemAsync(key);
  }
  await AsyncStorage.removeItem(fallbackKey(key));
}

async function saveTokens(tokens: AuthTokens | StoredAuthTokens | null) {
  if (!tokens?.accessToken) {
    await secureRemoveItem(STORAGE_KEY);
    return;
  }

  await secureSetItem(STORAGE_KEY, JSON.stringify(tokens));
}

async function loadTokens(): Promise<StoredAuthTokens> {
  const rawValue = await secureGetItem(STORAGE_KEY);

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
    await secureRemoveItem(STORAGE_KEY);
    return { accessToken: null, refreshToken: null };
  }
}

export const useAuthStore = create<AuthState>(
  (set: (partial: Partial<AuthState>) => void) => ({
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
      } catch {
        set({ isAuthenticated: Boolean(accessToken) });
      }
    },

    setUser: async (user: User) => {
      try {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        set({ user });
      } catch {
        set({ user });
      }
    },

    setLoading: (isLoading: boolean) => {
      set({ isLoading });
    },

    logout: async () => {
      try {
        await Promise.all([
          secureRemoveItem(STORAGE_KEY),
          AsyncStorage.removeItem(USER_STORAGE_KEY),
        ]);

        queryClient.clear();

        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      } catch {
        queryClient.clear();

        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
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
      } catch {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      } finally {
        set({ isLoading: false });
      }
    },
  }),
);
