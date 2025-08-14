import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Player } from '../../types/Player';

interface PerformanceChartProps {
  players: Player[];
  metric: string;
  title: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  players,
  metric,
  title
}) => {
  // Generate mock historical data for demonstration
  const generateHistoricalData = (player: Player) => {
    const currentValue = player[metric as keyof Player] as number || 0;
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    return months.map((month, index) => {
      // Generate realistic progression
      const baseValue = currentValue * 0.7; // Start lower
      const progression = (currentValue - baseValue) * (index / 11); // Gradual improvement
      const noise = (Math.random() - 0.5) * currentValue * 0.1; // Add some variance
      
      return {
        month,
        [player.Player]: Math.max(0, baseValue + progression + noise),
        value: Math.max(0, baseValue + progression + noise)
      };
    });
  };

  if (players.length === 0) return null;

  // For single player, show area chart
  if (players.length === 1) {
    const data = generateHistoricalData(players[0]);
    
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {title} - Évolution sur l'année
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="month" 
                stroke="#64748b"
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <YAxis 
                stroke="#64748b"
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(148, 163, 184, 0.3)",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // For multiple players, show line chart comparison
  const combinedData = generateHistoricalData(players[0]).map((item, index) => {
    const result = { month: item.month };
    players.forEach(player => {
      const playerData = generateHistoricalData(player);
      result[player.Player] = playerData[index].value;
    });
    return result;
  });

  const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        {title} - Comparaison sur l'année
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="month" 
              stroke="#64748b"
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <YAxis 
              stroke="#64748b"
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                borderRadius: "12px",
                color: "#e2e8f0",
              }}
            />
            {players.map((player, index) => (
              <Line
                key={player.player_id}
                type="monotone"
                dataKey={player.Player}
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};