from flask import Blueprint, request, jsonify, session
from middleware.auth import require_auth, log_activity
from services.auth_service import AuthService
from utils.validators import Validators, ValidationError
from utils.response_formatter import ResponseFormatter
import traceback

auth_bp = Blueprint('auth', __name__)
auth_service = AuthService()

@auth_bp.route('/register', methods=['POST'])
@log_activity('user_register')
def register():
    """Inscription d'un nouvel utilisateur"""
    try:
        data = request.get_json()
        
        # Validation des données
        validation_errors = Validators.validate_user_data(data)
        if validation_errors:
            return jsonify(ResponseFormatter.error(
                "Données invalides",
                "VALIDATION_ERROR",
                validation_errors
            )), 400
        
        # Vérifier si l'utilisateur existe
        if auth_service.user_exists(data['email']):
            return jsonify(ResponseFormatter.error(
                "Cet email est déjà utilisé",
                "EMAIL_EXISTS"
            )), 409
        
        # Créer l'utilisateur
        user_id = auth_service.create_user(
            email=data['email'],
            password=data['password'],
            first_name=data['firstName'],
            last_name=data['lastName'],
            role=data['role']
        )
        
        if not user_id:
            return jsonify(ResponseFormatter.error(
                "Erreur lors de la création du compte",
                "CREATION_FAILED"
            )), 500
        
        # Récupérer les données utilisateur
        user_data = auth_service.get_user_by_id(user_id)
        if not user_data:
            return jsonify(ResponseFormatter.error(
                "Erreur lors de la récupération des données",
                "USER_NOT_FOUND"
            )), 500
        
        # Créer la session
        session.permanent = True
        session['user_id'] = user_data['user_id']
        session['email'] = user_data['email']
        session['role'] = user_data['role']
        session['authenticated'] = True
        
        return jsonify(ResponseFormatter.success(
            data={
                "user": user_data,
                "authenticated": True
            },
            message="Inscription réussie"
        )), 201
        
    except ValidationError as e:
        return jsonify(ResponseFormatter.error(str(e), "VALIDATION_ERROR")), 400
    except Exception as e:
        print(f"❌ Erreur register: {e}")
        traceback.print_exc()
        return jsonify(ResponseFormatter.error(
            "Erreur interne du serveur",
            "INTERNAL_ERROR"
        )), 500

@auth_bp.route('/login', methods=['POST'])
@log_activity('user_login')
def login():
    """Connexion d'un utilisateur"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify(ResponseFormatter.error(
                "Email et mot de passe requis",
                "MISSING_CREDENTIALS"
            )), 400
        
        # Authentifier l'utilisateur
        user_data = auth_service.authenticate_user(data['email'], data['password'])
        
        if not user_data:
            return jsonify(ResponseFormatter.error(
                "Email ou mot de passe incorrect",
                "INVALID_CREDENTIALS"
            )), 401
        
        # Créer la session
        session.permanent = True
        session['user_id'] = user_data['user_id']
        session['email'] = user_data['email']
        session['role'] = user_data['role']
        session['authenticated'] = True
        
        return jsonify(ResponseFormatter.success(
            data={
                "user": user_data,
                "authenticated": True
            },
            message="Connexion réussie"
        )), 200
        
    except Exception as e:
        print(f"❌ Erreur login: {e}")
        traceback.print_exc()
        return jsonify(ResponseFormatter.error(
            "Erreur interne du serveur",
            "INTERNAL_ERROR"
        )), 500

@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_current_user():
    """Récupère les informations de l'utilisateur connecté"""
    try:
        user_id = session['user_id']
        user_data = auth_service.get_user_by_id(user_id)
        
        if not user_data:
            session.clear()
            return jsonify(ResponseFormatter.error(
                "Session invalide",
                "INVALID_SESSION"
            )), 401
        
        return jsonify(ResponseFormatter.success(
            data={
                "user": user_data,
                "authenticated": True
            }
        )), 200
        
    except Exception as e:
        print(f"❌ Erreur get_current_user: {e}")
        session.clear()
        return jsonify(ResponseFormatter.error(
            "Session invalide",
            "INVALID_SESSION"
        )), 401

@auth_bp.route('/logout', methods=['POST'])
@require_auth
@log_activity('user_logout')
def logout():
    """Déconnexion de l'utilisateur"""
    try:
        user_email = session.get('email', 'Utilisateur inconnu')
        session.clear()
        
        return jsonify(ResponseFormatter.success(
            data={"authenticated": False},
            message="Déconnexion réussie"
        )), 200
        
    except Exception as e:
        print(f"❌ Erreur logout: {e}")
        return jsonify(ResponseFormatter.error(
            "Erreur lors de la déconnexion",
            "LOGOUT_ERROR"
        )), 500

@auth_bp.route('/profile', methods=['PUT'])
@require_auth
@log_activity('profile_update')
def update_profile():
    """Met à jour le profil utilisateur"""
    try:
        user_id = session['user_id']
        data = request.get_json()
        
        # Valider les données (optionnel pour la mise à jour)
        if data.get('email') and not Validators.validate_email(data['email']):
            return jsonify(ResponseFormatter.error(
                "Format d'email invalide",
                "INVALID_EMAIL"
            )), 400
        
        # Mettre à jour le profil
        updated_user = auth_service.update_user_profile(user_id, data)
        
        if not updated_user:
            return jsonify(ResponseFormatter.error(
                "Erreur lors de la mise à jour",
                "UPDATE_FAILED"
            )), 500
        
        return jsonify(ResponseFormatter.success(
            data={"user": updated_user},
            message="Profil mis à jour"
        )), 200
        
    except Exception as e:
        print(f"❌ Erreur update_profile: {e}")
        return jsonify(ResponseFormatter.error(
            "Erreur interne du serveur",
            "INTERNAL_ERROR"
        )), 500