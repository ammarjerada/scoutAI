import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target, Activity } from 'lucide-react';
import { Player } from '../../types/Player';

interface PerformanceMetricsProps {
  player: Player;
  comparisonPlayer?: Player;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  player,
  comparisonPlayer
}) => {
  const metrics = [
    {
      key: 'efficiency',
      label: 'Efficacité',
      value: calculateEfficiency(player),
      description: 'Ratio buts/occasions',
      icon: Target
    },
    {
      key: 'creativity',
      label: 'Créativité',
      value: calculateCreativity(player),
      description: 'Capacité de création',
      icon: Activity
    },
    {
      key: 'workRate',
      label: 'Intensité',
      value: calculateWorkRate(player),
      description: 'Activité sur le terrain',
      icon: TrendingUp
    },
    {
      key: 'consistency',
      label: 'Régularité',
      value: calculateConsistency(player),
      description: 'Stabilité des performances',
      icon: Activity
    }
  ];

  function calculateEfficiency(p: Player): number {
    const shots = (p.Gls || 0) + (p.xG || 0);
    if (shots === 0) return 0;
    return Math.min(100, ((p.Gls || 0) / shots) * 100);
  }

  function calculateCreativity(p: Player): number {
    const creative = (p.KP || 0) + (p.Ast || 0) + (p.xAG || 0);
    return Math.min(100, creative * 2);
  }

  function calculateWorkRate(p: Player): number {
    const activity = (p.Tkl || 0) + (p.Carries || 0) + (p.PrgP || 0);
    return Math.min(100, activity / 3);
  }

  function calculateConsistency(p: Player): number {
    // Simuler la régularité basée sur les stats
    const variance = Math.abs((p.xG || 0) - (p.Gls || 0)) + Math.abs((p.xAG || 0) - (p.Ast || 0));
    return Math.max(0, 100 - variance * 10);
  }

  const getComparisonIcon = (value1: number, value2: number) => {
    const diff = value1 - value2;
    if (Math.abs(diff) < 5) return <Minus className="w-4 h-4 text-slate-400" />;
    return diff > 0 
      ? <TrendingUp className="w-4 h-4 text-emerald-500" />
      : <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
        Métriques de Performance
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const score = metric.value;
          const comparisonScore = comparisonPlayer ? 
            metric.key === 'efficiency' ? calculateEfficiency(comparisonPlayer) :
            metric.key === 'creativity' ? calculateCreativity(comparisonPlayer) :
            metric.key === 'workRate' ? calculateWorkRate(comparisonPlayer) :
            calculateConsistency(comparisonPlayer) : null;

          return (
            <div key={metric.key} className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {metric.label}
                  </span>
                </div>
                {comparisonScore !== null && (
                  <div className="flex items-center gap-1">
                    {getComparisonIcon(score, comparisonScore)}
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      vs {comparisonScore.toFixed(0)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mb-2">
                <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                  {score.toFixed(0)}
                  <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">/100</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {metric.description}
                </p>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    score >= 80 ? 'bg-emerald-500' :
                    score >= 60 ? 'bg-yellow-500' :
                    score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, score)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};