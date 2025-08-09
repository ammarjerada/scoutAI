import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '../types/User';
import { AuthService } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  const refreshAuth = async () => {
    try {
      console.log('🔍 Vérification de la session...');
      const user = await AuthService.getCurrentUser();
      console.log('✅ Session valide, utilisateur:', user.email);
      setAuthState({
        user,
        token: null, // Sessions au lieu de tokens
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      console.log('❌ Aucune session valide');
      setAuthState(prev => ({ 
        ...prev, 
        user: null,
        isAuthenticated: false,
        loading: false 
      }));
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      console.log('🔐 Tentative de connexion...');
      
      const response = await AuthService.login(credentials);
      console.log('✅ Connexion réussie:', response.user.email);

      setAuthState({
        user: response.user,
        token: null, // Sessions au lieu de tokens
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      console.log('📝 Tentative d\'inscription...');
      
      const response = await AuthService.register(data);
      console.log('✅ Inscription réussie:', response.user.email);

      setAuthState({
        user: response.user,
        token: null, // Sessions au lieu de tokens
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      console.error('❌ Erreur d\'inscription:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Déconnexion...');
      await AuthService.logout();
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    } finally {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await AuthService.updateProfile(data);
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      register,
      logout,
      updateProfile,
      refreshAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};