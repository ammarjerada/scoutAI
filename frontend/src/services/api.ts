import axios from 'axios';
import { Player, FilterParams } from '../types/Player';

const API_BASE_URL = 'http://localhost:5000/api';

// Configuration axios pour les sessions avec credentials
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Intercepteur pour gérer les erreurs d'authentification
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔐 Session expirée ou non authentifié');
      // Ne pas rediriger automatiquement, laisser les composants gérer
    }
    return Promise.reject(error);
  }
);

export class ApiService {
  static async filterPlayers(params: FilterParams): Promise<Player[]> {
    try {
      console.log('🔍 API call with params:', params);
      const response = await axios.post(`${API_BASE_URL}/filter_players`, params);
      console.log('✅ API response:', response.data.length, 'players found');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching players:', error);
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des joueurs.');
    }
  }

  static async getPlayerById(playerId: number): Promise<Player> {
    try {
      const response = await axios.get(`${API_BASE_URL}/players/${playerId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching player:', error);
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération du joueur.');
    }
  }

  static async searchPlayers(query: string, limit: number = 20): Promise<Player[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/players/search`, {
        params: { q: query, limit }
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ Error searching players:', error);
      throw new Error(error.response?.data?.error || 'Erreur lors de la recherche.');
    }
  }

  static async getAllPlayers(): Promise<Player[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/players/all`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération de tous les joueurs.');
    }
  }

  // ===== FAVORIS =====
  static async getFavorites(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/favorites`);
      console.log('✅ Favoris récupérés:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching favorites:', error);
      if (error.response?.status === 401) {
        throw new Error('Connexion requise pour accéder aux favoris');
      }
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des favoris');
    }
  }

  static async addFavorite(playerId: number, note?: string): Promise<void> {
    try {
      console.log('🔍 Ajout favori API - playerId:', playerId, 'note:', note);
      const response = await axios.post(`${API_BASE_URL}/favorites`, {
        player_id: playerId,
        note: note || ''
      });
      console.log('✅ Réponse ajout favori:', response.data);
    } catch (error: any) {
      console.error('❌ Error adding favorite:', error);
      if (error.response?.status === 401) {
        throw new Error('Connexion requise pour ajouter aux favoris');
      }
      throw new Error(error.response?.data?.error || 'Erreur lors de l\'ajout aux favoris');
    }
  }

  static async removeFavorite(playerId: number): Promise<void> {
    try {
      console.log('🔍 Suppression favori API - playerId:', playerId);
      const response = await axios.delete(`${API_BASE_URL}/favorites/${playerId}`);
      console.log('✅ Réponse suppression favori:', response.data);
    } catch (error: any) {
      console.error('❌ Error removing favorite:', error);
      if (error.response?.status === 401) {
        throw new Error('Connexion requise pour supprimer des favoris');
      }
      throw new Error(error.response?.data?.error || 'Erreur lors de la suppression des favoris');
    }
  }

  static async checkFavorite(playerId: number): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/favorites/check/${playerId}`);
      return response.data.is_favorite;
    } catch (error: any) {
      console.error('❌ Error checking favorite:', error);
      if (error.response?.status === 401) {
        return false; // Non connecté = pas de favoris
      }
      return false;
    }
  }

  // ===== COMPARAISONS =====
  static async getComparisons(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/comparisons`);
      console.log('✅ Comparaisons récupérées:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching comparisons:', error);
      if (error.response?.status === 401) {
        throw new Error('Connexion requise pour accéder aux comparaisons');
      }
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des comparaisons');
    }
  }

  static async saveComparison(player1Id: number, player2Id: number): Promise<void> {
    try {
      console.log('🔍 Sauvegarde comparaison:', player1Id, 'vs', player2Id);
      const response = await axios.post(`${API_BASE_URL}/comparisons`, {
        player1_id: player1Id,
        player2_id: player2Id
      });
      console.log('✅ Comparaison sauvegardée:', response.data);
    } catch (error: any) {
      console.error('❌ Error saving comparison:', error);
      if (error.response?.status === 401) {
        throw new Error('Connexion requise pour sauvegarder les comparaisons');
      }
      throw new Error(error.response?.data?.error || 'Erreur lors de la sauvegarde de la comparaison');
    }
  }

  // ===== SANTÉ DE L'API =====
  static async healthCheck(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Health check failed:', error);
      throw new Error('API non disponible');
    }
  }

  // ===== SESSION =====
  static async checkSession(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/session/check`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Session check failed:', error);
      throw new Error('Vérification de session échouée');
    }
  }
}