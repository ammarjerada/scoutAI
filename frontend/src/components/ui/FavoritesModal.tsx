import React, { useState } from 'react';
import { X, Heart, FileText, Download, Edit3, Save, Trash2 } from 'lucide-react';
import { FavoritePlayer } from '../../types/Player';
import { formatMarketValue, getDefaultPlayerImage } from '../../utils/playerUtils';
import { STYLE_COLORS, STYLE_ICONS } from '../../constants/gameStyles';
import { PDFService } from '../../services/pdfService';
import { Activity } from 'lucide-react';

interface FavoritesModalProps {
    favorites: FavoritePlayer[];
    onClose: () => void;
    onRemoveFavorite: (playerName: string) => void;
    onUpdateNotes: (playerName: string, notes: string) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
    favorites,
    onClose,
    onRemoveFavorite,
    onUpdateNotes
}) => {
    const [editingNotes, setEditingNotes] = useState<string | null>(null);
    const [tempNotes, setTempNotes] = useState('');
    const [processing, setProcessing] = useState<string | null>(null);

    const handleEditNotes = (playerName: string, currentNotes: string) => {
        setEditingNotes(playerName);
        setTempNotes(currentNotes || '');
    };

    const handleSaveNotes = async (playerName: string) => {
        try {
            setProcessing(playerName);
            await onUpdateNotes(playerName, tempNotes);
            setEditingNotes(null);
            setTempNotes('');
        } catch (error) {
            console.error('Error saving notes:', error);
        } finally {
            setProcessing(null);
        }
    };

    const handleRemoveFavorite = async (playerName: string) => {
        try {
            setProcessing(playerName);
            await onRemoveFavorite(playerName);
        } catch (error) {
            console.error('Error removing favorite:', error);
        } finally {
            setProcessing(null);
        }
    };

    const handleExportAll = async () => {
        try {
            await PDFService.exportFavoritesReport(favorites);
        } catch (error) {
            console.error('Error exporting favorites:', error);
        }
    };

    const handleExportPlayer = async (player: any) => {
        try {
            await PDFService.exportPlayerReport(player);
        } catch (error) {
            console.error('Error exporting player:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Heart className="w-6 h-6 text-pink-500" />
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Mes Joueurs Favoris ({favorites.length})
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            {favorites.length > 0 && (
                                <button
                                    onClick={handleExportAll}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-colors duration-200"
                                >
                                    <Download className="w-4 h-4" />
                                    Exporter tout
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="w-10 h-10 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors duration-200"
                            >
                                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Favorites List */}
                    {favorites.length === 0 ? (
                        <div className="text-center py-16">
                            <Heart className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-300 mb-2">
                                Aucun joueur favori
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Ajoutez des joueurs à vos favoris en cliquant sur le cœur
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {favorites.map((favorite) => {
                                const player = favorite.player;
                                const StyleIcon = STYLE_ICONS[player.style as keyof typeof STYLE_ICONS] || Activity;
                                const isProcessing = processing === player.Player;

                                return (
                                    <div
                                        key={favorite.id}
                                        className="bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600/50 rounded-2xl p-6"
                                    >
                                        {/* Player Header */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="relative w-16 h-16">
                                                <img
                                                    src={player.image_url}
                                                    alt={player.Player}
                                                    className="w-full h-full object-cover rounded-full border-2 border-emerald-400/50"
                                                    onError={(e) => {
                                                        e.currentTarget.src = getDefaultPlayerImage();
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                                    {player.Player}
                                                </h3>
                                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                                                    {player.Age} ans • {player.Pos} • {player.Squad}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r ${(STYLE_COLORS as Record<string, string>)[player.style] || "from-slate-500 to-slate-600"} text-xs`}>
                                                        <StyleIcon className="w-3 h-3 text-white" />
                                                        <span className="text-white font-semibold">{player.style}</span>
                                                    </div>
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                                        {formatMarketValue(player.MarketValue)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes Section */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Notes personnelles
                                                </label>
                                                {editingNotes !== player.Player && (
                                                    <button
                                                        onClick={() => handleEditNotes(player.Player, favorite.notes || '')}
                                                        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                                                        disabled={isProcessing}
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {editingNotes === player.Player ? (
                                                <div className="space-y-2">
                                                    <textarea
                                                        value={tempNotes}
                                                        onChange={(e) => setTempNotes(e.target.value)}
                                                        placeholder="Ajoutez vos notes sur ce joueur..."
                                                        className="w-full bg-white dark:bg-slate-600/50 border border-slate-200 dark:border-slate-500 text-slate-900 dark:text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 resize-none"
                                                        rows={3}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleSaveNotes(player.Player)}
                                                            disabled={isProcessing}
                                                            className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-sm font-semibold transition-colors disabled:opacity-50"
                                                        >
                                                            <Save className="w-3 h-3" />
                                                            {isProcessing ? 'Sauvegarde...' : 'Sauvegarder'}
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingNotes(null)}
                                                            className="px-3 py-1 bg-slate-500 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors"
                                                        >
                                                            Annuler
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-slate-700 dark:text-slate-300 text-sm bg-white dark:bg-slate-600/30 rounded-lg p-3 min-h-[60px]">
                                                    {favorite.notes || "Aucune note ajoutée"}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                Ajouté le {new Date(favorite.addedAt).toLocaleDateString('fr-FR')}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleExportPlayer(player)}
                                                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-semibold transition-colors"
                                                >
                                                    <Download className="w-3 h-3" />
                                                    PDF
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveFavorite(player.Player)}
                                                    disabled={isProcessing}
                                                    className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-semibold transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    {isProcessing ? 'Suppression...' : 'Retirer'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};