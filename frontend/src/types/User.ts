export interface User {
  id: string;
  user_id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'scout' | 'admin' | 'analyst';
  avatar?: string;
  createdAt: string;
  permissions: UserPermissions;
  preferences: {
    theme: 'light' | 'dark';
    favoriteLeagues: string[];
    notifications: boolean;
  };
}

export interface UserPermissions {
  canManageUsers: boolean;
  canViewAllData: boolean;
  canExportData: boolean;
  canCreateTeams: boolean;
  canManageDatabase: boolean;
  maxFavorites: number;
  maxTeams: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'scout' | 'analyst';
}

export interface AuthResponse {
  user: User;
  message: string;
  authenticated: boolean;
}

export interface Team {
  team_id: number;
  name: string;
  formation: string;
  player_count: number;
  created_at: string;
  players?: TeamPlayer[];
}

export interface TeamPlayer {
  id: number;
  player_id: number;
  position: string;
  position_x: number;
  position_y: number;
  player: {
    name: string;
    age: number;
    position: string;
    squad: string;
    image_url: string;
    market_value: number;
  };
}