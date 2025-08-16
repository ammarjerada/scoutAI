from config.database import db
from typing import Dict, Optional
import json

def log_user_activity(user_id: int, action: str, details: Optional[Dict] = None):
    """Enregistre une activité utilisateur"""
    try:
        query = """
            INSERT INTO user_activities (user_id, action, details, ip_address, user_agent)
            VALUES (%s, %s, %s, %s, %s)
        """
        
        ip_address = details.get('ip') if details else None
        user_agent = details.get('user_agent') if details else None
        details_json = json.dumps(details) if details else None
        
        db.execute_query(
            query, 
            (user_id, action, details_json, ip_address, user_agent), 
            fetch=False
        )
        
    except Exception as e:
        print(f"Erreur lors du logging d'activité: {e}")

def get_user_activities(user_id: int, limit: int = 50) -> list:
    """Récupère les activités d'un utilisateur"""
    try:
        query = """
            SELECT action, details, ip_address, created_at
            FROM user_activities
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT %s
        """
        
        results = db.execute_query(query, (user_id, limit))
        return results if results else []
        
    except Exception as e:
        print(f"Erreur lors de la récupération des activités: {e}")
        return []