import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Player } from '../../types/Player';

interface RadarComparisonProps {
  players: [Player, Player];
}

export const RadarComparison: React.FC<RadarComparisonProps> = ({ players }) => {
  const radarData = (() => {
    const keys = ["Gls", "Ast", "xG", "xAG", "Tkl", "KP"];
    const statNames = ["Buts", "Assists", "xG", "xAG", "Tacles", "Passes clés"];
    
    return keys.map((key, i) => ({
      stat: statNames[i],
      [players[0].Player]: parseFloat(String(players[0][key as keyof Player] || 0)),
      [players[1].Player]: parseFloat(String(players[1][key as keyof Player] || 0)),
    }));
  })();

  return (
    <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4 text-center">
        Comparaison des performances
      </h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#334155" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="stat"
              stroke="#e2e8f0"
              tick={{ fontSize: 12, fill: "#e2e8f0" }}
            />
            <PolarRadiusAxis
              stroke="#64748b"
              axisLine={false}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
            />
            <Radar
              name={players[0].Player}
              dataKey={players[0].Player}
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.2}
              strokeWidth={3}
            />
            <Radar
              name={players[1].Player}
              dataKey={players[1].Player}
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.2}
              strokeWidth={3}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                borderRadius: "12px",
                color: "#e2e8f0",
              }}
              itemStyle={{ fontSize: 13 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};