import React from 'react';
import { Filter, Search, ChevronDown, Heart } from 'lucide-react';
import { FilterParams } from '../../types/Player';
import { GAME_STYLES, POSITIONS } from '../../constants/gameStyles';
import { PlayerNameSearch } from './PlayerNameSearch';
import { SearchSuggestions } from './SearchSuggestions';
import { SearchHistoryService } from '../../utils/searchHistory';
import { useState, useEffect } from 'react';

interface SearchFormProps {
  filters: FilterParams;
  onFiltersChange: (filters: Partial<FilterParams>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  allPlayers: any[];
  onShowFavorites: () => void;
  favoritesCount: number;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  filters,
  onFiltersChange,
  onSubmit,
  loading,
  allPlayers,
  onShowFavorites,
  favoritesCount
}) => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(SearchHistoryService.getSearchHistory());
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    onFiltersChange({ playerName: suggestion });
    SearchHistoryService.addToSearchHistory(suggestion);
    setRecentSearches(SearchHistoryService.getSearchHistory());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save search to history
    if (filters.playerName) {
      SearchHistoryService.addToSearchHistory(filters.playerName);
      setRecentSearches(SearchHistoryService.getSearchHistory());
    }
    
    onSubmit(e);
  };

  return (
    <div className="mb-12 lg:mb-16">
      <form onSubmit={handleSubmit} className="relative">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Filter className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl font-bold text-white">Filtres de recherche</h2>
            </div>
            <div className="flex items-center gap-3">
              <SearchSuggestions
                onSuggestionClick={handleSuggestionClick}
                recentSearches={recentSearches}
                popularPlayers={allPlayers.slice(0, 10)}
              />
              <button
                type="button"
                onClick={onShowFavorites}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl text-white font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-200"
              >
                <Heart className="w-4 h-4" />
                <span>Favoris ({favoritesCount})</span>
              </button>
            </div>
          </div>

          {/* Player Name Search */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Recherche par nom
            </label>
            <PlayerNameSearch
              allPlayers={allPlayers}
              value={filters.playerName}
              onChange={(value) => onFiltersChange({ playerName: value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6">
            {/* Style Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">
                Style de jeu
              </label>
              <div className="relative">
                <select
                  required
                  value={filters.style}
                  onChange={(e) => onFiltersChange({ style: e.target.value })}
                  className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Sélectionner un style</option>
                  {GAME_STYLES.map((style) => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Position Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">
                Position
              </label>
              <div className="relative">
                <select
                  value={filters.position}
                  onChange={(e) => onFiltersChange({ position: e.target.value })}
                  className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
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
              <label className="block text-sm font-semibold text-slate-300">
                Âge minimum
              </label>
              <input
                type="number"
                value={filters.minAge}
                onChange={(e) => onFiltersChange({ minAge: e.target.value })}
                placeholder="Ex: 18"
                min="16"
                max="40"
                className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">
                Âge maximum
              </label>
              <input
                type="number"
                value={filters.maxAge}
                onChange={(e) => onFiltersChange({ maxAge: e.target.value })}
                placeholder="Ex: 35"
                min="16"
                max="40"
                className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
              />
            </div>

            {/* Budget Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">
                Budget maximum
              </label>
              <input
                type="number"
                value={filters.budget}
                onChange={(e) => onFiltersChange({ budget: e.target.value })}
                placeholder="Ex: 50000000"
                className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">
                Tri par valeur
              </label>
              <div className="relative">
                <select
                  value={filters.sort_order}
                  onChange={(e) => onFiltersChange({ sort_order: e.target.value as 'asc' | 'desc' })}
                  className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
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
              disabled={loading}
              className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-full font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>{loading ? "Recherche en cours..." : "Analyser les joueurs"}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};