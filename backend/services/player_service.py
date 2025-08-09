# backend/services/player_service.py
from config.database import db
from typing import List, Dict, Optional

class PlayerService:
    """Service pour la gestion des joueurs"""
    
    def filter_players(self, filters: Dict) -> List[Dict]:
        """Filtre les joueurs selon les critères - Version optimisée"""
        try:
            # Construction de la requête de base optimisée
            query = """
                SELECT 
                    p.player_id,
                    p.name as Player,
                    p.age as Age,
                    p.position as Pos,
                    p.squad as Squad,
                    COALESCE(s.name, '') as style,
                    p.market_value as MarketValue,
                    p.goals as Gls,
                    p.assists as Ast,
                    p.xG,
                    p.xAG,
                    p.tackles as Tkl,
                    p.progressive_passes as PrgP,
                    p.carries as Carries,
                    p.key_passes as KP,
                    COALESCE(p.image_url, '') as image_url
                FROM players p
                LEFT JOIN styles s ON p.id_style = s.id_style
                WHERE p.market_value > 0
            """
            
            params = []
            
            # Application des filtres optimisés
            if filters.get('style') and filters['style'] != "Sélectionner un style":
                query += " AND s.name = %s"
                params.append(filters['style'].lower())
            
            if filters.get('position') and filters['position'] != "":
                position = filters['position'].strip()
                if position in ['FW', 'MF', 'DF', 'GK']:
                    query += " AND p.position LIKE %s"
                    params.append(f"%{position}%")
                else:
                    query += " AND p.position LIKE %s"
                    params.append(f"%{position}%")
            
            if filters.get('squad') and filters['squad'] != "":
                query += " AND p.squad LIKE %s"
                params.append(f"%{filters['squad']}%")
            
            # Filtrage par nom de joueur
            if filters.get('player_name') and filters['player_name'] != "":
                query += " AND p.name LIKE %s"
                params.append(f"%{filters['player_name']}%")
            
            # Filtrage par âge (min et max)
            if filters.get('age_min'):
                try:
                    age_min = int(filters['age_min'])
                    query += " AND p.age >= %s"
                    params.append(age_min)
                except ValueError:
                    pass
            
            if filters.get('age_max'):
                try:
                    age_max = int(filters['age_max'])
                    query += " AND p.age <= %s"
                    params.append(age_max)
                except ValueError:
                    pass
            
            # Filtrage par budget maximum
            if filters.get('budget_max'):
                try:
                    budget = float(filters['budget_max'])
                    query += " AND p.market_value <= %s"
                    params.append(budget)
                except ValueError:
                    pass
            
            # Tri optimisé par valeur marchande avec index
            sort_direction = "DESC" if filters.get('sort_order', 'desc').lower() == 'desc' else "ASC"
            query += f" ORDER BY p.market_value {sort_direction}"
            
            # Limite de résultats
            limit = min(filters.get('limit', 50), 100)
            query += f" LIMIT {limit}"
            
            print(f"🔍 Requête SQL optimisée: {query}")
            print(f"📊 Paramètres: {params}")
            
            # Exécution de la requête
            results = db.execute_query(query, tuple(params))
            
            # Format de retour optimisé
            if results:
                formatted_results = []
                for player in results:
                    formatted_player = {
                        'player_id': int(player.get('player_id', 0)),
                        'Player': player.get('Player', ''),
                        'Age': int(player.get('Age', 0)),
                        'Pos': player.get('Pos', ''),
                        'Squad': player.get('Squad', ''),
                        'style': player.get('style', ''),
                        'MarketValue': float(player.get('MarketValue', 0)),
                        'Gls': int(player.get('Gls', 0)),
                        'Ast': int(player.get('Ast', 0)),
                        'xG': float(player.get('xG', 0)),
                        'xAG': float(player.get('xAG', 0)),
                        'Tkl': int(player.get('Tkl', 0)),
                        'PrgP': int(player.get('PrgP', 0)),
                        'Carries': int(player.get('Carries', 0)),
                        'KP': int(player.get('KP', 0)),
                        'image_url': player.get('image_url', '') or self._get_default_image_url(player.get('Player', ''), player.get('Squad', ''))
                    }
                    formatted_results.append(formatted_player)
                
                return formatted_results
            
            return []
            
        except Exception as e:
            print(f"❌ Erreur dans filter_players: {e}")
            return []
    
    def _get_default_image_url(self, player_name: str, squad: str = "") -> str:
        """Génère une URL d'image par défaut basée sur le nom du joueur"""
        return "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=400"
    
    def get_player_by_id(self, player_id: int) -> Optional[Dict]:
        """Récupère un joueur par son ID"""
        try:
            query = """
                SELECT 
                    p.*,
                    s.name as style_name
                FROM players p
                LEFT JOIN styles s ON p.id_style = s.id_style
                WHERE p.player_id = %s
            """
            
            results = db.execute_query(query, (player_id,))
            
            if results and len(results) > 0:
                player = results[0]
                return {
                    'player_id': player['player_id'],
                    'Player': player['name'],
                    'Age': player['age'],
                    'Pos': player['position'],
                    'Squad': player['squad'],
                    'style': player['style_name'] or '',
                    'MarketValue': float(player['market_value'] or 0),
                    'Gls': player['goals'],
                    'Ast': player['assists'],
                    'xG': float(player['xG'] or 0),
                    'xAG': float(player['xAG'] or 0),
                    'Tkl': player['tackles'],
                    'PrgP': player['progressive_passes'],
                    'Carries': player['carries'],
                    'KP': player['key_passes'],
                    'image_url': player['image_url'] or self._get_default_image_url(player['name'])
                }
            return None
            
        except Exception as e:
            print(f"Erreur dans get_player_by_id: {e}")
            return None
    
    def search_players_by_name(self, name_query: str, limit: int = 20) -> List[Dict]:
        """Recherche de joueurs par nom - Version optimisée"""
        try:
            if len(name_query) < 2:
                return []
            
            query = """
                SELECT 
                    p.player_id,
                    p.name,
                    p.age,
                    p.position,
                    p.squad,
                    p.market_value,
                    COALESCE(p.image_url, '') as image_url,
                    s.name as style
                FROM players p
                LEFT JOIN styles s ON p.id_style = s.id_style
                WHERE p.name LIKE %s
                ORDER BY p.market_value DESC
                LIMIT %s
            """
            
            search_term = f"%{name_query}%"
            results = db.execute_query(query, (search_term, limit))
            
            # Ajouter des URLs d'images par défaut
            if results:
                for player in results:
                    if not player.get('image_url'):
                        player['image_url'] = self._get_default_image_url(player.get('name', ''), player.get('squad', ''))
            
            return results if results else []
            
        except Exception as e:
            print(f"Erreur dans search_players_by_name: {e}")
            return []
    
    def get_player_id_by_name(self, player_name: str) -> Optional[int]:
        """Récupère l'ID d'un joueur par son nom"""
        try:
            query = "SELECT player_id FROM players WHERE name = %s LIMIT 1"
            results = db.execute_query(query, (player_name,))
            
            if results and len(results) > 0:
                return results[0]['player_id']
            return None
            
        except Exception as e:
            print(f"Erreur dans get_player_id_by_name: {e}")
            return None