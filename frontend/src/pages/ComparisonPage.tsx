import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { Player } from '../types/Player';
import { RadarComparison } from '../components/comparison/RadarComparison';
import { StatsComparison } from '../components/comparison/StatsComparison';
import { getDefaultPlayerImage, formatMarketValue } from '../utils/playerUtils';
import { PDFService } from '../services/pdfService';
import { ApiService } from '../services/api';
import { usePlayerSearch } from '../hooks/usePlayerSearch';
import { useAuth } from '../contexts/AuthContext';
import { PlayerCard } from '../components/ui/PlayerCard';
import { LoginModal } from '../components/auth/LoginModal';
import { RegisterModal } from '../components/auth/RegisterModal';

export const ComparisonPage: React.FC = () => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { allPlayers, loadAllPlayers } = usePlayerSearch();
    const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    useEffect(() => {
        // Load players from navigation state or initialize empty
        const playersFromState = location.state?.players || [];
        setSelectedPlayers(playersFromState);

        if (allPlayers.length === 0) {
            loadAllPlayers();
        }
    }, [location.state, loadAllPlayers, allPlayers.length]); // Dépendre de la longueur pour éviter les re-renders infinis

    const availablePlayers = useMemo(() => {
        let filtered = allPlayers;
        if (searchTerm.trim() !== '') {
            filtered = allPlayers.filter(player =>
                player.Player.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        // Trier par valeur marchande décroissante
        filtered = filtered.sort((a, b) => b.MarketValue - a.MarketValue);
        // Afficher les 50 premiers par défaut (ou tous si recherche)
        return searchTerm.trim() === '' ? filtered.slice(0, 50) : filtered;
    }, [allPlayers, searchTerm]);

    const handlePlayerSelect = (player: Player) => {
        const isSelected = selectedPlayers.some(p => p.Player === player.Player);

        if (isSelected) {
            setSelectedPlayers(selectedPlayers.filter(p => p.Player !== player.Player));
        } else if (selectedPlayers.length < 2) {
            setSelectedPlayers([...selectedPlayers, player]);
        } else {
            // Replace the first player if already 2 selected
            setSelectedPlayers([selectedPlayers[1], player]);
        }
    };

    const handleExportComparison = async () => {
        if (!isAuthenticated) {
            setShowLogin(true);
            return;
        }

        if (selectedPlayers.length === 2) {
            try {
                await PDFService.exportComparisonReport([selectedPlayers[0], selectedPlayers[1]]);
                
                // Sauvegarder la comparaison en base de données
                await ApiService.saveComparison(
                    selectedPlayers[0].player_id,
                    selectedPlayers[1].player_id
                );
            } catch (error) {
                console.error('Error exporting comparison:', error);
                if (error.response?.status === 401) {
                    setShowLogin(true);
                }
            }
        }
    };

    const handleReset = () => {
        setSelectedPlayers([]);
    };

    const handleLoginRequired = () => {
        setShowLogin(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/players"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-slate-700 dark:text-slate-300">Retour</span>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Comparaison de Joueurs
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                Sélectionnez 2 joueurs pour les comparer
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedPlayers.length > 0 && (
                            <button
                                onClick={handleReset}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reset
                            </button>
                        )}
                        {selectedPlayers.length === 2 && (
                            <button
                                onClick={handleExportComparison}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export PDF
                            </button>
                        )}
                    </div>
                </div>

                {/* Selection Status */}
                <div className="mb-8 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                                Joueurs sélectionnés ({selectedPlayers.length}/2)
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {selectedPlayers.length === 0 && "Sélectionnez 2 joueurs pour commencer la comparaison"}
                                {selectedPlayers.length === 1 && "Sélectionnez un second joueur"}
                                {selectedPlayers.length === 2 && "Comparaison prête !"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedPlayers.map((player, index) => (
                                <div key={index} className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                    <img
                                        src={player.image_url}
                                        alt={player.Player}
                                        className="w-6 h-6 rounded-full"
                                        onError={(e) => {
                                            e.currentTarget.src = getDefaultPlayerImage();
                                        }}
                                    />
                                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                        {player.Player}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Comparison Results */}
                {selectedPlayers.length === 2 && (
                    <div className="mb-8">
                        {/* Player Headers */}
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            {selectedPlayers.map((player, index) => (
                                <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                                    <div className="text-center">
                                        <div className="relative w-24 h-24 mx-auto mb-4">
                                            <img
                                                src={player.image_url}
                                                alt={player.Player}
                                                className="w-full h-full object-cover rounded-full border-4 border-emerald-400/50"
                                                onError={(e) => {
                                                    e.currentTarget.src = getDefaultPlayerImage();
                                                }}
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                            {player.Player}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                                            {player.Age} ans • {player.Pos} • {player.Squad}
                                        </p>
                                        <div className="text-emerald-500 font-bold">
                                            {formatMarketValue(player.MarketValue)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Radar Chart */}
                        <RadarComparison players={[selectedPlayers[0], selectedPlayers[1]]} />

                        {/* Stats Comparison */}
                        <StatsComparison players={[selectedPlayers[0], selectedPlayers[1]]} />
                    </div>
                )}

                {/* Player Selection Grid */}
                {selectedPlayers.length < 2 && (
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                            Choisir {selectedPlayers.length === 0 ? 'les joueurs' : 'le second joueur'}
                        </h2>
                        <input
                            type="text"
                            placeholder="Rechercher un joueur par nom..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="mb-6 w-full max-w-md px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {availablePlayers.map((player, index) => (
                                <PlayerCard
                                    key={index}
                                    player={player}
                                    isSelected={selectedPlayers.some(p => p.Player === player.Player)}
                                    onClick={() => handlePlayerSelect(player)}
                                    onLoginRequired={handleLoginRequired}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Auth Modals */}
                <LoginModal
                    isOpen={showLogin}
                    onClose={() => setShowLogin(false)}
                    onSwitchToRegister={() => {
                        setShowLogin(false);
                        setShowRegister(true);
                    }}
                />

                <RegisterModal
                    isOpen={showRegister}
                    onClose={() => setShowRegister(false)}
                    onSwitchToLogin={() => {
                        setShowRegister(false);
                        setShowLogin(true);
                    }}
                />
            </div>
        </div>
    );
};