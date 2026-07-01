import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Layout } from '@/components/layout/Layout';
import { LandingPage } from '@/pages/LandingPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { KelolaPenyakit } from '@/pages/admin/KelolaPenyakit';
import { KelolaGejala } from '@/pages/admin/KelolaGejala';
import { KelolaRules } from '@/pages/admin/KelolaRules';
import { KelolaPohonKeputusan } from '@/pages/admin/KelolaPohonKeputusan';
import { KelolaUsers } from '@/pages/admin/KelolaUsers';
import { LaporanDiagnosa } from '@/pages/admin/LaporanDiagnosa';
import { UserDashboard } from '@/pages/user/UserDashboard';
import { Diagnosa } from '@/pages/user/Diagnosa';
import { Riwayat } from '@/pages/user/Riwayat';
import { Profil } from '@/pages/user/Profil';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';

// Protected Route Component
const ProtectedRoute = ({ 
  children, 
  allowedRole,
  user 
}: { 
  children: React.ReactNode; 
  allowedRole?: 'admin' | 'user';
  user: User | null;
}) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />;
  }

  return <>{children}</>;
};

function App() {
  const auth = useAuth();

  // Gunakan user dari useAuth langsung
  const currentUser = auth.user;

  const handleLogin = async (email: string, password: string) => {
    const result = await auth.login(email, password);
    return result;
  };

  const handleRegister = async (nama: string, email: string, password: string) => {
    return await auth.register(nama, email, password);
  };

  const handleLogout = () => {
    auth.logout();
  };

  const handleUpdateProfile = async (data: Partial<User>) => {
    return await auth.updateProfile(data);
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <HashRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={currentUser ? <Navigate to={currentUser.role === 'admin' ? '/admin' : '/user'} /> : <LandingPage />} 
        />
        <Route 
          path="/login" 
          element={
            currentUser ? 
              <Navigate to={currentUser.role === 'admin' ? '/admin' : '/user'} /> : 
              <LoginForm 
                onSubmit={handleLogin} 
                onNavigateToRegister={() => window.location.href = '#/register'}
              />
          } 
        />
        <Route 
          path="/register" 
          element={
            currentUser ? 
              <Navigate to={currentUser.role === 'admin' ? '/admin' : '/user'} /> : 
              <RegisterForm 
                onSubmit={handleRegister}
                onNavigateToLogin={() => window.location.href = '#/login'}
              />
          } 
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={currentUser} allowedRole="admin">
              <Layout user={currentUser} onLogout={handleLogout}>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/penyakit"
          element={
            <ProtectedRoute user={currentUser} allowedRole="admin">
              <Layout user={currentUser} onLogout={handleLogout}>
                <KelolaPenyakit />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/gejala"
          element={
            <ProtectedRoute user={currentUser} allowedRole="admin">
              <Layout user={currentUser} onLogout={handleLogout}>
                <KelolaGejala />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rules"
          element={
            <ProtectedRoute user={currentUser} allowedRole="admin">
              <Layout user={currentUser} onLogout={handleLogout}>
                <KelolaRules />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pohon"
          element={
            <ProtectedRoute user={currentUser} allowedRole="admin">
              <Layout user={currentUser} onLogout={handleLogout}>
                <KelolaPohonKeputusan />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute user={currentUser} allowedRole="admin">
              <Layout user={currentUser} onLogout={handleLogout}>
                <KelolaUsers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/laporan"
          element={
            <ProtectedRoute user={currentUser} allowedRole="admin">
              <Layout user={currentUser} onLogout={handleLogout}>
                <LaporanDiagnosa />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* User Routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute user={currentUser} allowedRole="user">
              <Layout user={currentUser} onLogout={handleLogout}>
                <UserDashboard user={currentUser!} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/diagnosa"
          element={
            <ProtectedRoute user={currentUser} allowedRole="user">
              <Layout user={currentUser} onLogout={handleLogout}>
                <Diagnosa user={currentUser!} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/riwayat"
          element={
            <ProtectedRoute user={currentUser} allowedRole="user">
              <Layout user={currentUser} onLogout={handleLogout}>
                <Riwayat user={currentUser!} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/profil"
          element={
            <ProtectedRoute user={currentUser} allowedRole="user">
              <Layout user={currentUser} onLogout={handleLogout}>
                <Profil user={currentUser!} onUpdate={handleUpdateProfile} />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
