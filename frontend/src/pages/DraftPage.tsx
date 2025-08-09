import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Save, 
  Trash2, 
  RotateCcw,
  Target,
  Crown,
  Shield,
  Zap,
  AlertCircle,
  Check
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '../contexts/AuthContext';
import { usePlayerSearch } from '../hooks/usePlayerSearch';
import { Player } from '../types/Player';
import { getDefaultPlayerImage, formatMarketValue } from '../utils/playerUtils';

interface DraftPlayer extends Player {
  draftPosition?: string;
  positionX?: number;
  positionY?: number;
}

interface Formation {
  name: string;
  positions: {
    name: string;
    x: number;
    y: number;
    role: string;
  }[];
}

const FORMATIONS: Formation[] = [
  {
    name: '4-3-3',
    positions: [
      { name: 'GK', x: 50, y: 10, role: 'Gardien' },
      { name: 'RB', x: 80, y: 25, role: 'Défenseur droit' },
      { name: 'CB1', x: 60, y: 25, role: 'Défenseur central' },
      { name: 'CB2', x: 40, y: 25, role: 'Défenseur central' },
      { name: 'LB', x: 20, y: 25, role: 'Défenseur gauche' },
      { name: 'CM1', x: 65, y: 50, role: 'Milieu central' },
      { name: 'CM2', x: 50, y: 55, role: 'Milieu central' },
      { name: 'CM3', x: 35, y: 50, role: 'Milieu central' },
      { name: 'RW', x: 75, y: 75, role: 'Ailier droit' },
      { name: 'ST', x: 50, y: 80, role: 'Attaquant' },
      { name: 'LW', x: 25, y: 75, role: 'Ailier gauche' }
    ]
  },
  {
    name: '4-4-2',
    positions: [
      { name: 'GK', x: 50, y: 10, role: 'Gardien' },
      { name: 'RB', x: 80, y: 25, role: 'Défenseur droit' },
      { name: 'CB1', x: 60, y: 25, role: 'Défenseur central' },
      { name: 'CB2', x: 40, y: 25, role: 'Défenseur central' },
      { name: 'LB', x: 20, y: 25, role: 'Défenseur gauche' },
      { name: 'RM', x: 80, y: 55, role: 'Milieu droit' },
      { name: 'CM1', x: 60, y: 55, role: 'Milieu central' },
      { name: 'CM2', x: 40, y: 55, role: 'Milieu central' },
      { name: 'LM', x: 20, y: 55, role: 'Milieu gauche' },
      { name: 'ST1', x: 60, y: 80, role: 'Attaquant' },
      { name: 'ST2', x: 40, y: 80, role: 'Attaquant' }
    ]
  }
];

const DraggablePlayer: React.FC<{ player: DraftPlayer; onRemove: () => void }> = ({ player, onRemove }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'player',
    item: { player },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`group relative bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 cursor-move transition-all duration-200 hover:shadow-lg ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-3 h-3" />
      </button>
      
      <div className="flex items-center gap-3">
        <img
          src={player.image_url}
          alt={player.Player}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.src = getDefaultPlayerImage();
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
            {player.Player}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {player.Pos} • {player.Squad}
          </p>
        </div>
      </div>
    </div>
  );
};

const FieldPosition: React.FC<{
  position: { name: string; x: number; y: number; role: string };
  player?: DraftPlayer;
  onDrop: (player: DraftPlayer) => void;
  onRemove: () => void;
}> = ({ position, player, onDrop, onRemove }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'player',
    drop: (item: { player: DraftPlayer }) => {
      onDrop(item.player);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
        isOver ? 'scale-110' : ''
      }`}
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      {player ? (
        <div className="group relative">
          <div className="w-16 h-16 bg-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
            <img
              src={player.image_url}
              alt={player.Player}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = getDefaultPlayerImage();
              }}
            />
          </div>
          <button
            onClick={onRemove}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {player.Player}
          </div>
        </div>
      ) : (
        <div className={`w-16 h-16 border-4 border-dashed rounded-full flex items-center justify-center transition-all duration-200 ${
          isOver 
            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' 
            : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
        }`}>
          <div className="text-center">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {position.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const DraftPage: React.FC = () => {
  const { user } = useAuth();
  const { allPlayers, loadAllPlayers } = usePlayerSearch();
  const [selectedFormation, setSelectedFormation] = useState<Formation>(FORMATIONS[0]);
  const [teamPlayers, setTeamPlayers] = useState<{ [key: string]: DraftPlayer }>({});
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamName, setTeamName] = useState('Mon Équipe');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (allPlayers.length === 0) {
      loadAllPlayers();
    } else {
      setAvailablePlayers(allPlayers.slice(0, 50));
    }
  }, [allPlayers, loadAllPlayers]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredPlayers = availablePlayers.filter(player =>
    player.Player.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.Squad.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDrop = (position: string, player: DraftPlayer) => {
    // Vérifier si le joueur est déjà dans l'équipe
    const existingPosition = Object.keys(teamPlayers).find(pos => 
      teamPlayers[pos]?.player_id === player.player_id
    );
    
    if (existingPosition) {
      // Déplacer le joueur
      const newTeamPlayers = { ...teamPlayers };
      delete newTeamPlayers[existingPosition];
      newTeamPlayers[position] = player;
      setTeamPlayers(newTeamPlayers);
    } else {
      // Ajouter le nouveau joueur
      setTeamPlayers(prev => ({
        ...prev,
        [position]: player
      }));
    }
  };

  const handleRemoveFromPosition = (position: string) => {
    setTeamPlayers(prev => {
      const newTeam = { ...prev };
      delete newTeam[position];
      return newTeam;
    });
  };

  const handleRemoveFromBench = (playerId: number) => {
    setTeamPlayers(prev => {
      const newTeam = { ...prev };
      const position = Object.keys(newTeam).find(pos => newTeam[pos]?.player_id === playerId);
      if (position) {
        delete newTeam[position];
      }
      return newTeam;
    });
  };

  const handleSaveTeam = () => {
    const playerCount = Object.keys(teamPlayers).length;
    if (playerCount === 0) {
      showNotification('error', 'Ajoutez au moins un joueur à votre équipe');
      return;
    }
    
    showNotification('success', `Équipe "${teamName}" sauvegardée avec ${playerCount} joueurs !`);
  };

  const handleResetTeam = () => {
    setTeamPlayers({});
    showNotification('success', 'Équipe réinitialisée');
  };

  const totalValue = Object.values(teamPlayers).reduce((sum, player) => sum + (player?.MarketValue || 0), 0);
  const playerCount = Object.keys(teamPlayers).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Accès refusé
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Vous devez être connecté pour accéder au mode Draft.
          </p>
        </div>
      </div>
    );
  }

  if (!user.permissions.canCreateTeams) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Permissions insuffisantes
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Votre rôle ne permet pas de créer des équipes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right ${
            notification.type === 'success' 
              ? 'bg-emerald-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Mode Draft - Création d'Équipe
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Construisez votre équipe idéale avec un système drag & drop
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetTeam}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={handleSaveTeam}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Terrain de Football */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                {/* Team Info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="text-xl font-bold bg-transparent border-b-2 border-emerald-500 text-slate-900 dark:text-white focus:outline-none"
                      placeholder="Nom de l'équipe"
                    />
                    <select
                      value={selectedFormation.name}
                      onChange={(e) => {
                        const formation = FORMATIONS.find(f => f.name === e.target.value);
                        if (formation) {
                          setSelectedFormation(formation);
                          setTeamPlayers({}); // Reset positions
                        }
                      }}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                    >
                      {FORMATIONS.map(formation => (
                        <option key={formation.name} value={formation.name}>
                          {formation.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Joueurs: {playerCount}/11
                    </div>
                    <div className="text-lg font-bold text-emerald-500">
                      {formatMarketValue(totalValue)}
                    </div>
                  </div>
                </div>

                {/* Football Field */}
                <div className="relative w-full h-96 bg-gradient-to-b from-green-400 to-green-500 rounded-xl overflow-hidden">
                  {/* Field Lines */}
                  <div className="absolute inset-0">
                    {/* Center Circle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white/50 rounded-full"></div>
                    {/* Center Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/50"></div>
                    {/* Penalty Areas */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-16 border-2 border-white/50 border-b-0"></div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-16 border-2 border-white/50 border-t-0"></div>
                  </div>

                  {/* Player Positions */}
                  {selectedFormation.positions.map((pos, index) => (
                    <FieldPosition
                      key={`${selectedFormation.name}-${pos.name}-${index}`}
                      position={pos}
                      player={teamPlayers[pos.name]}
                      onDrop={(player) => handleDrop(pos.name, player)}
                      onRemove={() => handleRemoveFromPosition(pos.name)}
                    />
                  ))}
                </div>

                {/* Formation Info */}
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Formation {selectedFormation.name}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {selectedFormation.positions.map((pos, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          teamPlayers[pos.name] ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}></div>
                        <span className="text-slate-600 dark:text-slate-400">
                          {pos.name} - {pos.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Player Selection Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Sélection de Joueurs
                </h3>
                
                {/* Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un joueur..."
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Available Players */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredPlayers.map((player, index) => (
                    <DraggablePlayer
                      key={`${player.player_id}-${index}`}
                      player={player}
                      onRemove={() => handleRemoveFromBench(player.player_id)}
                    />
                  ))}
                </div>

                {/* Team Summary */}
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                    Résumé de l'équipe
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Joueurs</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {playerCount}/11
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Valeur totale</span>
                      <span className="font-semibold text-emerald-500">
                        {formatMarketValue(totalValue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Formation</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedFormation.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};