from dataclasses import dataclass
from typing import Optional, Dict
from datetime import datetime

@dataclass
class Player:
    """Modèle joueur"""
    player_id: int
    name: str
    age: Optional[int] = None
    position: Optional[str] = None
    squad: Optional[str] = None
    market_value: Optional[float] = None
    goals: Optional[int] = None
    assists: Optional[int] = None
    tackles: Optional[int] = None
    xG: Optional[float] = None
    xAG: Optional[float] = None
    key_passes: Optional[int] = None
    progressive_passes: Optional[int] = None
    carries: Optional[int] = None
    image_url: Optional[str] = None
    id_style: Optional[int] = None
    style_name: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def to_dict(self) -> Dict:
        """Convertit en dictionnaire pour l'API"""
        return {
            'player_id': self.player_id,
            'Player': self.name,
            'Age': self.age or 0,
            'Pos': self.position or '',
            'Squad': self.squad or '',
            'style': self.style_name or '',
            'MarketValue': self.market_value or 0,
            'Gls': self.goals or 0,
            'Ast': self.assists or 0,
            'xG': self.xG or 0,
            'xAG': self.xAG or 0,
            'Tkl': self.tackles or 0,
            'PrgP': self.progressive_passes or 0,
            'Carries': self.carries or 0,
            'KP': self.key_passes or 0,
            'image_url': self.image_url or "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=400"
        }

    def calculate_overall_score(self) -> float:
        """Calcule un score global de performance"""
        offensive = ((self.goals or 0) + (self.assists or 0) + (self.xG or 0)) / 3
        creative = ((self.key_passes or 0) + (self.xAG or 0)) / 2
        defensive = self.tackles or 0
        
        return (offensive * 0.4 + creative * 0.3 + defensive * 0.3)

    def get_performance_metrics(self) -> Dict:
        """Calcule les métriques de performance avancées"""
        return {
            'efficiency': self._calculate_efficiency(),
            'creativity': self._calculate_creativity(),
            'workRate': self._calculate_work_rate(),
            'consistency': self._calculate_consistency()
        }

    def _calculate_efficiency(self) -> float:
        """Calcule l'efficacité (ratio buts/occasions)"""
        shots = (self.goals or 0) + (self.xG or 0)
        if shots == 0:
            return 0
        return min(100, ((self.goals or 0) / shots) * 100)

    def _calculate_creativity(self) -> float:
        """Calcule la créativité"""
        creative = (self.key_passes or 0) + (self.assists or 0) + (self.xAG or 0)
        return min(100, creative * 2)

    def _calculate_work_rate(self) -> float:
        """Calcule l'intensité de jeu"""
        activity = (self.tackles or 0) + (self.carries or 0) + (self.progressive_passes or 0)
        return min(100, activity / 3)

    def _calculate_consistency(self) -> float:
        """Calcule la régularité"""
        variance = abs((self.xG or 0) - (self.goals or 0)) + abs((self.xAG or 0) - (self.assists or 0))
        return max(0, 100 - variance * 10)