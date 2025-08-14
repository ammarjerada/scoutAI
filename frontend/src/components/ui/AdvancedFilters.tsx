import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, RotateCcw } from 'lucide-react';
import { FilterParams } from '../../types/Player';

interface AdvancedFiltersProps {
  filters: FilterParams;
  onFiltersChange: (filters: Partial<FilterParams>) => void;
  onReset: () => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatFilter = (stat: string, min: string, max: string) => {
    onFiltersChange({
      [`${stat}_min`]: min,
      [`${stat}_max`]: max
    });
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Filtres Avancés</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-1 bg-slate-600/50 hover:bg-slate-500/50 rounded-lg text-slate-300 text-sm transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-1 bg-emerald-600/20 hover:bg-emerald-500/30 rounded-lg text-emerald-300 text-sm transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {isExpanded ? 'Réduire' : 'Étendre'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6 animate-in slide-in-from-top duration-300">
          {/* Performance Stats Filters */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Statistiques de Performance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'goals', label: 'Buts', min: filters.goals_min || '', max: filters.goals_max || '' },
                { key: 'assists', label: 'Assists', min: filters.assists_min || '', max: filters.assists_max || '' },
                { key: 'xg', label: 'xG', min: filters.xg_min || '', max: filters.xg_max || '' },
                { key: 'tackles', label: 'Tacles', min: filters.tackles_min || '', max: filters.tackles_max || '' }
              ].map(({ key, label, min, max }) => (
                <div key={key} className="space-y-2">
                  <label className="block text-xs font-medium text-slate-400">{label}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={min}
                      onChange={(e) => handleStatFilter(key, e.target.value, max)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 text-white px-2 py-1 rounded text-sm focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={max}
                      onChange={(e) => handleStatFilter(key, min, e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 text-white px-2 py-1 rounded text-sm focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* League Filter */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Ligue</h4>
            <select
              value={filters.league || ''}
              onChange={(e) => onFiltersChange({ league: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600/50 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Toutes les ligues</option>
              <option value="Premier League">Premier League</option>
              <option value="La Liga">La Liga</option>
              <option value="Serie A">Serie A</option>
              <option value="Ligue 1">Ligue 1</option>
              <option value="Bundesliga">Bundesliga</option>
            </select>
          </div>

          {/* Nationality Filter */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Nationalité</h4>
            <input
              type="text"
              placeholder="Ex: FRA, ENG, ESP..."
              value={filters.nationality || ''}
              onChange={(e) => onFiltersChange({ nationality: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600/50 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};