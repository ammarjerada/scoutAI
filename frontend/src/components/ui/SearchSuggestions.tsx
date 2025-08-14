import React, { useState, useEffect } from 'react';
import { Search, Clock, TrendingUp, Star } from 'lucide-react';
import { Player } from '../../types/Player';

interface SearchSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  recentSearches: string[];
  popularPlayers: Player[];
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  onSuggestionClick,
  recentSearches,
  popularPlayers
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const popularSearches = [
    'Mbappé', 'Haaland', 'Bellingham', 'Vinicius', 'Pedri',
    'Gavi', 'Camavinga', 'Tchouaméni', 'Wirtz', 'Musiala'
  ];

  const trendingStyles = [
    'football total', 'jeu de possession', 'pressing intense', 'jeu positionnel'
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-slate-300 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Suggestions</span>
      </button>

      {isVisible && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl shadow-2xl z-50 p-4">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <h4 className="text-sm font-semibold text-slate-300">Recherches récentes</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.slice(0, 5).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onSuggestionClick(search);
                      setIsVisible(false);
                    }}
                    className="px-2 py-1 bg-slate-700/50 hover:bg-slate-600/50 rounded text-xs text-slate-300 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Players */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-slate-300">Joueurs populaires</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((player, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSuggestionClick(player);
                    setIsVisible(false);
                  }}
                  className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-500/30 rounded text-xs text-emerald-300 transition-colors"
                >
                  {player}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Styles */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <h4 className="text-sm font-semibold text-slate-300">Styles tendance</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingStyles.map((style, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSuggestionClick(style);
                    setIsVisible(false);
                  }}
                  className="px-2 py-1 bg-violet-600/20 hover:bg-violet-500/30 rounded text-xs text-violet-300 transition-colors"
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};