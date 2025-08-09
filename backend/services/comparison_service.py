# backend/services/comparison_service.py
from config.database import db
from typing import List, Dict, Optional
from .player_service import PlayerService

class ComparisonService:
    """Service pour la gestion des comparaisons de joueurs"""
    
    def __init__(self):
        self.player_service = PlayerService()
    
    def get_user_comparisons(self, user_id: int, limit: int = 50) -> List[Dict]:
        """Récupère l'historique des comparaisons d'un utilisateur"""
        try:
            query = """
                SELECT 
                    c.id_comparison,
                    c.compared_at,
                    p1.name as player1_name,
                    p1.player_id as player1_id,
                    p1.image_url as player1_image,
                    p1.squad as player1_squad,
                    p2.name as player2_name,
                    p2.player_id as player2_id,
                    p2.image_url as player2_image,
                    p2.squad as player2_squad
                FROM comparisons c
                JOIN players p1 ON c.id_player_1 = p1.player_id
                JOIN players p2 ON c.id_player_2 = p2.player_id
                WHERE c.user_id = %s
                ORDER BY c.compared_at DESC
                LIMIT %s
            """
            
            results = db.execute_query(query, (user_id, limit))
            
            if results:
                comparisons = []
                for comp in results:
                    comparison = {
                        'comparison_id': comp['id_comparison'],
                        'compared_at': comp['compared_at'].isoformat() if comp['compared_at'] else None,
                        'player1': {
                            'player_id': comp['player1_id'],
                            'name': comp['player1_name'],
                            'squad': comp['player1_squad'],
                            'image_url': comp['player1_image'] or "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=400"
                        },
                        'player2': {
                            'player_id': comp['player2_id'],
                            'name': comp['player2_name'],
                            'squad': comp['player2_squad'],
                            'image_url': comp['player2_image'] or "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=400"
                        }
                    }
                    comparisons.append(comparison)
                
                return comparisons
            
            return []
            
        except Exception as e:
            print(f"Erreur dans get_user_comparisons: {e}")
            return []
    
    def save_comparison(self, user_id: int, player1_id: int, player2_id: int) -> bool:
        """Sauvegarde une comparaison dans l'historique"""
        try:
            query = """
                INSERT INTO comparisons (user_id, id_player_1, id_player_2)
                VALUES (%s, %s, %s)
            """
            
            success = db.execute_query(query, (user_id, player1_id, player2_id), fetch=False)
            
            if success:
                print(f"✅ Comparaison sauvegardée: joueur {player1_id} vs {player2_id}")
            
            return success
            
        except Exception as e:
            print(f"Erreur dans save_comparison: {e}")
            return False