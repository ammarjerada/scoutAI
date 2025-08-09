import { useState, useCallback } from 'react';
import { Player, FilterParams } from '../types/Player';
import { ApiService } from '../services/api';

export const usePlayerSearch = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const searchPlayers = useCallback(async (filters: FilterParams) => {
    setLoading(true);
    setPlayers([]);
    setSearchProgress(0);
    setError(null);

    // Animation de progression pour l'UX
    const progressInterval = setInterval(() => {
      setSearchProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      console.log('🔍 Recherche avec filtres:', filters);
      const data = await ApiService.filterPlayers(filters);
      setPlayers(data);
      setSearchProgress(100);
      clearInterval(progressInterval);
      console.log('✅ Recherche terminée:', data.length, 'joueurs trouvés');
    } catch (error: any) {
      console.error('❌ Erreur lors de la recherche:', error);
      clearInterval(progressInterval);
      setError(error.message || 'Une erreur est survenue lors du chargement des joueurs.');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  const loadAllPlayers = useCallback(async () => {
    try {
      setError(null);
      console.log('📊 Chargement de tous les joueurs...');
      
      const emptyFilters: FilterParams = {
        style: "",
        position: "",
        budget: "",
        minAge: "",
        maxAge: "",
        playerName: "",
        sort_order: "desc"
      };
      
      const data = await ApiService.filterPlayers(emptyFilters);
      setAllPlayers(data);
      console.log('✅ Tous les joueurs chargés:', data.length);
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des joueurs:', error);
      setError(error.message || 'Une erreur est survenue lors du chargement des joueurs.');
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    try {
      console.log('❤️ Chargement des favoris...');
      const data = await ApiService.getFavorites();
      setFavorites(data);
      console.log('✅ Favoris chargés:', data.length);
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des favoris:', error);
      // Ne pas afficher d'erreur si l'utilisateur n'est pas connecté
      if (!error.message.includes('Connexion requise') && !error.message.includes('Authentification requise')) {
        setError(error.message || 'Erreur lors du chargement des favoris.');
      }
    }
  }, []);

  const toggleFavorite = useCallback(async (player: Player, notes?: string) => {
    try {
      console.log('❤️ Toggle favori pour:', player.Player, 'ID:', player.player_id);
      
      // Vérifier si le joueur est déjà en favoris
      const isFavorite = await ApiService.checkFavorite(player.player_id);
      console.log('🔍 État actuel favori:', isFavorite);
      
      if (isFavorite) {
        await ApiService.removeFavorite(player.player_id);
        console.log('✅ Joueur retiré des favoris');
        
        // Mettre à jour l'état local immédiatement pour une UX fluide
        setFavorites(prev => prev.filter(fav => fav.player.player_id !== player.player_id));
      } else {
        await ApiService.addFavorite(player.player_id, notes);
        console.log('✅ Joueur ajouté aux favoris');
        
        // Ajouter à l'état local immédiatement
        const newFavorite = {
          id: Date.now().toString(),
          player: player,
          addedAt: new Date().toISOString(),
          notes: notes || ''
        };
        setFavorites(prev => [newFavorite, ...prev]);
      }
      
      // Recharger les favoris pour synchroniser avec la base
      setTimeout(() => loadFavorites(), 500);
      
      return !isFavorite; // Retourner le nouvel état
    } catch (error: any) {
      console.error('❌ Erreur toggle favorite:', error);
      throw error;
    }
  }, [loadFavorites]);

  const updateFavoriteNotes = useCallback(async (playerId: number, notes: string) => {
    try {
      console.log('📝 Mise à jour des notes pour:', playerId);
      // Pour l'instant, on supprime et on recrée avec la nouvelle note
      await ApiService.removeFavorite(playerId);
      await ApiService.addFavorite(playerId, notes);
      await loadFavorites();
      console.log('✅ Notes mises à jour');
    } catch (error: any) {
      console.error('❌ Erreur update notes:', error);
      throw error;
    }
  }, [loadFavorites]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    players,
    allPlayers,
    loading,
    searchProgress,
    favorites,
    error,
    searchPlayers,
    loadAllPlayers,
    loadFavorites,
    toggleFavorite,
    updateFavoriteNotes,
    clearError
  };
};