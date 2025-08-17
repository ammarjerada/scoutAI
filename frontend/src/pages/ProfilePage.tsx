import React, { useState, useRef } from 'react';
import { 
  User, 
  Camera, 
  Save, 
  Mail, 
  Calendar,
  Shield,
  Target,
  TrendingUp,
  Upload,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    avatar: user?.avatar || ''
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Accès refusé
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Vous devez être connecté pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          color: 'from-red-500 to-pink-500',
          icon: Shield,
          label: 'Administrateur',
          description: 'Accès complet au système et gestion des utilisateurs'
        };
      case 'analyst':
        return {
          color: 'from-blue-500 to-indigo-500',
          icon: TrendingUp,
          label: 'Analyste',
          description: 'Analyse avancée des données, création de rapports détaillés'
        };
      default:
        return {
          color: 'from-emerald-500 to-cyan-500',
          icon: Target,
          label: 'Scout',
          description: 'Découverte et évaluation de nouveaux talents'
        };
    }
  };

  const roleConfig = getRoleConfig(user.role);
  const RoleIcon = roleConfig.icon;

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('error', 'L\'image ne doit pas dépasser 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      showNotification('success', 'Profil mis à jour avec succès !');
    } catch (error: any) {
      showNotification('error', error.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right ${
          notification.type === 'success' 
            ? 'bg-emerald-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Mon Profil
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gérez vos informations personnelles et préférences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              {/* Avatar Section */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className={`w-32 h-32 bg-gradient-to-r ${roleConfig.color} rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl mb-4 mx-auto`}>
                    {formData.avatar ? (
                      <img 
                        src={formData.avatar} 
                        alt={user.firstName} 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    ) : (
                      <span>
                        {user.firstName && user.lastName
                          ? `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase()
                          : ''}
                      </span>
                    )}
                  </div>
                  
                  {isEditing && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 w-8 h-8 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  {user.firstName} {user.lastName}
                </h2>
                
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-gradient-to-r ${roleConfig.color} rounded-full mb-2`}>
                  <RoleIcon className="w-4 h-4" />
                  <span>{roleConfig.label}</span>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {roleConfig.description}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Email</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{user.email}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Membre depuis</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Informations personnelles
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Modifier
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Sauvegarder
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Prénom
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      />
                    ) : (
                      <div className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-4 py-3 rounded-xl">
                        {user.firstName}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Nom
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      />
                    ) : (
                      <div className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-4 py-3 rounded-xl">
                        {user.lastName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <div className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 px-4 py-3 rounded-xl">
                    {user.email}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    L'email ne peut pas être modifié
                  </p>
                </div>
              </div>
            </div>

            {/* Permissions Card */}
            <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Permissions et Limites
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Gestion utilisateurs</span>
                    <span className={`text-sm font-semibold ${user.permissions.canManageUsers ? 'text-emerald-500' : 'text-red-500'}`}>
                      {user.permissions.canManageUsers ? 'Autorisé' : 'Non autorisé'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Voir toutes les données</span>
                    <span className={`text-sm font-semibold ${user.permissions.canViewAllData ? 'text-emerald-500' : 'text-red-500'}`}>
                      {user.permissions.canViewAllData ? 'Autorisé' : 'Non autorisé'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Export de données</span>
                    <span className={`text-sm font-semibold ${user.permissions.canExportData ? 'text-emerald-500' : 'text-red-500'}`}>
                      {user.permissions.canExportData ? 'Autorisé' : 'Non autorisé'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Favoris maximum</span>
                    <span className="text-sm font-semibold text-emerald-500">
                      {user.permissions.maxFavorites}
                    </span>
                  </div>
                  
                </div>
              </div>
            </div>

            {/* Role Description */}
            <div className="mt-8 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 bg-gradient-to-r ${roleConfig.color} rounded-xl shadow-lg`}>
                  <RoleIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Rôle : {roleConfig.label}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {roleConfig.description}
                  </p>
                </div>
              </div>
              
              {user.role === 'admin' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-red-700 dark:text-red-300">Privilèges Administrateur</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Vous avez un accès complet au système. Utilisez ces privilèges avec responsabilité.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};