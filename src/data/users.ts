import type { User } from '@/types';

// Data user awal dengan admin default
export const usersData: User[] = [
  {
    id: 'u1',
    nama: 'Administrator',
    email: 'admin@sistempakar.com',
    password: 'admin123',
    role: 'admin',
    created_at: '2024-01-01'
  }
];

// Simulasi localStorage untuk menyimpan data
export const getUsers = (): User[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('users');
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem('users', JSON.stringify(usersData));
    return usersData;
  }
  return usersData;
};

export const saveUsers = (users: User[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('users', JSON.stringify(users));
  }
};

export const addUser = (user: User) => {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
};

export const updateUser = (updatedUser: User) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    saveUsers(users);
  }
};

export const deleteUser = (userId: string) => {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== userId);
  saveUsers(filtered);
};

export const findUserByEmail = (email: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.email === email);
};

export const findUserById = (id: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.id === id);
};

// Hasil diagnosa storage
export const getHasilDiagnosa = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('hasilDiagnosa');
    return stored ? JSON.parse(stored) : [];
  }
  return [];
};

export const saveHasilDiagnosa = (hasil: any[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('hasilDiagnosa', JSON.stringify(hasil));
  }
};

export const addHasilDiagnosa = (hasil: any) => {
  const allHasil = getHasilDiagnosa();
  allHasil.push(hasil);
  saveHasilDiagnosa(allHasil);
};

export const getHasilDiagnosaByUserId = (userId: string) => {
  const allHasil = getHasilDiagnosa();
  return allHasil.filter((h: any) => h.user_id === userId || h.userId === userId);
};
