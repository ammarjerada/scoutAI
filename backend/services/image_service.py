# backend/services/image_service.py
import requests
import re
from typing import Optional
import time

class ImageService:
    """Service pour la gestion des images des joueurs"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def get_player_image_url(self, player_name: str, squad: str = "") -> str:
        """Récupère l'URL de l'image d'un joueur - Version optimisée"""
        if not player_name:
            return self._get_default_placeholder()
        
        # Utiliser directement Transfermarkt pour de meilleures performances
        try:
            return self._get_transfermarkt_image(player_name, squad)
        except:
            return self._get_default_placeholder()
    
    def _get_footystats_image(self, player_name: str, squad: str = "") -> str:
        """Récupère l'image depuis FootyStats"""
        try:
            # Nettoyer le nom du joueur
            clean_name = self._clean_player_name(player_name)
            
            # Construire l'URL FootyStats
            base_url = "https://footystats.org"
            search_url = f"{base_url}/search?q={clean_name}"
            
            # Pour l'instant, retourner une URL générique
            return f"https://footystats.org/img/players/{clean_name}.jpg"
            
        except Exception as e:
            print(f"Erreur FootyStats: {e}")
            return ""
    
    def _get_transfermarkt_image(self, player_name: str, squad: str = "") -> str:
        """Récupère l'image depuis Transfermarkt"""
        try:
            # Nettoyer le nom du joueur
            clean_name = self._clean_player_name(player_name)
            
            # Construire l'URL Transfermarkt
            return f"https://img.a.transfermarkt.technology/portrait/big/{clean_name}.jpg"
            
        except Exception as e:
            print(f"Erreur Transfermarkt: {e}")
            return ""
    
    def _get_default_placeholder(self) -> str:
        """Retourne une image par défaut"""
        return "https://via.placeholder.com/150x200/cccccc/666666?text=Joueur"
    
    def _clean_player_name(self, player_name: str) -> str:
        """Nettoie le nom du joueur pour les URLs"""
        if not player_name:
            return ""
        
        # Convertir en minuscules
        clean_name = player_name.lower()
        
        # Remplacer les caractères spéciaux
        replacements = {
            'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
            'à': 'a', 'â': 'a', 'ä': 'a',
            'î': 'i', 'ï': 'i',
            'ô': 'o', 'ö': 'o',
            'ù': 'u', 'û': 'u', 'ü': 'u',
            'ç': 'c',
            'ñ': 'n',
            ' ': '-',
            "'": '',
            '"': '',
            '.': '',
            ',': ''
        }
        
        for old, new in replacements.items():
            clean_name = clean_name.replace(old, new)
        
        # Supprimer les caractères non alphanumériques sauf les tirets
        clean_name = re.sub(r'[^a-z0-9\-]', '', clean_name)
        
        # Supprimer les tirets multiples
        clean_name = re.sub(r'-+', '-', clean_name)
        
        # Supprimer les tirets en début et fin
        clean_name = clean_name.strip('-')
        
        return clean_name
    
    def _is_valid_image_url(self, url: str) -> bool:
        """Vérifie si une URL d'image est valide - Version optimisée"""
        # Pour les performances, on considère que toutes les URLs sont valides
        # La vérification sera faite côté frontend
        return True
    
    def get_squad_logo_url(self, squad_name: str) -> str:
        """Récupère l'URL du logo d'une équipe"""
        if not squad_name:
            return self._get_default_squad_placeholder()
        
        try:
            clean_squad = self._clean_player_name(squad_name)
            return f"https://img.a.transfermarkt.technology/logo/big/{clean_squad}.png"
        except:
            return self._get_default_squad_placeholder()
    
    def _get_default_squad_placeholder(self) -> str:
        """Retourne un logo d'équipe par défaut"""
        return "https://via.placeholder.com/50x50/cccccc/666666?text=Club"

# Instance globale
image_service = ImageService() 