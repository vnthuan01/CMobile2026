import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  user_name: string;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setUser: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
}

const STORAGE_KEY = 'auth_tokens';
const USER_STORAGE_KEY = 'auth_user';

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setTokens: async (accessToken, refreshToken) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ accessToken, refreshToken }),
      );
      set({ accessToken, refreshToken, isAuthenticated: true });
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  },

  setUser: async (user) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Error saving user:', error);
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEY, USER_STORAGE_KEY]);
      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  restoreToken: async () => {
    try {
      const [tokensData, userData] = await AsyncStorage.multiGet([
        STORAGE_KEY,
        USER_STORAGE_KEY,
      ]);

      if (tokensData[1]) {
        const { accessToken, refreshToken } = JSON.parse(tokensData[1]);
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      }

      if (userData[1]) {
        const user = JSON.parse(userData[1]);
        set({ user });
      }
    } catch (error) {
      console.error('Error restoring token:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
