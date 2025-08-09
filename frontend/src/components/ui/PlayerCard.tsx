import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Player } from '../../types/Player';
import { STYLE_COLORS, STYLE_ICONS } from '../../constants/gameStyles';
import { formatMarketValue, getDefaultPlayerImage } from '../../utils/playerUtils';
import { Activity, Heart, Download, Lock, AlertCircle, Check } from 'lucide-react';
import { ApiService } from '../../services/api';
import { PDFService } from '../../services/pdfService';
import { useAuth } from '../../contexts/AuthContext';

interface PlayerCardProps {
  player: Player;
  isSelected: boolean;
  onClick: () => void;
  onFavoriteToggle?: (player: Player) => Promise<boolean>;
  onLoginRequired?: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isSelected,
  onClick,
  onFavoriteToggle,
  onLoginRequired
}) => {
  const { isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const StyleIcon = STYLE_ICONS[player.style as keyof typeof STYLE_ICONS] || Activity;
  const playerSlug = player.Player.toLowerCase().replace(/\s+/g, '-');

  // Vérifier si le joueur est en favoris au chargement
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (isAuthenticated && player.player_id) {
        try {
          const favorite = await ApiService.checkFavorite(player.player_id);
          setIsFavorite(favorite);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      } else {
        setIsFavorite(false);
      }
    };

    checkFavoriteStatus();
  }, [isAuthenticated, player.player_id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }

    if (isProcessing) return;

    try {
      setIsProcessing(true);
      
      // Optimistic UI update
      const newFavoriteState = !isFavorite;
      setIsFavorite(newFavoriteState);
      
      // Appeler la fonction de toggle
      const result = await onFavoriteToggle?.(player);
      
      // Vérifier le résultat et ajuster si nécessaire
      if (result !== undefined) {
        setIsFavorite(result);
      }
      
      // Afficher un feedback de succès
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
    } catch (error: any) {
      console.error('Erreur lors de la gestion des favoris:', error);
      
      // Revenir à l'état précédent en cas d'erreur
      setIsFavorite(!isFavorite);
      setError(error.message);
      
      if (error.message.includes('Connexion requise') || error.message.includes('Authentification requise')) {
        onLoginRequired?.();
      }
      
      // Effacer l'erreur après 3 secondes
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportPDF = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }

    if (isProcessing) return;

    try {
      setIsProcessing(true);
      await PDFService.exportPlayerReport(player);
      
      // Afficher un feedback de succès
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error: any) {
      console.error('Erreur lors de l\'export PDF:', error);
      setError(error.message);
      
      if (error.message.includes('Connexion requise')) {
        onLoginRequired?.();
      }
      
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <div
      onClick={handleCompareClick}
      className={`group relative backdrop-blur-xl border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 transform ${isSelected
        ? "bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-400/50 shadow-2xl shadow-emerald-500/20"
        : "bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 hover:bg-white/90 dark:hover:bg-slate-800/90 hover:border-emerald-400/30 hover:shadow-xl"
        }`}
    >
      {/* Messages de feedback */}
      {error && (
        <div className="absolute top-2 left-2 right-2 bg-red-500/90 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 z-20 animate-in slide-in-from-top">
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}

      {showSuccess && (
        <div className="absolute top-2 left-2 right-2 bg-emerald-500/90 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 z-20 animate-in slide-in-from-top">
          <Check className="w-3 h-3" />
          <span>Action réussie !</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        
        {/* Bouton détails du joueur */}
        <Link
          to={`/player/${playerSlug}`}
          onClick={(e) => e.stopPropagation()}
          className="w-8 h-8 bg-slate-100/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-emerald-500 hover:text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
          title="Voir les détails"
        >
          <Activity className="w-4 h-4" />
        </Link>
        
        {/* Bouton favoris */}
        <button
          onClick={handleFavoriteClick}
          disabled={isProcessing}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 relative backdrop-blur-sm ${
            isAuthenticated
              ? isFavorite
                ? "bg-pink-500 text-white shadow-lg"
                : "bg-slate-100/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-pink-500 hover:text-white"
              : "bg-slate-100/50 dark:bg-slate-700/50 text-slate-400 cursor-not-allowed"
          }`}
          title={isAuthenticated ? (isFavorite ? "Retirer des favoris" : "Ajouter aux favoris") : "Connexion requise"}
        >
          {!isAuthenticated && (
            <Lock className="w-3 h-3 absolute -top-1 -right-1 text-red-400" />
          )}
          
          <Heart className={`w-4 h-4 ${isFavorite && isAuthenticated ? 'fill-current' : ''} ${
            isProcessing ? 'animate-pulse' : ''
          }`} />
        </button>
        
        {/* Bouton export PDF */}
        <button
          onClick={handleExportPDF}
          disabled={isProcessing}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 relative backdrop-blur-sm ${
            isAuthenticated
              ? "bg-slate-100/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-blue-500 hover:text-white"
              : "bg-slate-100/50 dark:bg-slate-700/50 text-slate-400 cursor-not-allowed"
          }`}
          title={isAuthenticated ? "Exporter en PDF" : "Connexion requise"}
        >
          {!isAuthenticated && (
            <Lock className="w-3 h-3 absolute -top-1 -right-1 text-red-400" />
          )}
          
          <Download className={`w-4 h-4 ${isProcessing ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      {/* Indicateur de connexion requise */}
      {!isAuthenticated && (
        <div className="absolute top-3 left-3 bg-amber-500/80 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Lock className="w-3 h-3 inline mr-1" />
          Connexion requise
        </div>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-xs font-bold">✓</span>
        </div>
      )}

      {/* Player Image */}
      <div className="relative mx-auto w-24 h-24 mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300" />
        <img
          src={player.image_url}
          alt={player.Player}
          className="relative w-full h-full object-cover rounded-full shadow-xl border-2 border-white/20 dark:border-slate-600/20 group-hover:border-emerald-400/50 transition-all duration-300"
          onError={(e) => {
            e.currentTarget.src = getDefaultPlayerImage();
          }}
        />
      </div>

      {/* Player Info */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
          {player.Player}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">{player.Squad}</p>

        {/* Stats */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Âge</span>
            <span className="text-slate-900 dark:text-white font-semibold">{player.Age}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Position</span>
            <span className="text-slate-900 dark:text-white font-semibold">{player.Pos}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Style</span>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r ${(STYLE_COLORS as Record<string, string>)[player.style] || "from-slate-500 to-slate-600"} text-xs`}>
              <StyleIcon className="w-3 h-3 text-white" />
              <span className="text-white font-semibold">{player.style}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Valeur</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {formatMarketValue(player.MarketValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};