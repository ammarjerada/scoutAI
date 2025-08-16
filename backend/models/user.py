from dataclasses import dataclass
from typing import Optional, Dict
from datetime import datetime

@dataclass
class User:
    """Modèle utilisateur"""
    user_id: int
    email: str
    first_name: str
    last_name: str
    role: str
    password_hash: str
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def to_dict(self) -> Dict:
        """Convertit en dictionnaire pour l'API"""
        return {
            'id': str(self.user_id),
            'user_id': self.user_id,
            'email': self.email,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'role': self.role,
            'avatar': self.avatar_url,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

    def get_permissions(self) -> Dict:
        """Retourne les permissions selon le rôle"""
        permissions = {
            'admin': {
                'canManageUsers': True,
                'canViewAllData': True,
                'canExportData': True,
                'canCreateTeams': True,
                'canManageDatabase': True,
                'maxFavorites': 1000,
                'maxTeams': 50
            },
            'analyst': {
                'canManageUsers': False,
                'canViewAllData': True,
                'canExportData': True,
                'canCreateTeams': True,
                'canManageDatabase': False,
                'maxFavorites': 500,
                'maxTeams': 20
            },
            'scout': {
                'canManageUsers': False,
                'canViewAllData': False,
                'canExportData': True,
                'canCreateTeams': True,
                'canManageDatabase': False,
                'maxFavorites': 100,
                'maxTeams': 10
            }
        }
        return permissions.get(self.role, permissions['scout'])