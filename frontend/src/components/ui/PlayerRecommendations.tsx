import React, { useState, useEffect } from 'react';
import { Player } from '../../types/Player';
import { PlayerCard } from './PlayerCard';
import { Lightbulb, RefreshCw } from 'lucide-react';

interface PlayerRecommendationsProps {
  currentPlayer?: Player;
  allPlayers: Player[];
  onPlayerSelect: (player: Player) => void;
  onFavoriteToggle?: (player: Player) => Promise<boolean>;
  onLoginRequired?: () => void;
}

export const PlayerRecommendations: React.FC<PlayerRecommendationsProps> = ({
  currentPlayer,
  allPlayers,
  onPlayerSelect,
  onFavoriteToggle,
  onLoginRequired
}) => {
  const [recommendations, setRecommendations] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  const generateRecommendations = () => {
    if (!currentPlayer || allPlayers.length === 0) return;

    setLoading(true);

    // Algorithm for recommendations
    const scored = allPlayers
      .filter(p => p.player_id !== currentPlayer.player_id)
      .map(player => {
        let score = 0;

        // Same style bonus
        if (player.style === currentPlayer.style) score += 30;

        // Similar position bonus
        if (player.Pos === currentPlayer.Pos) score += 20;

        // Age similarity (prefer ±3 years)
        const ageDiff = Math.abs((player.Age || 0) - (currentPlayer.Age || 0));
        if (ageDiff <= 3) score += 15;

        // Performance similarity
        const statKeys = ['Gls', 'Ast', 'xG', 'xAG', 'Tkl', 'PrgP', 'KP'] as const;
        statKeys.forEach(stat => {
          const currentValue = currentPlayer[stat] || 0;
          const playerValue = player[stat] || 0;
          const diff = Math.abs(currentValue - playerValue);
          const maxValue = Math.max(currentValue, playerValue);
          
          if (maxValue > 0) {
            const similarity = 1 - (diff / maxValue);
            score += similarity * 10;
          }
        });

        // Market value consideration (prefer similar or slightly higher)
        const valueDiff = Math.abs((player.MarketValue || 0) - (currentPlayer.MarketValue || 0));
        const avgValue = ((player.MarketValue || 0) + (currentPlayer.MarketValue || 0)) / 2;
        if (avgValue > 0) {
          const valueScore = Math.max(0, 10 - (valueDiff / avgValue) * 10);
          score += valueScore;
        }

        return { player, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(item => item.player);

    setRecommendations(scored);
    setLoading(false);
  };

  useEffect(() => {
    if (currentPlayer) {
      generateRecommendations();
    }
  }, [currentPlayer, allPlayers]);

  if (!currentPlayer) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Joueurs Similaires
          </h3>
        </div>
        <button
          onClick={generateRecommendations}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1 bg-emerald-600/20 hover:bg-emerald-500/30 rounded-lg text-emerald-300 text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
        Basé sur le style, la position et les performances de <strong>{currentPlayer.Player}</strong>
      </p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-200 dark:bg-slate-700 rounded-xl h-48"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((player, index) => (
            <div key={index} className="transform scale-90">
              <PlayerCard
                player={player}
                isSelected={false}
                onClick={() => onPlayerSelect(player)}
                onFavoriteToggle={onFavoriteToggle}
                onLoginRequired={onLoginRequired}
              />
            </div>
          ))}
        </div>
      )}

      {!loading && recommendations.length === 0 && (
        <div className="text-center py-8">
          <Lightbulb className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">
            Aucune recommandation disponible pour le moment
          </p>
        </div>
      )}
    </div>
  );
};