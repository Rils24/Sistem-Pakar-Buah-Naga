import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';
import { fetchUserByEmail, fetchUserById, insertUser, updateUser } from '@/services/supabaseService';
import { setSupabaseUserId, clearSupabaseUserId } from '@/lib/supabase';
import {
  hashPassword,
  verifyPassword,
  isBcryptHash,
  createSession,
  getSession,
  clearSession,
  refreshSession,
  updateSessionData,
} from '@/lib/auth';

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

  // Cek session saat mount — validasi session + cek user di database
  useEffect(() => {
    const checkSession = async () => {
      // Cek session baru terlebih dahulu
      const session = getSession();

      if (session) {
        try {
          // Set user ID untuk RLS sebelum validasi
          setSupabaseUserId(session.userId);
          // Validasi user masih ada di database
          const dbUser = await fetchUserById(session.userId);
          if (dbUser) {
            // Refresh session expiry setiap kali user aktif
            refreshSession();
            setAuthState({
              user: dbUser,
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            // User sudah tidak ada di DB — hapus session
            clearSupabaseUserId();
            clearSession();
            setAuthState({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch {
          // DB error — tetap gunakan data session sebagai fallback
          const fallbackUser: User = {
            id: session.userId,
            nama: session.nama,
            email: session.email,
            password: '', // Tidak disimpan di session
            role: session.role,
          };
          setAuthState({ user: fallbackUser, isAuthenticated: true, isLoading: false });
        }
      } else {
        // Migrasi: cek apakah ada session format lama (currentUser)
        const legacyUser = localStorage.getItem('currentUser');
        if (legacyUser) {
          try {
            const parsed = JSON.parse(legacyUser);
            const dbUser = await fetchUserById(parsed.id);
            if (dbUser) {
              // Migrasi ke session format baru
              setSupabaseUserId(dbUser.id);
              createSession(dbUser);
              localStorage.removeItem('currentUser');
              setAuthState({ user: dbUser, isAuthenticated: true, isLoading: false });
              return;
            }
          } catch {
            // Gagal migrasi, abaikan
          }
          localStorage.removeItem('currentUser');
        }
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

      // Cek password — support migrasi dari plain-text ke bcrypt
      let passwordValid = false;

      if (isBcryptHash(user.password)) {
        // Password sudah di-hash — verifikasi dengan bcrypt
        passwordValid = await verifyPassword(password, user.password);
      } else {
        // Password masih plain-text (data lama) — cocokkan langsung
        passwordValid = user.password === password;

        if (passwordValid) {
          // Auto-migrasi: hash password lama dan update di database
          try {
            const hashed = await hashPassword(password);
            await updateUser(user.id, { password: hashed });
          } catch (err) {
            console.warn('Gagal migrasi hash password (akan dicoba lagi nanti):', err);
          }
        }
      }

      if (!passwordValid) {
        return { success: false, message: 'Password salah' };
      }

      // Set user ID untuk RLS + buat session aman (tanpa password)
      setSupabaseUserId(user.id);
      createSession(user);
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

      // Hash password sebelum disimpan ke database
      const hashedPassword = await hashPassword(password);
      
      const newUser: User = {
        id: `u${Date.now()}`,
        nama,
        email,
        password: hashedPassword,
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
    clearSupabaseUserId();
    clearSession();
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

      // Jika ada perubahan password, hash terlebih dahulu
      const dataToUpdate = { ...updatedData };
      if (dataToUpdate.password) {
        dataToUpdate.password = await hashPassword(dataToUpdate.password);
      }

      const updatedUser = await updateUser(authState.user.id, dataToUpdate);

      // Update session data (tanpa password)
      updateSessionData({
        nama: updatedUser.nama,
        email: updatedUser.email,
        role: updatedUser.role,
      });

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

  // Fungsi tambahan: verifikasi password saat ini (untuk halaman profil)
  const verifyCurrentPassword = useCallback(async (plainPassword: string): Promise<boolean> => {
    if (!authState.user) return false;
    
    try {
      // Ambil user terbaru dari database untuk mendapat password hash
      const dbUser = await fetchUserById(authState.user.id);
      if (!dbUser) return false;

      if (isBcryptHash(dbUser.password)) {
        return verifyPassword(plainPassword, dbUser.password);
      } else {
        // Fallback: plain-text lama
        return dbUser.password === plainPassword;
      }
    } catch {
      return false;
    }
  }, [authState.user]);

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    verifyCurrentPassword,
  };
};
