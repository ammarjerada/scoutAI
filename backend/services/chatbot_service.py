import re
import json
from typing import Dict, List, Optional, Tuple
from config.database import db

class ChatbotService:
    """Service de chatbot intelligent pour ScoutAI"""
    
    def __init__(self):
        self.position_keywords = {
            'attaquant': ['FW', 'ST', 'CF'],
            'avant': ['FW', 'ST', 'CF'],
            'buteur': ['FW', 'ST', 'CF'],
            'ailier': ['FW', 'LW', 'RW'],
            'milieu': ['MF', 'CM', 'CDM', 'CAM'],
            'defenseur': ['DF', 'CB', 'LB', 'RB'],
            'gardien': ['GK'],
            'goal': ['GK']
        }
        
        self.style_keywords = {
            'rapide': 'jeu direct',
            'technique': 'jeu de possession',
            'physique': 'pressing intense',
            'créatif': 'jeu positionnel',
            'défensif': 'defensif',
            'total': 'football total',
            'possession': 'jeu de possession',
            'pressing': 'pressing intense'
        }
        
        self.stat_keywords = {
            'buteur': 'goals_min',
            'passeur': 'assists_min',
            'créateur': 'assists_min',
            'solide': 'tackles_min'
        }

    def parse_message(self, message: str) -> Dict:
        """Parse le message utilisateur et extrait les critères"""
        message_lower = message.lower()
        criteria = {}
        
        # Extraction de l'âge
        age_patterns = [
            r'moins de (\d+) ans?',
            r'plus de (\d+) ans?',
            r'entre (\d+) et (\d+) ans?',
            r'(\d+) ans? maximum',
            r'(\d+) ans? minimum',
            r'(\d+)-(\d+) ans?'
        ]
        
        for pattern in age_patterns:
            match = re.search(pattern, message_lower)
            if match:
                if 'moins de' in pattern:
                    criteria['maxAge'] = match.group(1)
                elif 'plus de' in pattern:
                    criteria['minAge'] = match.group(1)
                elif 'entre' in pattern or '-' in pattern:
                    criteria['minAge'] = match.group(1)
                    criteria['maxAge'] = match.group(2)
                elif 'maximum' in pattern:
                    criteria['maxAge'] = match.group(1)
                elif 'minimum' in pattern:
                    criteria['minAge'] = match.group(1)
                break
        
        # Extraction du budget
        budget_patterns = [
            r'budget de (\d+)m?€?',
            r'moins de (\d+)m?€?',
            r'maximum (\d+)m?€?'
        ]
        
        for pattern in budget_patterns:
            match = re.search(pattern, message_lower)
            if match:
                budget_value = int(match.group(1))
                if 'm' in match.group(0) or budget_value < 1000:
                    budget_value *= 1_000_000
                criteria['budget'] = str(budget_value)
                break
        
        # Extraction de la position
        for keyword, positions in self.position_keywords.items():
            if keyword in message_lower:
                criteria['position'] = positions[0]  # Prendre la première position
                break
        
        # Extraction du style
        for keyword, style in self.style_keywords.items():
            if keyword in message_lower:
                criteria['style'] = style
                break
        
        # Extraction des statistiques
        if 'buteur' in message_lower or 'buts' in message_lower:
            criteria['goals_min'] = '5'
        if 'passeur' in message_lower or 'assists' in message_lower:
            criteria['assists_min'] = '3'
        if 'défenseur' in message_lower or 'tacles' in message_lower:
            criteria['tackles_min'] = '30'
        
        # Extraction du nom de joueur
        player_name_patterns = [
            r'comme (\w+(?:\s+\w+)*)',
            r'style (\w+(?:\s+\w+)*)',
            r'joueur (\w+(?:\s+\w+)*)'
        ]
        
        for pattern in player_name_patterns:
            match = re.search(pattern, message_lower)
            if match:
                potential_name = match.group(1)
                if len(potential_name.split()) <= 3:  # Éviter les phrases trop longues
                    criteria['playerName'] = potential_name
                break
        
        # Tri par défaut
        criteria['sort_order'] = 'desc'
        
        return criteria

    def search_players(self, criteria: Dict) -> List[Dict]:
        """Recherche les joueurs selon les critères extraits"""
        try:
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
            
            # Application des filtres
            if criteria.get('style'):
                query += " AND s.name = %s"
                params.append(criteria['style'])
            
            if criteria.get('position'):
                query += " AND p.position LIKE %s"
                params.append(f"%{criteria['position']}%")
            
            if criteria.get('playerName'):
                query += " AND p.name LIKE %s"
                params.append(f"%{criteria['playerName']}%")
            
            if criteria.get('minAge'):
                query += " AND p.age >= %s"
                params.append(int(criteria['minAge']))
            
            if criteria.get('maxAge'):
                query += " AND p.age <= %s"
                params.append(int(criteria['maxAge']))
            
            if criteria.get('budget'):
                query += " AND p.market_value <= %s"
                params.append(float(criteria['budget']))
            
            # Filtres de statistiques
            if criteria.get('goals_min'):
                query += " AND p.goals >= %s"
                params.append(int(criteria['goals_min']))
            
            if criteria.get('assists_min'):
                query += " AND p.assists >= %s"
                params.append(int(criteria['assists_min']))
            
            if criteria.get('tackles_min'):
                query += " AND p.tackles >= %s"
                params.append(int(criteria['tackles_min']))
            
            # Tri et limite
            sort_direction = "DESC" if criteria.get('sort_order', 'desc') == 'desc' else "ASC"
            query += f" ORDER BY p.market_value {sort_direction} LIMIT 10"
            
            results = db.execute_query(query, tuple(params))
            
            if results:
                formatted_results = []
                for player in results:
                    formatted_player = {
                        'player_id': int(player['player_id']),
                        'Player': player['Player'],
                        'Age': int(player['Age']) if player['Age'] else 0,
                        'Pos': player['Pos'] or '',
                        'Squad': player['Squad'] or '',
                        'style': player['style'] or '',
                        'MarketValue': float(player['MarketValue']) if player['MarketValue'] else 0,
                        'Gls': int(player['Gls']) if player['Gls'] else 0,
                        'Ast': int(player['Ast']) if player['Ast'] else 0,
                        'xG': float(player['xG']) if player['xG'] else 0,
                        'xAG': float(player['xAG']) if player['xAG'] else 0,
                        'Tkl': int(player['Tkl']) if player['Tkl'] else 0,
                        'PrgP': int(player['PrgP']) if player['PrgP'] else 0,
                        'Carries': int(player['Carries']) if player['Carries'] else 0,
                        'KP': int(player['KP']) if player['KP'] else 0,
                        'image_url': player['image_url'] or "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=400"
                    }
                    formatted_results.append(formatted_player)
                
                return formatted_results
            
            return []
            
        except Exception as e:
            print(f"❌ Erreur dans search_players: {e}")
            return []

    def generate_response(self, message: str, players: List[Dict], criteria: Dict) -> str:
        """Génère une réponse naturelle du chatbot"""
        if not players:
            return self._generate_no_results_response(criteria)
        
        response_parts = []
        
        # Introduction personnalisée
        if criteria.get('position'):
            pos_name = self._get_position_name(criteria['position'])
            response_parts.append(f"J'ai trouvé {len(players)} {pos_name}(s)")
        else:
            response_parts.append(f"J'ai trouvé {len(players)} joueur(s)")
        
        # Ajouter les critères détectés
        criteria_parts = []
        if criteria.get('maxAge'):
            criteria_parts.append(f"moins de {criteria['maxAge']} ans")
        if criteria.get('minAge'):
            criteria_parts.append(f"plus de {criteria['minAge']} ans")
        if criteria.get('style'):
            criteria_parts.append(f"style {criteria['style']}")
        if criteria.get('budget'):
            budget_m = float(criteria['budget']) / 1_000_000
            criteria_parts.append(f"budget max {budget_m:.0f}M€")
        
        if criteria_parts:
            response_parts.append(f"correspondant à vos critères : {', '.join(criteria_parts)}")
        
        # Présenter les top 3
        top_players = players[:3]
        response_parts.append("\n\n🌟 **Mes recommandations principales :**")
        
        for i, player in enumerate(top_players, 1):
            value_m = player['MarketValue'] / 1_000_000
            response_parts.append(
                f"\n{i}. **{player['Player']}** ({player['Age']} ans, {player['Squad']})\n"
                f"   • Position: {player['Pos']}\n"
                f"   • Style: {player['style']}\n"
                f"   • Valeur: {value_m:.1f}M€\n"
                f"   • Stats: {player['Gls']} buts, {player['Ast']} assists"
            )
        
        if len(players) > 3:
            response_parts.append(f"\n💡 Et {len(players) - 3} autre(s) joueur(s) dans les résultats complets.")
        
        return " ".join(response_parts)

    def _generate_no_results_response(self, criteria: Dict) -> str:
        """Génère une réponse quand aucun joueur n'est trouvé"""
        suggestions = []
        
        if criteria.get('maxAge') and int(criteria['maxAge']) < 20:
            suggestions.append("Essayez d'augmenter l'âge maximum")
        
        if criteria.get('budget') and float(criteria['budget']) < 10_000_000:
            suggestions.append("Considérez un budget plus élevé")
        
        if criteria.get('goals_min') and int(criteria['goals_min']) > 10:
            suggestions.append("Réduisez le nombre minimum de buts")
        
        response = "🤔 Aucun joueur ne correspond exactement à vos critères."
        
        if suggestions:
            response += f"\n\n💡 **Suggestions :**\n• " + "\n• ".join(suggestions)
        
        response += "\n\n🔄 Essayez de reformuler votre demande ou d'ajuster vos critères."
        
        return response

    def _get_position_name(self, position: str) -> str:
        """Convertit le code position en nom lisible"""
        position_names = {
            'FW': 'attaquant',
            'ST': 'attaquant',
            'CF': 'attaquant',
            'LW': 'ailier gauche',
            'RW': 'ailier droit',
            'MF': 'milieu de terrain',
            'CM': 'milieu central',
            'CDM': 'milieu défensif',
            'CAM': 'milieu offensif',
            'DF': 'défenseur',
            'CB': 'défenseur central',
            'LB': 'défenseur gauche',
            'RB': 'défenseur droit',
            'GK': 'gardien'
        }
        return position_names.get(position, 'joueur')

    def get_conversation_starters(self) -> List[str]:
        """Retourne des exemples de questions pour guider l'utilisateur"""
        return [
            "Je cherche un attaquant rapide de moins de 25 ans",
            "Trouvez-moi un milieu créatif avec de bonnes passes",
            "Quel défenseur solide pour moins de 20 millions d'euros ?",
            "Montrez-moi les meilleurs jeunes talents",
            "Je veux un joueur comme Mbappé",
            "Cherchez un gardien expérimenté"
        ]

    def analyze_intent(self, message: str) -> str:
        """Analyse l'intention du message"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['cherche', 'trouve', 'veux', 'besoin']):
            return 'search'
        elif any(word in message_lower for word in ['compare', 'différence', 'versus']):
            return 'compare'
        elif any(word in message_lower for word in ['aide', 'comment', 'expliquer']):
            return 'help'
        else:
            return 'search'  # Par défaut

# Instance globale
chatbot_service = ChatbotService()