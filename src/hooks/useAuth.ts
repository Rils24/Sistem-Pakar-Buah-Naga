import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';
import { fetchUserByEmail, fetchUserById, insertUser, updateUser } from '@/services/supabaseService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Cek session saat mount — cek dari localStorage lalu validasi di Supabase
  useEffect(() => {
    const checkSession = async () => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          // Validasi user masih ada di database
          const dbUser = await fetchUserById(parsed.id);
          if (dbUser) {
            setAuthState({
              user: dbUser,
              isAuthenticated: true,
              isLoading: false
            });
            // Update localStorage dengan data terbaru
            localStorage.setItem('currentUser', JSON.stringify(dbUser));
          } else {
            // User tidak ada lagi di DB
            localStorage.removeItem('currentUser');
            setAuthState({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch {
          // Fallback: gunakan data localStorage jika DB error
          const user = JSON.parse(storedUser);
          setAuthState({ user, isAuthenticated: true, isLoading: false });
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };
    checkSession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const user = await fetchUserByEmail(email);
      
      if (!user) {
        return { success: false, message: 'Email tidak terdaftar' };
      }
      
      if (user.password !== password) {
        return { success: false, message: 'Password salah' };
      }
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
      
      return { success: true, message: 'Login berhasil' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Terjadi kesalahan, coba lagi' };
    }
  }, []);

  const register = useCallback(async (nama: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const existingUser = await fetchUserByEmail(email);
      
      if (existingUser) {
        return { success: false, message: 'Email sudah terdaftar' };
      }
      
      const newUser: User = {
        id: `u${Date.now()}`,
        nama,
        email,
        password,
        role: 'user',
        created_at: new Date().toISOString()
      };
      
      await insertUser(newUser);
      
      return { success: true, message: 'Registrasi berhasil, silakan login' };
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, message: 'Terjadi kesalahan, coba lagi' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('currentUser');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  }, []);

  const updateProfile = useCallback(async (updatedData: Partial<User>): Promise<{ success: boolean; message: string }> => {
    if (!authState.user) {
      return { success: false, message: 'User tidak ditemukan' };
    }

    try {
      // Cek email unik jika email diubah
      if (updatedData.email && updatedData.email !== authState.user.email) {
        const existingUser = await fetchUserByEmail(updatedData.email);
        if (existingUser) {
          return { success: false, message: 'Email sudah digunakan' };
        }
      }

      const updatedUser = await updateUser(authState.user.id, updatedData);

      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));

      return { success: true, message: 'Profil berhasil diperbarui' };
    } catch (err) {
      console.error('Update profile error:', err);
      return { success: false, message: 'Gagal memperbarui profil' };
    }
  }, [authState.user]);

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile
  };
};
