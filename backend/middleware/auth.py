from functools import wraps
from flask import session, jsonify, request
from typing import Optional, Callable

def require_auth(f: Callable) -> Callable:
    """Décorateur pour vérifier l'authentification"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session or not session.get('authenticated'):
            return jsonify({
                "error": "Authentification requise",
                "authenticated": False
            }), 401
        return f(*args, **kwargs)
    return decorated_function

def require_role(required_role: str) -> Callable:
    """Décorateur pour vérifier le rôle utilisateur"""
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Vérifier l'authentification d'abord
            if 'user_id' not in session or not session.get('authenticated'):
                return jsonify({
                    "error": "Authentification requise",
                    "authenticated": False
                }), 401
            
            # Vérifier le rôle
            user_role = session.get('role')
            
            # Admin a accès à tout
            if user_role == 'admin':
                return f(*args, **kwargs)
            
            # Vérifier le rôle spécifique
            if user_role != required_role:
                return jsonify({
                    "error": f"Rôle {required_role} requis",
                    "current_role": user_role
                }), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_admin(f: Callable) -> Callable:
    """Décorateur pour vérifier les permissions admin"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session or not session.get('authenticated'):
            return jsonify({
                "error": "Authentification requise",
                "authenticated": False
            }), 401
        
        if session.get('role') != 'admin':
            return jsonify({
                "error": "Permissions administrateur requises",
                "current_role": session.get('role')
            }), 403
        
        return f(*args, **kwargs)
    return decorated_function

def log_activity(action: str) -> Callable:
    """Décorateur pour logger les activités utilisateur"""
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Exécuter la fonction
            result = f(*args, **kwargs)
            
            # Logger l'activité si l'utilisateur est connecté
            if 'user_id' in session:
                try:
                    from services.activity_logger import log_user_activity
                    log_user_activity(
                        user_id=session['user_id'],
                        action=action,
                        details={
                            'endpoint': request.endpoint,
                            'method': request.method,
                            'ip': request.remote_addr,
                            'user_agent': request.headers.get('User-Agent', '')
                        }
                    )
                except Exception as e:
                    print(f"Erreur lors du logging: {e}")
            
            return result
        return decorated_function
    return decorator

def validate_json(required_fields: List[str]) -> Callable:
    """Décorateur pour valider les données JSON"""
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                return jsonify({
                    "error": "Content-Type application/json requis"
                }), 400
            
            data = request.get_json()
            if not data:
                return jsonify({
                    "error": "Données JSON requises"
                }), 400
            
            # Vérifier les champs requis
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({
                    "error": f"Champs manquants: {', '.join(missing_fields)}"
                }), 400
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator