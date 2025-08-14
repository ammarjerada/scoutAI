import React, { useState } from 'react';
import { Player } from '../../types/Player';
import { formatMarketValue, getDefaultPlayerImage } from '../../utils/playerUtils';
import { STYLE_COLORS, STYLE_ICONS } from '../../constants/gameStyles';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PlayerComparisonProps {
  players: Player[];
  onRemovePlayer: (playerId: number) => void;
}

export const PlayerComparison: React.FC<PlayerComparisonProps> = ({
  players,
  onRemovePlayer
}) => {
  const [selectedStat, setSelectedStat] = useState<string>('overall');

  if (players.length < 2) return null;

  const stats = [
    { key: 'Gls', label: 'Buts', type: 'number' },
    { key: 'Ast', label: 'Assists', type: 'number' },
    { key: 'xG', label: 'xG', type: 'decimal' },
    { key: 'xAG', label: 'xAG', type: 'decimal' },
    { key: 'Tkl', label: 'Tacles', type: 'number' },
    { key: 'PrgP', label: 'Passes Prog.', type: 'number' },
    { key: 'Carries', label: 'Courses', type: 'number' },
    { key: 'KP', label: 'Passes Clés', type: 'number' }
  ];

  const getComparisonIcon = (value1: number, value2: number) => {
    const diff = Math.abs(value1 - value2);
    const avg = (value1 + value2) / 2;
    const threshold = avg * 0.1; // 10% difference threshold

    if (diff < threshold) return <Minus className="w-4 h-4 text-slate-400" />;
    return value1 > value2 
      ? <TrendingUp className="w-4 h-4 text-emerald-500" />
      : <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const formatStatValue = (value: number, type: string) => {
    if (type === 'decimal') return value.toFixed(1);
    return Math.round(value).toString();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
        Comparaison Détaillée
      </h3>

      {/* Player Headers */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {players.slice(0, 2).map((player, index) => {
          const StyleIcon = STYLE_ICONS[player.style as keyof typeof STYLE_ICONS] || Activity;
          
          return (
            <div key={index} className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <img
                  src={player.image_url}
                  alt={player.Player}
                  className="w-full h-full object-cover rounded-full border-3 border-emerald-400/50"
                  onError={(e) => {
                    e.currentTarget.src = getDefaultPlayerImage();
                  }}
                />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">{player.Player}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">{player.Squad}</p>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r ${(STYLE_COLORS as Record<string, string>)[player.style] || "from-slate-500 to-slate-600"} text-xs mt-2`}>
                <StyleIcon className="w-3 h-3 text-white" />
                <span className="text-white font-semibold">{player.style}</span>
              </div>
              <div className="text-emerald-500 font-bold text-sm mt-1">
                {formatMarketValue(player.MarketValue)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Comparison */}
      <div className="space-y-3">
        {stats.map(({ key, label, type }) => {
          const value1 = players[0][key as keyof Player] as number || 0;
          const value2 = players[1][key as keyof Player] as number || 0;
          
          return (
            <div key={key} className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatStatValue(value1, type)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {players[0].Player}
                  </div>
                </div>
                
                <div className="flex flex-col items-center px-4">
                  {getComparisonIcon(value1, value2)}
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                    {label}
                  </span>
                </div>
                
                <div className="flex-1 text-center">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatStatValue(value2, type)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {players[1].Player}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Rating */}
      <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl border border-emerald-500/20">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 text-center">
          Évaluation Globale
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {players.slice(0, 2).map((player, index) => {
            // Calculate overall score
            const offensiveScore = ((player.Gls || 0) + (player.Ast || 0) + (player.xG || 0)) / 3;
            const creativeScore = ((player.KP || 0) + (player.xAG || 0)) / 2;
            const defensiveScore = player.Tkl || 0;
            const overallScore = (offensiveScore * 0.4 + creativeScore * 0.3 + defensiveScore * 0.3);
            
            return (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-emerald-500 mb-1">
                  {overallScore.toFixed(1)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Score Global
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};