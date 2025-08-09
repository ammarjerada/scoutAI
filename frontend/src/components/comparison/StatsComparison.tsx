import React from 'react';
import { Player } from '../../types/Player';

interface StatsComparisonProps {
  players: [Player, Player];
}

export const StatsComparison: React.FC<StatsComparisonProps> = ({ players }) => {
  const stats = [
    { key: "Gls", name: "Buts" },
    { key: "Ast", name: "Assists" },
    { key: "xG", name: "xG" },
    { key: "xAG", name: "xAG" },
    { key: "Tkl", name: "Tacles" },
    { key: "KP", name: "Passes clés" },
  ];

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {stats.map(({ key, name }) => {
        const p1Value = parseFloat(String(players[0][key as keyof Player] || 0));
        const p2Value = parseFloat(String(players[1][key as keyof Player] || 0));

        return (
          <div key={key} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">
              {name}
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">
                  {players[0].Player}
                </span>
                <span className="text-emerald-400 font-bold">
                  {p1Value.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">
                  {players[1].Player}
                </span>
                <span className="text-amber-400 font-bold">
                  {p2Value.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};