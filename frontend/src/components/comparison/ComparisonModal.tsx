import React from 'react';
import { X, Download } from 'lucide-react';
import { Player } from '../../types/Player';
import { RadarComparison } from './RadarComparison';
import { StatsComparison } from './StatsComparison';
import { getDefaultPlayerImage, formatMarketValue } from '../../utils/playerUtils';
import { PDFService } from '../../services/pdfService';

interface ComparisonModalProps {
  players: [Player, Player];
  onClose: () => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({ players, onClose }) => {
  const handleExportComparison = async () => {
    try {
      await PDFService.exportComparisonReport(players);
    } catch (error) {
      console.error('Error exporting comparison:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="relative backdrop-blur-xl bg-white/5 border border-white/20 rounded-3xl p-6 lg:p-8 shadow-2xl">
          {/* Header Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleExportComparison}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-slate-700/50 hover:bg-slate-600/50 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Comparaison des joueurs
            </h2>
            <p className="text-slate-400">
              Analyse détaillée des performances
            </p>
          </div>

          {/* Player Headers */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {players.map((player, index) => (
              <div key={index} className="text-center">
                <div className="relative mx-auto w-24 h-24 mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full blur-md" />
                  <img
                    src={player.image_url}
                    alt={player.Player}
                    className="relative w-full h-full object-cover rounded-full shadow-xl border-2 border-emerald-400/50"
                    onError={(e) => {
                      e.currentTarget.src = getDefaultPlayerImage();
                    }}
                  />
                </div>
                <h3 className="text-xl font-bold text-white">{player.Player}</h3>
                <p className="text-slate-400 text-sm">{player.Squad}</p>
                <div className="mt-2 text-sm text-emerald-400 font-semibold">
                  {formatMarketValue(player.MarketValue)}
                </div>
              </div>
            ))}
          </div>

          {/* Radar Chart */}
          <RadarComparison players={players} />

          {/* Stats Comparison */}
          <StatsComparison players={players} />
        </div>
      </div>
    </div>
  );
};