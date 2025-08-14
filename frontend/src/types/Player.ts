export interface Player {
  
  Player: string;
  Age: number;
  Pos: string;
  Squad: string;
  style: string;
  MarketValue: number;
  Gls: number;
  Ast: number;
  xG: number;
  xAG: number;
  Tkl: number;
  PrgP: number;
  Carries: number;
  KP: number;
  image_url: string;
}

export interface FilterParams {
  style: string;
  position: string;
  budget: string;
  minAge: string;
  maxAge: string;
  playerName: string;
  sort_order: 'asc' | 'desc';
  league?: string;
  nationality?: string;
  goals_min?: string;
  goals_max?: string;
  assists_min?: string;
  assists_max?: string;
  xg_min?: string;
  xg_max?: string;
  tackles_min?: string;
  tackles_max?: string;
}

export interface RadarDataPoint {
  stat: string;
  value: number;
}

export interface PlayerOption {
  value: string;
  label: string;
  player: Player;
}

export interface FavoritePlayer {
  id: string;
  player: Player;
  addedAt: string;
  notes?: string;
}