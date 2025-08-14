import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/analytics';

axios.defaults.withCredentials = true;

export interface DashboardStats {
  totalPlayers: number;
  userFavorites: number;
  userComparisons: number;
  avgMarketValue: number;
  positionDistribution: Array<{ position: string; count: number }>;
  styleDistribution: Array<{ style: string; count: number }>;
  topValuePlayers: Array<{
    name: string;
    squad: string;
    market_value: number;
    position: string;
  }>;
}

export interface PlayerPerformance {
  player: any;
  performance: Array<{
    month: string;
    goals: number;
    assists: number;
    xG: number;
    tackles: number;
  }>;
}

export class AnalyticsService {
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des statistiques');
    }
  }

  static async getPlayerPerformance(playerId: number): Promise<PlayerPerformance> {
    try {
      const response = await axios.get(`${API_BASE_URL}/player/${playerId}/performance`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching player performance:', error);
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des performances');
    }
  }

  static async getLeagueAnalytics(league: string): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/league/${league}/analytics`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching league analytics:', error);
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des analyses de ligue');
    }
  }

  static async getStyleAnalytics(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/styles/analytics`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching style analytics:', error);
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des analyses de style');
    }
  }
}