# backend/services/favorite_service.py
from config.database import db
from typing import List, Dict, Optional

class FavoriteService:
    """Service pour la gestion des favoris"""
    
    def get_user_favorites(self, user_id: int) -> List[Dict]:
        """Récupère les favoris d'un utilisateur avec les détails des joueurs"""
        try:
            query = """
                SELECT 
                    f.id_favori,
                    f.note,
                    f.created_at,
                    p.player_id,
                    p.name as Player,
                    p.age as Age,
                    p.position as Pos,
                    p.squad as Squad,
                    s.name as style,
                    p.market_value as MarketValue,
                    p.goals as Gls,
                    p.assists as Ast,
                    p.xG,
                    p.xAG,
                    p.tackles as Tkl,
                    p.progressive_passes as PrgP,
                    p.carries as Carries,
                    p.key_passes as KP,
                    p.image_url
                FROM favorites f
                JOIN players p ON f.player_id = p.player_id
                LEFT JOIN styles s ON p.id_style = s.id_style
                WHERE f.user_id = %s
                ORDER BY f.created_at DESC
            """
            
            results = db.execute_query(query, (user_id,))
            
            if results:
                favorites = []
                for fav in results:
                    favorite = {
                        'id': str(fav['id_favori']),
                        'player': {
                            'player_id': fav['player_id'],
                            'Player': fav['Player'],
                            'Age': fav['Age'],
                            'Pos': fav['Pos'],
                            'Squad': fav['Squad'],
                            'style': fav['style'] or '',
                            'MarketValue': float(fav['MarketValue']) if fav['MarketValue'] else 0,
                            'Gls': fav['Gls'],
                            'Ast': fav['Ast'],
                            'xG': float(fav['xG']) if fav['xG'] else 0,
                            'xAG': float(fav['xAG']) if fav['xAG'] else 0,
                            'Tkl': fav['Tkl'],
                            'PrgP': fav['PrgP'],
                            'Carries': fav['Carries'],
                            'KP': fav['KP'],
                            'image_url': fav['image_url'] or "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=400"
                        },
                        'addedAt': fav['created_at'].isoformat() if fav['created_at'] else None,
                        'notes': fav['note']
                    }
                    favorites.append(favorite)
                
                return favorites
            
            return []
            
        except Exception as e:
            print(f"Erreur dans get_user_favorites: {e}")
            return []
    
    def add_favorite(self, user_id: int, player_id: int, note: str = "") -> bool:
        """Ajoute un joueur aux favoris"""
        try:
            # Vérifier si le joueur existe
            player_query = "SELECT player_id FROM players WHERE player_id = %s"
            player_result = db.execute_query(player_query, (player_id,))
            
            if not player_result:
                print(f"Joueur {player_id} non trouvé")
                return False
            
            # Ajouter aux favoris (ON DUPLICATE KEY pour éviter les doublons)
            query = """
                INSERT INTO favorites (user_id, player_id, note)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE 
                note = VALUES(note),
                created_at = CURRENT_TIMESTAMP
            """
            
            success = db.execute_query(query, (user_id, player_id, note), fetch=False)
            
            if success:
                print(f"✅ Joueur {player_id} ajouté aux favoris de l'utilisateur {user_id}")
            
            return success
            
        except Exception as e:
            print(f"Erreur dans add_favorite: {e}")
            return False
    
    def remove_favorite(self, user_id: int, player_id: int) -> bool:
        """Supprime un joueur des favoris"""
        try:
            query = """
                DELETE FROM favorites 
                WHERE user_id = %s AND player_id = %s
            """
            
            success = db.execute_query(query, (user_id, player_id), fetch=False)
            
            if success:
                print(f"✅ Joueur {player_id} supprimé des favoris de l'utilisateur {user_id}")
            
            return success
            
        except Exception as e:
            print(f"Erreur dans remove_favorite: {e}")
            return False
    
    def is_favorite(self, user_id: int, player_id: int) -> bool:
        """Vérifie si un joueur est dans les favoris d'un utilisateur"""
        try:
            query = """
                SELECT id_favori FROM favorites 
                WHERE user_id = %s AND player_id = %s
            """
            
            result = db.execute_query(query, (user_id, player_id))
            return len(result) > 0 if result else False
            
        except Exception as e:
            print(f"Erreur dans is_favorite: {e}")
            return False
    
    def update_favorite_note(self, user_id: int, player_id: int, note: str) -> bool:
        """Met à jour la note d'un favori"""
        try:
            query = """
                UPDATE favorites 
                SET note = %s 
                WHERE user_id = %s AND player_id = %s
            """
            
            success = db.execute_query(query, (note, user_id, player_id), fetch=False)
            
            if success:
                print(f"✅ Note mise à jour pour le joueur {player_id}")
            
            return success
            
        except Exception as e:
            print(f"Erreur dans update_favorite_note: {e}")
            return False