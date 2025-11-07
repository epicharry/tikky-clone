import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hashPassword, verifyPassword } from '../utils/auth';

interface User {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
  followers_count: number;
  following_count: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!username || username.length < 3) {
        return { success: false, error: 'Username must be at least 3 characters' };
      }

      if (!password || password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      const passwordHash = await hashPassword(password);

      const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          username,
          password_hash: passwordHash,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
          return { success: false, error: 'Username already exists' };
        }
        return { success: false, error: 'Failed to create account' };
      }

      const data = await response.json();
      const newUser = Array.isArray(data) ? data[0] : data;

      const userWithoutPassword = {
        id: newUser.id,
        username: newUser.username,
        avatar_url: newUser.avatar_url,
        bio: newUser.bio,
        followers_count: newUser.followers_count,
        following_count: newUser.following_count,
        created_at: newUser.created_at,
      };

      setUser(userWithoutPassword);
      await AsyncStorage.setItem('user', JSON.stringify(userWithoutPassword));

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/users?username=eq.${encodeURIComponent(username)}&select=*`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        return { success: false, error: 'Failed to login' };
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        return { success: false, error: 'Invalid username or password' };
      }

      const userData = data[0];
      const isValid = await verifyPassword(password, userData.password_hash);

      if (!isValid) {
        return { success: false, error: 'Invalid username or password' };
      }

      const userWithoutPassword = {
        id: userData.id,
        username: userData.username,
        avatar_url: userData.avatar_url,
        bio: userData.bio,
        followers_count: userData.followers_count,
        following_count: userData.following_count,
        created_at: userData.created_at,
      };

      setUser(userWithoutPassword);
      await AsyncStorage.setItem('user', JSON.stringify(userWithoutPassword));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
