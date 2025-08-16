from typing import Dict, List, Any, Optional
from datetime import datetime
import json

class ResponseFormatter:
    """Classe utilitaire pour formater les réponses API"""
    
    @staticmethod
    def success(data: Any = None, message: str = "Succès") -> Dict:
        """Formate une réponse de succès"""
        response = {
            "success": True,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        
        if data is not None:
            response["data"] = data
        
        return response
    
    @staticmethod
    def error(message: str, code: str = "GENERIC_ERROR", details: Any = None) -> Dict:
        """Formate une réponse d'erreur"""
        response = {
            "success": False,
            "error": {
                "message": message,
                "code": code,
                "timestamp": datetime.now().isoformat()
            }
        }
        
        if details:
            response["error"]["details"] = details
        
        return response
    
    @staticmethod
    def paginated(data: List[Any], page: int, per_page: int, total: int) -> Dict:
        """Formate une réponse paginée"""
        total_pages = (total + per_page - 1) // per_page
        
        return {
            "success": True,
            "data": data,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1
            },
            "timestamp": datetime.now().isoformat()
        }
    
    @staticmethod
    def format_player(player_data: Dict) -> Dict:
        """Formate les données d'un joueur"""
        return {
            'player_id': int(player_data.get('player_id', 0)),
            'Player': player_data.get('name', ''),
            'Age': int(player_data.get('age', 0)),
            'Pos': player_data.get('position', ''),
            'Squad': player_data.get('squad', ''),
            'style': player_data.get('style_name', ''),
            'MarketValue': float(player_data.get('market_value', 0)),
            'Gls': int(player_data.get('goals', 0)),
            'Ast': int(player_data.get('assists', 0)),
            'xG': float(player_data.get('xG', 0)),
            'xAG': float(player_data.get('xAG', 0)),
            'Tkl': int(player_data.get('tackles', 0)),
            'PrgP': int(player_data.get('progressive_passes', 0)),
            'Carries': int(player_data.get('carries', 0)),
            'KP': int(player_data.get('key_passes', 0)),
            'image_url': player_data.get('image_url', '') or "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=400"
        }
    
    @staticmethod
    def format_user(user_data: Dict) -> Dict:
        """Formate les données d'un utilisateur"""
        from models.user import User
        
        user = User(
            user_id=user_data['user_id'],
            email=user_data['email'],
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            role=user_data['role'],
            password_hash=user_data['password_hash'],
            avatar_url=user_data.get('avatar_url'),
            created_at=user_data.get('created_at'),
            updated_at=user_data.get('updated_at')
        )
        
        user_dict = user.to_dict()
        user_dict['permissions'] = user.get_permissions()
        user_dict['preferences'] = {
            'theme': 'dark',
            'favoriteLeagues': [],
            'notifications': True
        }
        
        return user_dict