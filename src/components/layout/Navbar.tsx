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
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to={user?.role === 'admin' ? '/admin' : '/user'} className="flex items-center gap-2.5 group">
              <img 
                src="/logo.png" 
                alt="Sistem Pakar Buah Naga" 
                className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
              />
              <span className="font-bold text-base lg:text-lg text-gray-900 whitespace-nowrap leading-none">
                Sistem Pakar <span className="text-pink-600">Buah Naga</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 min-w-0">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Button
                  key={link.path}
                  variant={active ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate(link.path)}
                  className={`whitespace-nowrap text-xs lg:text-sm font-medium px-2.5 lg:px-3 ${
                    active 
                      ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-xs' 
                      : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50/60'
                  }`}
                >
                  <link.icon className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-1.5 flex-shrink-0" />
                  <span>{link.label}</span>
                </Button>
              );
            })}
          </div>

          {/* User Menu & Mobile Trigger */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 px-2 hover:bg-gray-50">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center text-white shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden sm:block text-xs lg:text-sm font-semibold text-gray-800 max-w-[120px] truncate">
                    {user?.nama}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.nama}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  <span className="inline-block text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full mt-1 uppercase tracking-wider">
                    {user?.role}
                  </span>
                </div>
                <DropdownMenuSeparator />
                {user?.role === 'user' && (
                  <DropdownMenuItem onClick={() => navigate('/user/profil')}>
                    <UserCircle className="w-4 h-4 mr-2 text-gray-500" />
                    Profil Saya
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onLogout} className="text-red-600 hover:bg-red-50 focus:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-3 space-y-1 bg-white">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Button
                  key={link.path}
                  variant={active ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full justify-start text-xs font-medium ${
                    active ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'text-gray-700'
                  }`}
                >
                  <link.icon className="w-4 h-4 mr-2" />
                  {link.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};
