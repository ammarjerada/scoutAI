import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SearchForm } from '../components/ui/SearchForm';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { PlayerCard } from '../components/ui/PlayerCard';
import { EmptyState } from '../components/ui/EmptyState';
import { FavoritesModal } from '../components/ui/FavoritesModal';
import { LoginModal } from '../components/auth/LoginModal';
import { RegisterModal } from '../components/auth/RegisterModal';
import { usePlayerSearch } from '../hooks/usePlayerSearch';
import { useAuth } from '../contexts/AuthContext';
import { Player, FilterParams } from '../types/Player';
import { Eye, AlertCircle, CheckCircle } from 'lucide-react';

export const PlayersPage: React.FC = () => {
    const { isAuthenticated, refreshAuth } = useAuth();
    const [filters, setFilters] = useState<FilterParams>({
        style: "",
        position: "",
        budget: "",
        minAge: "",
        maxAge: "",
        playerName: "",
        sort_order: "desc",
    });

    const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
    const [showFavorites, setShowFavorites] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

    const {
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
    } = usePlayerSearch();

    useEffect(() => {
        loadAllPlayers();
    }, [loadAllPlayers]);

    useEffect(() => {
        if (isAuthenticated) {
            loadFavorites();
        }
    }, [isAuthenticated, loadFavorites]);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleFiltersChange = (newFilters: Partial<FilterParams>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('Submitting filters:', filters);
            await searchPlayers(filters);
        } catch (error) {
            console.error('Error in handleSubmit:', error);
        }
    };

    const handlePlayerSelect = (player: Player) => {
        const isSelected = selectedPlayers.some(p => p.player_id === player.player_id);

        if (isSelected) {
            setSelectedPlayers(selectedPlayers.filter(p => p.player_id !== player.player_id));
        } else if (selectedPlayers.length < 2) {
            setSelectedPlayers([...selectedPlayers, player]);
        }
    };

    const handleLoginRequired = () => {
        setShowLogin(true);
    };

    const handleFavoriteToggle = async (player: Player): Promise<boolean> => {
        try {
            const newState = await toggleFavorite(player);
            showNotification('success', newState ? 'Joueur ajouté aux favoris' : 'Joueur retiré des favoris');
            return newState;
        } catch (error: any) {
            console.error('Error toggling favorite:', error);
            if (error.message.includes('Connexion requise') || error.message.includes('Authentification requise')) {
                handleLoginRequired();
            } else {
                showNotification('error', error.message);
            }
            throw error;
        }
    };

    const handleRemoveFavorite = async (playerName: string) => {
        const favorite = favorites.find(fav => fav.player.Player === playerName);
        if (favorite) {
            try {
                await toggleFavorite(favorite.player);
                showNotification('success', 'Joueur retiré des favoris');
            } catch (error) {
                console.error('Error removing favorite:', error);
                showNotification('error', 'Erreur lors de la suppression');
            }
        }
    };

    const handleUpdateFavoriteNotes = async (playerName: string, notes: string) => {
        const favorite = favorites.find(fav => fav.player.Player === playerName);
        if (favorite) {
            try {
                await updateFavoriteNotes(favorite.player.player_id, notes);
                showNotification('success', 'Notes mises à jour');
            } catch (error) {
                console.error('Error updating favorite notes:', error);
                showNotification('error', 'Erreur lors de la mise à jour');
            }
        }
    };

    const handleLoginSuccess = async () => {
        setShowLogin(false);
        setShowRegister(false);
        await refreshAuth();
        await loadFavorites();
        showNotification('success', 'Connexion réussie !');
    };

    const handleRegisterSuccess = async () => {
        setShowLogin(false);
        setShowRegister(false);
        await refreshAuth();
        await loadFavorites();
        showNotification('success', 'Inscription réussie !');
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
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Base de données des joueurs
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Recherchez et analysez les profils de joueurs avec nos filtres avancés
                    </p>
                </div>

                <SearchForm
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onSubmit={handleSubmit}
                    loading={loading}
                    allPlayers={allPlayers}
                    onShowFavorites={() => {
                        if (isAuthenticated) {
                            setShowFavorites(true);
                        } else {
                            setShowLogin(true);
                        }
                    }}
                    favoritesCount={favorites.length}
                />

                {loading && <LoadingSpinner progress={searchProgress} />}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <div className="flex-1">
                                <p className="text-red-700 dark:text-red-300 font-medium">
                                    {error}
                                </p>
                                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                                    Vérifiez votre connexion internet et réessayez.
                                </p>
                            </div>
                            <button
                                onClick={clearError}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
                            >
                                <AlertCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Results Header */}
                {!loading && players.length > 0 && (
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-slate-600 dark:text-slate-400">
                            {players.length} joueur{players.length > 1 ? 's' : ''} trouvé{players.length > 1 ? 's' : ''}
                        </p>
                        {selectedPlayers.length === 2 && (
                            <Link
                                to="/comparison"
                                state={{ players: selectedPlayers }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors duration-200"
                            >
                                <Eye className="w-4 h-4" />
                                Voir la comparaison
                            </Link>
                        )}
                    </div>
                )}

                {/* Players Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {players.map((player, index) => (
                        <PlayerCard
                            key={`${player.player_id}-${index}`}
                            player={player}
                            isSelected={selectedPlayers.some(p => p.player_id === player.player_id)}
                            onClick={() => handlePlayerSelect(player)}
                            onFavoriteToggle={handleFavoriteToggle}
                            onLoginRequired={handleLoginRequired}
                        />
                    ))}
                </div>

                {!loading && players.length === 0 && !error && <EmptyState />}

                {/* Modals */}
                {showFavorites && (
                    <FavoritesModal
                        favorites={favorites}
                        onClose={() => setShowFavorites(false)}
                        onRemoveFavorite={handleRemoveFavorite}
                        onUpdateNotes={handleUpdateFavoriteNotes}
                    />
                )}

                <LoginModal
                    isOpen={showLogin}
                    onClose={() => setShowLogin(false)}
                    onSwitchToRegister={() => {
                        setShowLogin(false);
                        setShowRegister(true);
                    }}
                    onSuccess={handleLoginSuccess}
                />

                <RegisterModal
                    isOpen={showRegister}
                    onClose={() => setShowRegister(false)}
                    onSwitchToLogin={() => {
                        setShowRegister(false);
                        setShowLogin(true);
                    }}
                    onSuccess={handleRegisterSuccess}
                />
            </div>
        </div>
    );
};