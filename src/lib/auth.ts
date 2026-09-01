// ============================================================
// AUTH UTILITIES
// Password hashing (bcryptjs) & Session management
// ============================================================

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const SESSION_KEY = 'auth_session';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 jam

// ============================================================
// PASSWORD HASHING
// ============================================================

/**
 * Hash password menggunakan bcrypt
 */
export const hashPassword = async (plainPassword: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainPassword, salt);
};

/**
 * Verifikasi password plain-text dengan hash yang tersimpan di database
 */
export const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Cek apakah string sudah berbentuk bcrypt hash (untuk migrasi dari plain-text)
 * Bcrypt hash selalu diawali dengan "$2a$" atau "$2b$" dan panjang 60 karakter
 */
export const isBcryptHash = (str: string): boolean => {
  return /^\$2[aby]?\$\d{1,2}\$.{53}$/.test(str);
};

// ============================================================
// SESSION MANAGEMENT
// ============================================================

export interface SessionData {
  userId: string;
  nama: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp
  sessionToken: string;
}

/**
 * Generate session token sederhana (random string)
 */
const generateSessionToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Simpan session ke localStorage (TANPA password)
 */
export const createSession = (user: {
  id: string;
  nama: string;
  email: string;
  role: 'admin' | 'user';
}): SessionData => {
  const now = new Date();
  const session: SessionData = {
    userId: user.id,
    nama: user.nama,
    email: user.email,
    role: user.role,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_DURATION_MS).toISOString(),
    sessionToken: generateSessionToken(),
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

/**
 * Ambil session dari localStorage
 * Return null jika tidak ada atau sudah expired
 */
export const getSession = (): SessionData | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const session: SessionData = JSON.parse(raw);

    // Cek apakah session sudah expired
    if (new Date(session.expiresAt) < new Date()) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    clearSession();
    return null;
  }
};

/**
 * Perpanjang session (refresh expiry)
 */
export const refreshSession = (): void => {
  const session = getSession();
  if (!session) return;

  session.expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

/**
 * Hapus session (logout)
 */
export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
  // Juga hapus key lama jika masih ada (backward compat)
  localStorage.removeItem('currentUser');
};

/**
 * Update data session tanpa mengganti token
 */
export const updateSessionData = (updates: Partial<Pick<SessionData, 'nama' | 'email' | 'role'>>): void => {
  const session = getSession();
  if (!session) return;

  Object.assign(session, updates);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};
