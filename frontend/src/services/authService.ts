import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/User';

const API_BASE_URL = 'http://localhost:5000/api/auth';

// Configuration axios pour les sessions
axios.defaults.withCredentials = true;

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur de connexion');
    }
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur d\'inscription');
    }
  }

  static async verifySession(): Promise<User> {
    try {
      const response = await axios.get(`${API_BASE_URL}/verify`);
      return response.data.user;
    } catch (error) {
      throw new Error('Session invalide');
    }
  }

  static async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await axios.put(`${API_BASE_URL}/profile`, data);
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de mise à jour');
    }
  }

  static async getCurrentUser(): Promise<User> {
    try {
      const response = await axios.get(`${API_BASE_URL}/me`);
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de récupération');
    }
  }

  static async logout(): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/logout`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de déconnexion');
    }
  }

  static async requestPasswordReset(email: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/forgot-password`, { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la demande');
    }
  }
}