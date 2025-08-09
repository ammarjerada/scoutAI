import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Player } from '../../types/Player';

interface PlayerNameSearchProps {
    allPlayers: Player[];
    value: string;
    onChange: (value: string) => void;
    onPlayerSelect?: (player: Player) => void;
}

export const PlayerNameSearch: React.FC<PlayerNameSearchProps> = ({
    allPlayers,
    value,
    onChange,
    onPlayerSelect
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value.length >= 2) {
            const filtered = allPlayers
                .filter(player =>
                    player.Player.toLowerCase().includes(value.toLowerCase())
                )
                .slice(0, 10);
            setFilteredPlayers(filtered);
            setIsOpen(true);
        } else {
            setFilteredPlayers([]);
            setIsOpen(false);
        }
    }, [value, allPlayers]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !inputRef.current?.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePlayerClick = (player: Player) => {
        onChange(player.Player);
        setIsOpen(false);
        onPlayerSelect?.(player);
    };

    const clearSearch = () => {
        onChange('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Rechercher un joueur..."
                    className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 text-white pl-10 pr-10 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
                />
                {value && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 top-3 w-5 h-5 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isOpen && filteredPlayers.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto"
                >
                    {filteredPlayers.map((player, index) => (
                        <button
                            key={index}
                            onClick={() => handlePlayerClick(player)}
                            className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors duration-200 border-b border-slate-700/30 last:border-b-0"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-white font-medium">{player.Player}</div>
                                    <div className="text-slate-400 text-sm">
                                        {player.Age} ans • {player.Pos} • {player.Squad}
                                    </div>
                                </div>
                                <div className="text-emerald-400 text-sm font-semibold">
                                    {(player.MarketValue / 1000000).toFixed(1)}M€
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};