import { Player, FavoritePlayer } from '../types/Player';

const FAVORITES_KEY = 'scoutai_favorites';

export class FavoritesService {
    static getFavorites(): FavoritePlayer[] {
        try {
            const stored = localStorage.getItem(FAVORITES_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    static addToFavorites(player: Player, notes?: string): void {
        const favorites = this.getFavorites();
        const newFavorite: FavoritePlayer = {
            id: `${player.Player}_${Date.now()}`,
            player,
            addedAt: new Date().toISOString(),
            notes
        };

        // Check if already exists
        const exists = favorites.some(fav => fav.player.Player === player.Player);
        if (!exists) {
            favorites.push(newFavorite);
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        }
    }

    static removeFromFavorites(playerName: string): void {
        const favorites = this.getFavorites();
        const filtered = favorites.filter(fav => fav.player.Player !== playerName);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    }

    static isFavorite(playerName: string): boolean {
        const favorites = this.getFavorites();
        return favorites.some(fav => fav.player.Player === playerName);
    }

    static updateNotes(playerName: string, notes: string): void {
        const favorites = this.getFavorites();
        const favorite = favorites.find(fav => fav.player.Player === playerName);
        if (favorite) {
            favorite.notes = notes;
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        }
    }
}