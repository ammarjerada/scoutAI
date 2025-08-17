import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Settings, 
  LogOut, 
  Heart, 
  BarChart3, 
  Shield, 
  Target,
  Users,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          color: 'from-red-500 to-pink-500',
          icon: Shield,
          label: 'Administrateur',
          description: 'Accès complet au système'
        };
      case 'analyst':
        return {
          color: 'from-blue-500 to-indigo-500',
          icon: TrendingUp,
          label: 'Analyste',
          description: 'Analyse avancée des données'
        };
      default:
        return {
          color: 'from-emerald-500 to-cyan-500',
          icon: Target,
          label: 'Scout',
          description: 'Découverte de talents'
        };
    }
  };

  const roleConfig = getRoleConfig(user.role);
  const RoleIcon = roleConfig.icon;

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group"
      >
        <div className={`relative w-10 h-10 bg-gradient-to-r ${roleConfig.color} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-xl transition-shadow duration-200`}>
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.firstName} 
              className="w-full h-full rounded-full object-cover" 
            />
          ) : (
            getInitials(user.firstName, user.lastName)
          )}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center">
            <RoleIcon className="w-2.5 h-2.5 text-slate-600 dark:text-slate-400" />
          </div>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <RoleIcon className="w-3 h-3" />
            {roleConfig.label}
          </p>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in slide-in-from-top-2">
          {/* User Info */}
          <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 bg-gradient-to-r ${roleConfig.color} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.firstName} 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  getInitials(user.firstName, user.lastName)
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>
            </div>
            
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r ${roleConfig.color} rounded-full`}>
              <RoleIcon className="w-3 h-3" />
              <span>{roleConfig.label}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {roleConfig.description}
            </p>
            
            {/* Permissions Summary */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="text-slate-600 dark:text-slate-400">
                Favoris max: <span className="font-semibold text-emerald-500">{user.permissions.maxFavorites}</span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Mon Profil</span>
            </Link>
            
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            
            {user.permissions.canManageUsers && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Administration</span>
              </Link>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Paramètres</span>
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
            <button
              onClick={async () => {
                await logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};