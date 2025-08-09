# backend/services/auth_service.py
import bcrypt
from config.database import db
from typing import Optional, Dict

class AuthService:
    """Service pour l'authentification"""
    
    def user_exists(self, email: str) -> bool:
        """Vérifie si un utilisateur existe déjà"""
        try:
            query = "SELECT user_id FROM users WHERE email = %s"
            result = db.execute_query(query, (email,))
            return len(result) > 0 if result else False
        except Exception as e:
            print(f"Erreur dans user_exists: {e}")
            return False
    
    def create_user(self, email: str, password: str, first_name: str, last_name: str, role: str) -> Optional[int]:
        """Crée un nouvel utilisateur"""
        try:
            print(f"🔍 Création d'utilisateur: {email}")
            
            # Hasher le mot de passe
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            print(f"🔐 Mot de passe hashé: {password_hash[:20]}...")
            
            query = """
                INSERT INTO users (email, first_name, last_name, role, password_hash)
                VALUES (%s, %s, %s, %s, %s)
            """
            
            print(f"📝 Exécution de la requête: {query}")
            print(f"📊 Paramètres: {email}, {first_name}, {last_name}, {role}")
            
            success = db.execute_query(query, (email, first_name, last_name, role, password_hash), fetch=False)
            print(f"✅ Résultat de l'insertion: {success}")
            
            if success:
                # Récupérer l'ID de l'utilisateur créé
                result = db.execute_query("SELECT LAST_INSERT_ID() as user_id")
                print(f"🔍 Résultat LAST_INSERT_ID: {result}")
                
                if result and len(result) > 0:
                    user_id = result[0]['user_id']
                    print(f"✅ Utilisateur créé avec ID: {user_id}")
                    return user_id
                else:
                    print("❌ Impossible de récupérer l'ID de l'utilisateur")
            else:
                print("❌ Échec de l'insertion")
            
            return None
            
        except Exception as e:
            print(f"❌ Erreur dans create_user: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def authenticate_user(self, email: str, password: str) -> Optional[Dict]:
        """Authentifie un utilisateur"""
        try:
            query = """
                SELECT user_id, email, first_name, last_name, role, password_hash
                FROM users 
                WHERE email = %s
            """
            
            result = db.execute_query(query, (email,))
            
            if result and len(result) > 0:
                user = result[0]
                
                # Vérifier le mot de passe
                if bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                    # Retourner les infos utilisateur (sans le hash du mot de passe)
                    return {
                        'id': str(user['user_id']),  # Convertir en string pour compatibilité frontend
                        'user_id': user['user_id'],  # Garder pour compatibilité backend
                        'email': user['email'],
                        'firstName': user['first_name'],
                        'lastName': user['last_name'],
                        'role': user['role'],
                        'createdAt': None,  # Sera rempli par get_user_by_id
                        'preferences': {
                            'theme': 'light',
                            'favoriteLeagues': [],
                            'notifications': True
                        }
                    }
            
            return None
            
        except Exception as e:
            print(f"Erreur dans authenticate_user: {e}")
            return None
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """Récupère un utilisateur par son ID"""
        try:
            query = """
                SELECT user_id, email, first_name, last_name, role, created_at
                FROM users 
                WHERE user_id = %s
            """
            
            result = db.execute_query(query, (user_id,))
            
            if result and len(result) > 0:
                user = result[0]
                return {
                    'id': str(user['user_id']),  # Convertir en string pour compatibilité frontend
                    'user_id': user['user_id'],  # Garder pour compatibilité backend
                    'email': user['email'],
                    'firstName': user['first_name'],
                    'lastName': user['last_name'],
                    'role': user['role'],
                    'createdAt': user['created_at'].isoformat() if user['created_at'] else None,
                    'preferences': {
                        'theme': 'light',
                        'favoriteLeagues': [],
                        'notifications': True
                    }
                }
            
            return None
            
        except Exception as e:
            print(f"Erreur dans get_user_by_id: {e}")
            return None


