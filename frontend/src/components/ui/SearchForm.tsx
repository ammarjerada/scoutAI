import React from 'react';
import { Filter, Search, ChevronDown, Heart } from 'lucide-react';
import { FilterParams } from '../../types/Player';
import { GAME_STYLES, POSITIONS } from '../../constants/gameStyles';

interface SearchFormProps {
  filters: FilterParams;
  onFiltersChange: (filters: Partial<FilterParams>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  onShowFavorites: () => void;
  favoritesCount: number;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  filters,
  onFiltersChange,
  onSubmit,
  loading,
  onShowFavorites,
  favoritesCount
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  const formatBudgetValue = (value: string) => {
    if (!value) return '';
    const numValue = parseFloat(value);
    if (numValue >= 1000000) {
      return `${(numValue / 1000000).toFixed(0)}M€`;
    }
    return `${numValue}€`;
  };

  const handleBudgetChange = (value: string) => {
    if (!value) {
      onFiltersChange({ budget: '' });
      return;
    }
    
    // Convert M€ format to actual value
    const cleanValue = value.replace(/[M€\s]/g, '');
    const numValue = parseFloat(cleanValue);
    if (!isNaN(numValue)) {
      onFiltersChange({ budget: (numValue * 1000000).toString() });
    }
  };

  return (
    <div className="mb-12 lg:mb-16">
      <form onSubmit={handleSubmit} className="relative">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 lg:p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Filter className="w-6 h-6 text-blue-600 dark:text-emerald-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recherche de joueurs</h2>
            </div>
            <button
              type="button"
              onClick={onShowFavorites}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl text-white font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-200"
            >
              <Heart className="w-4 h-4" />
              <span>Favoris ({favoritesCount})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
            {/* Style Selection - OBLIGATOIRE */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Style de jeu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={filters.style}
                  onChange={(e) => onFiltersChange({ style: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Choisir un style</option>
                  {GAME_STYLES.map((style) => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Position Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Position
              </label>
              <div className="relative">
                <select
                  value={filters.position}
                  onChange={(e) => onFiltersChange({ position: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Toutes positions</option>
                  {POSITIONS.map((position) => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Age Range */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Âge (min - max)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={filters.minAge}
                  onChange={(e) => onFiltersChange({ minAge: e.target.value })}
                  placeholder="18"
                  min="16"
                  max="40"
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-3 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
                />
                <input
                  type="number"
                  value={filters.maxAge}
                  onChange={(e) => onFiltersChange({ maxAge: e.target.value })}
                  placeholder="35"
                  min="16"
                  max="40"
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-3 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Budget Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Budget maximum
              </label>
              <input
                type="text"
                value={formatBudgetValue(filters.budget)}
                onChange={(e) => handleBudgetChange(e.target.value)}
                placeholder="50M€"
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tri par valeur
              </label>
              <div className="relative">
                <select
                  value={filters.sort_order}
                  onChange={(e) => onFiltersChange({ sort_order: e.target.value as 'asc' | 'desc' })}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="desc">Plus cher → Moins cher</option>
                  <option value="asc">Moins cher → Plus cher</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              disabled={loading || !filters.style}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-emerald-500 dark:to-cyan-500 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>{loading ? "Recherche en cours..." : "Rechercher les joueurs"}</span>
              </div>
            </button>
          </div>

          {!filters.style && (
            <p className="text-center text-sm text-red-500 dark:text-red-400 mt-4">
              Veuillez sélectionner un style de jeu pour commencer la recherche
            </p>
          )}
        </div>
      </form>
    </div>
  );
};