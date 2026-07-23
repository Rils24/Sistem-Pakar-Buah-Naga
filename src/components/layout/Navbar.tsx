import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Menu, X, Sprout, Home, Stethoscope, History, UserCircle, FileText, GitBranch } from 'lucide-react';
import { useState } from 'react';
import type { User as UserType } from '@/types';

interface NavbarProps {
  user: UserType | null;
  onLogout: () => void;
}

export const Navbar = ({ user, onLogout }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = user?.role === 'admin' 
    ? [
        { path: '/admin', label: 'Dashboard', icon: Home },
        { path: '/admin/penyakit', label: 'Hama & Penyakit', icon: Sprout },
        { path: '/admin/gejala', label: 'Gejala', icon: Stethoscope },
        { path: '/admin/rules', label: 'Rules', icon: History },
        { path: '/admin/pohon', label: 'Pohon Keputusan', icon: GitBranch },
        { path: '/admin/users', label: 'Users', icon: User },
        { path: '/admin/laporan', label: 'Laporan', icon: FileText },
      ]
    : [
        { path: '/user', label: 'Beranda', icon: Home },
        { path: '/user/diagnosa', label: 'Diagnosa', icon: Stethoscope },
        { path: '/user/riwayat', label: 'Riwayat', icon: History },
        { path: '/user/profil', label: 'Profil', icon: UserCircle },
      ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={user?.role === 'admin' ? '/admin' : '/user'} className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="Sistem Pakar Buah Naga" 
                className="w-10 h-10"
              />
              <span className="font-bold text-xl text-gray-900 hidden sm:block">
                Sistem Pakar <span className="text-pink-600">Buah Naga</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.path}
                variant={isActive(link.path) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate(link.path)}
                className={isActive(link.path) ? 'bg-pink-600 hover:bg-pink-700' : ''}
              >
                <link.icon className="w-4 h-4 mr-2" />
                {link.label}
              </Button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.nama}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user?.nama}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <p className="text-xs text-pink-600 mt-1 capitalize">{user?.role}</p>
                </div>
                <DropdownMenuSeparator />
                {user?.role === 'user' && (
                  <DropdownMenuItem onClick={() => navigate('/user/profil')}>
                    <UserCircle className="w-4 h-4 mr-2" />
                    Profil Saya
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            {navLinks.map((link) => (
              <Button
                key={link.path}
                variant={isActive(link.path) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full justify-start mb-1 ${
                  isActive(link.path) ? 'bg-pink-600 hover:bg-pink-700' : ''
                }`}
              >
                <link.icon className="w-4 h-4 mr-2" />
                {link.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};
