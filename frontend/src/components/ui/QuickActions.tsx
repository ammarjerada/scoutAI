import React from 'react';
import { 
  Zap, 
  TrendingUp, 
  Users, 
  Target, 
  Crown,
  Shield,
  Activity
} from 'lucide-react';
import { FilterParams } from '../../types/Player';

interface QuickActionsProps {
  onQuickFilter: (filters: Partial<FilterParams>) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onQuickFilter }) => {
  const quickFilters = [
    {
      label: 'Jeunes Talents',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-500',
      filters: { maxAge: '23', sort_order: 'desc' as const }
    },
    {
      label: 'Buteurs Elite',
      icon: Target,
      color: 'from-red-500 to-pink-500',
      filters: { goals_min: '10', sort_order: 'desc' as const }
    },
    {
      label: 'Créateurs',
      icon: Activity,
      color: 'from-blue-500 to-indigo-500',
      filters: { assists_min: '5', sort_order: 'desc' as const }
    },
    {
      label: 'Défenseurs Solides',
      icon: Shield,
      color: 'from-slate-500 to-slate-600',
      filters: { position: 'DF', tackles_min: '50', sort_order: 'desc' as const }
    },
    {
      label: 'Milieux Complets',
      icon: Users,
      color: 'from-violet-500 to-purple-500',
      filters: { position: 'MF', style: 'jeu de possession' }
    },
    {
      label: 'Stars Mondiales',
      icon: Crown,
      color: 'from-yellow-500 to-orange-500',
      filters: { budget: '100000000', sort_order: 'desc' as const }
    }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        Actions Rapides
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickFilters.map((filter, index) => (
          <button
            key={index}
            onClick={() => onQuickFilter(filter.filters)}
            className={`group relative p-4 bg-gradient-to-r ${filter.color} rounded-xl text-white font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg`}
          >
            <div className="flex flex-col items-center gap-2">
              <filter.icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm text-center leading-tight">
                {filter.label}
              </span>
            </div>
            <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
        ))}
      </div>
    </div>
  );
};