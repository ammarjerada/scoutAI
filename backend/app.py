from flask import Flask, request, jsonify, session
from flask_cors import CORS
import bcrypt
import os
import mysql.connector
from mysql.connector import Error
from datetime import datetime, timedelta
import traceback
import base64
from routes.analytics import analytics_bp
from services.cache_service import cache

# Configuration de la base de données
DB_CONFIG = {
    'host': 'localhost',
    'database': 'scoutai',
    'user': 'root',
    'password': '',
    'port': 3307,
    'charset': 'utf8mb4',
    'autocommit': True,
    'pool_name': 'scoutai_pool',
    'pool_size': 10,
    'pool_reset_session': True
}

# Création de l'application Flask
app = Flask(__name__)

# Configuration CORS avec credentials
CORS(app, 
     supports_credentials=True, 
     origins=['http://localhost:5173'],
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Configuration des sessions sécurisées
app.config['SECRET_KEY'] = 'scoutai-super-secret-key-2025-enhanced'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)

# Enregistrer les blueprints
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

# Route pour vider le cache (admin seulement)
@app.route("/api/cache/clear", methods=["POST"])
def clear_cache():
    """Vide le cache (admin seulement)"""
    admin_error = require_admin()
    if admin_error:
        return admin_error
    
    try:
        cache.clear()
        return jsonify({"message": "Cache vidé avec succès"}), 200
    except Exception as e:
        print(f"❌ Erreur clear_cache: {e}")
        return jsonify({"error": "Erreur lors du vidage du cache"}), 500

# Fonction de connexion à la base de données
def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"❌ Erreur de connexion MySQL: {e}")
        return None

# Middleware pour vérifier l'authentification
def require_auth():
    if 'user_id' not in session or not session.get('authenticated'):
        return jsonify({"error": "Authentification requise", "authenticated": False}), 401
    return None

# Middleware pour vérifier les permissions admin
def require_admin():
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    if session.get('role') != 'admin':
        return jsonify({"error": "Permissions administrateur requises"}), 403
    return None

# ===== ROUTES D'AUTHENTIFICATION =====

@app.route("/api/auth/register", methods=["POST"])
def register():
    """Inscription d'un nouvel utilisateur"""
    try:
        data = request.json
        print(f"🔍 Inscription - Données reçues: {data}")
        
        required_fields = ['email', 'password', 'firstName', 'lastName', 'role']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Le champ {field} est requis"}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Erreur de connexion à la base de données"}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Vérifier si l'utilisateur existe déjà
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (data['email'],))
        if cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({"error": "Cet email est déjà utilisé"}), 409
        
        # Hasher le mot de passe
        password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Créer l'utilisateur
        insert_query = """
            INSERT INTO users (email, first_name, last_name, role, password_hash)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (
            data['email'],
            data['firstName'],
            data['lastName'],
            data['role'],
            password_hash
        ))
        
        user_id = cursor.lastrowid
        
        # Récupérer les informations de l'utilisateur créé
        cursor.execute("""
            SELECT user_id, email, first_name, last_name, role, created_at, avatar_url
            FROM users WHERE user_id = %s
        """, (user_id,))
        
        user_data = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if user_data:
            # Créer la session permanente
            session.permanent = True
            session['user_id'] = user_data['user_id']
            session['email'] = user_data['email']
            session['role'] = user_data['role']
            session['authenticated'] = True
            
            user_info = {
                'id': str(user_data['user_id']),
                'user_id': user_data['user_id'],
                'email': user_data['email'],
                'firstName': user_data['first_name'],
                'lastName': user_data['last_name'],
                'role': user_data['role'],
                'avatar': user_data.get('avatar_url'),
                'createdAt': user_data['created_at'].isoformat() if user_data['created_at'] else None,
                'permissions': get_role_permissions(user_data['role']),
                'preferences': {
                    'theme': 'dark',
                    'favoriteLeagues': [],
                    'notifications': True
                }
            }
            
            print(f"✅ Utilisateur créé et session établie: {user_info['email']}")
            return jsonify({
                "message": "Inscription réussie",
                "user": user_info,
                "authenticated": True
            }), 201
        else:
            return jsonify({"error": "Erreur lors de la création du compte"}), 500
            
    except Exception as e:
        print(f"❌ Erreur lors de l'inscription: {e}")
        traceback.print_exc()
        return jsonify({"error": "Erreur interne du serveur"}), 500

@app.route("/api/auth/login", methods=["POST"])
def login():
    """Connexion d'un utilisateur"""
    try:
        data = request.json
        print(f"🔍 Tentative de connexion pour: {data.get('email')}")
        
        if not data.get('email') or not data.get('password'):
            return jsonify({"error": "Email et mot de passe requis"}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Erreur de connexion à la base de données"}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Récupérer l'utilisateur
        cursor.execute("""
            SELECT user_id, email, first_name, last_name, role, password_hash, created_at, avatar_url
            FROM users WHERE email = %s
        """, (data['email'],))
        
        user_data = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if user_data and bcrypt.checkpw(data['password'].encode('utf-8'), user_data['password_hash'].encode('utf-8')):
            # Créer la session permanente
            session.permanent = True
            session['user_id'] = user_data['user_id']
            session['email'] = user_data['email']
            session['role'] = user_data['role']
            session['authenticated'] = True
            
            user_info = {
                'id': str(user_data['user_id']),
                'user_id': user_data['user_id'],
                'email': user_data['email'],
                'firstName': user_data['first_name'],
                'lastName': user_data['last_name'],
                'role': user_data['role'],
                'avatar': user_data.get('avatar_url'),
                'createdAt': user_data['created_at'].isoformat() if user_data['created_at'] else None,
                'permissions': get_role_permissions(user_data['role']),
                'preferences': {
                    'theme': 'dark',
                    'favoriteLeagues': [],
                    'notifications': True
                }
            }
            
            print(f"✅ Connexion réussie et session établie: {user_info['email']}")
            return jsonify({
                "message": "Connexion réussie",
                "user": user_info,
                "authenticated": True
            }), 200
        else:
            return jsonify({"error": "Email ou mot de passe incorrect"}), 401
            
    except Exception as e:
        print(f"❌ Erreur lors de la connexion: {e}")
        traceback.print_exc()
        return jsonify({"error": "Erreur interne du serveur"}), 500

@app.route("/api/auth/me", methods=["GET"])
def get_current_user():
    """Récupère les informations de l'utilisateur connecté"""
    try:
        print(f"🔍 Vérification session - user_id: {session.get('user_id')}")
        
        if 'user_id' not in session or not session.get('authenticated'):
            return jsonify({"error": "Non connecté", "authenticated": False}), 401
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Erreur de connexion à la base de données"}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT user_id, email, first_name, last_name, role, created_at, avatar_url
            FROM users WHERE user_id = %s
        """, (session['user_id'],))
        
        user_data = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if user_data:
            user_info = {
                'id': str(user_data['user_id']),
                'user_id': user_data['user_id'],
                'email': user_data['email'],
                'firstName': user_data['first_name'],
                'lastName': user_data['last_name'],
                'role': user_data['role'],
                'avatar': user_data.get('avatar_url'),
                'createdAt': user_data['created_at'].isoformat() if user_data['created_at'] else None,
                'permissions': get_role_permissions(user_data['role']),
                'preferences': {
                    'theme': 'dark',
                    'favoriteLeagues': [],
                    'notifications': True
                }
            }
            print(f"✅ Session valide pour: {user_info['email']}")
            return jsonify({"user": user_info, "authenticated": True}), 200
        else:
            session.clear()
            return jsonify({"error": "Session invalide", "authenticated": False}), 401
            
    except Exception as e:
        print(f"❌ Erreur get_current_user: {e}")
        session.clear()
        return jsonify({"error": "Session invalide", "authenticated": False}), 401

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    """Déconnexion de l'utilisateur"""
    try:
        user_email = session.get('email', 'Utilisateur inconnu')
        session.clear()
        print(f"✅ Déconnexion réussie pour: {user_email}")
        return jsonify({"message": "Déconnexion réussie", "authenticated": False}), 200
    except Exception as e:
        print(f"❌ Erreur lors de la déconnexion: {e}")
        return jsonify({"error": "Erreur lors de la déconnexion"}), 500

# ===== GESTION DU PROFIL UTILISATEUR =====

@app.route("/api/profile", methods=["PUT"])
def update_profile():
    """Met à jour le profil utilisateur"""
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        user_id = session['user_id']
        data = request.json
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Erreur de connexion à la base de données"}), 500
        
        cursor = connection.cursor()
        
        # Construire la requête de mise à jour dynamiquement
        update_fields = []
        params = []
        
        if 'firstName' in data:
            update_fields.append("first_name = %s")
            params.append(data['firstName'])
        
        if 'lastName' in data:
            update_fields.append("last_name = %s")
            params.append(data['lastName'])
        
        if 'avatar' in data:
            update_fields.append("avatar_url = %s")
            params.append(data['avatar'])
        
        if update_fields:
            params.append(user_id)
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE user_id = %s"
            cursor.execute(query, params)
        
        cursor.close()
        connection.close()
        
        # Retourner les nouvelles informations utilisateur
        return get_current_user()
        
    except Exception as e:
        print(f"❌ Erreur update_profile: {e}")
        return jsonify({"error": "Erreur lors de la mise à jour"}), 500

@app.route("/api/profile/avatar", methods=["POST"])
def upload_avatar():
    """Upload d'avatar utilisateur"""
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        data = request.json
        avatar_data = data.get('avatar')
        
        if not avatar_data:
            return jsonify({"error": "Données d'avatar requises"}), 400
        
        user_id = session['user_id']
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Erreur de connexion à la base de données"}), 500
        
        cursor = connection.cursor()
        cursor.execute("UPDATE users SET avatar_url = %s WHERE user_id = %s", (avatar_data, user_id))
        cursor.close()
        connection.close()
        
        return jsonify({"message": "Avatar mis à jour", "avatar_url": avatar_data}), 200
        
    except Exception as e:
        print(f"❌ Erreur upload_avatar: {e}")
        return jsonify({"error": "Erreur lors de l'upload"}), 500

# ===== GESTION DES ÉQUIPES (DRAFT MODE) =====

@app.route("/api/teams", methods=["GET"])
def get_user_teams():
    """Récupère les équipes de l'utilisateur"""
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        user_id = session['user_id']
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Erreur de connexion à la base de données"}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT t.*, 
                   (SELECT COUNT(*) FROM team_players tp WHERE tp.team_id = t.team_id) as player_count
            FROM teams t 
            WHERE t.user_id = %s 
            ORDER BY t.created_at DESC
        """, (user_id,))
        
        teams = cursor.fetchall()
        cursor.close()
        connection.close()
        
        return jsonify(teams), 200
        
    except Exception as e:
        print(f"❌ Erreur get_user_teams: {e}")
        return jsonify({"error": "Erreur lors de la récupération des équipes"}), 500

@app.route("/api/teams", methods=["POST"])
def create_team():
    """Crée une nouvelle équipe"""
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        user_id = session['user_id']
        data = request.json
        
        team_name = data.get('name', 'Mon Équipe')
        formation = data.get('formation', '4-3-3')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Erreur de connexion à la base de données"}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO teams (user_id, name, formation)
            VALUES (%s, %s, %s)
        """, (user_id, team_name, formation))
        
        team_id = cursor.lastrowid
        cursor.close()
        connection.close()
        
        return jsonify({"team_id": team_id, "message": "Équipe créée"}), 201
        
    except Exception as e:
        print(f"❌ Erreur create_team: {e}")
        return jsonify({"error": "Erreur lors de la création de l'équipe"}), 500

@app.route("/api/teams/<int:team_id>/players", methods=["POST"])
def add_player_to_team():
    """Ajoute un joueur à une équipe"""
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        user_id = session['user_id']
        data = request.json
        player_id = data.get('player_id')
        position = data.get('position', 'SUB')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Erreur de connexion à la base de données"}), 500
        
        cursor = connection.cursor()
        
        # Vérifier que l'équipe appartient à l'utilisateur
        cursor.execute("SELECT team_id FROM teams WHERE team_id = %s AND user_id = %s", (team_id, user_id))
        if not cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({"error": "Équipe non trouvée"}), 404
        
        # Ajouter le joueur
        cursor.execute("""
            INSERT INTO team_players (team_id, player_id, position)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE position = VALUES(position)
        """, (team_id, player_id, position))
        
        cursor.close()
        connection.close()
        
        return jsonify({"message": "Joueur ajouté à l'équipe"}), 201
        
    except Exception as e:
        print(f"❌ Erreur add_player_to_team: {e}")
        return jsonify({"error": "Erreur lors de l'ajout du joueur"}), 500

@app.route("/api/teams/<int:team_id>/players/<int:player_id>", methods=["DELETE"])
def remove_player_from_team(team_id, player_id):
    """Supprime un joueur d'une équipe"""
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        user_id = session['user_id']
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Erreur de connexion à la base de données"}), 500
        
        cursor = connection.cursor()
        
        # Vérifier que l'équipe appartient à l'utilisateur
        cursor.execute("SELECT team_id FROM teams WHERE team_id = %s AND user_id = %s", (team_id, user_id))
        if not cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({"error": "Équipe non trouvée"}), 404
        
        # Supprimer le joueur
        cursor.execute("DELETE FROM team_players WHERE team_id = %s AND player_id = %s", (team_id, player_id))
        
        cursor.close()
        connection.close()
        
        return jsonify({"message": "Joueur retiré de l'équipe"}), 200
        
    except Exception as e:
        print(f"❌ Erreur remove_player_from_team: {e}")
        return jsonify({"error": "Erreur lors de la suppression"}), 500

# ===== ROUTES DES JOUEURS =====

@app.route("/api/filter_players", methods=["POST"])
@cache.cached(ttl=180)  # Cache pendant 3 minutes
def filter_players():
    """Filtre les joueurs selon les critères"""
    try:
        data = request.json
        print(f"📝 Requête de filtrage reçue: {data}")
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Erreur de connexion à la base de données"}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Construction de la requête
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
            WHERE 1=1
        """
        
        params = []
        
        # Application des filtres
        if data.get('style') and data['style'] != "":
            query += " AND s.name = %s"
            params.append(data['style'].lower())
        
        if data.get('position') and data['position'] != "":
            query += " AND p.position LIKE %s"
            params.append(f"%{data['position']}%")
        
        if data.get('Squad') and data['Squad'] != "":
            query += " AND p.squad LIKE %s"
            params.append(f"%{data['Squad']}%")
        
        if data.get('playerName') and data['playerName'] != "":
            query += " AND p.name LIKE %s"
            params.append(f"%{data['playerName']}%")
        
        if data.get('minAge'):
            try:
                age_min = int(data['minAge'])
                query += " AND p.age >= %s"
                params.append(age_min)
            except ValueError:
                pass
        
        if data.get('maxAge'):
            try:
                age_max = int(data['maxAge'])
                query += " AND p.age <= %s"
                params.append(age_max)
            except ValueError:
                pass
        
        if data.get('budget'):
            try:
                budget = float(data['budget'])
                query += " AND p.market_value <= %s"
                params.append(budget)
            except ValueError:
                pass
        
        # Filtres avancés
        if data.get('league'):
            query += " AND p.squad LIKE %s"
            params.append(f"%{data['league']}%")
        
        if data.get('nationality'):
            query += " AND p.nation LIKE %s"
            params.append(f"%{data['nationality']}%")
        
        # Filtres de statistiques
        stat_filters = [
            ('goals_min', 'goals_max', 'p.goals'),
            ('assists_min', 'assists_max', 'p.assists'),
            ('xg_min', 'xg_max', 'p.xG'),
            ('tackles_min', 'tackles_max', 'p.tackles')
        ]
        
        for min_key, max_key, column in stat_filters:
            if data.get(min_key):
                try:
                    min_val = float(data[min_key])
                    query += f" AND {column} >= %s"
                    params.append(min_val)
                except ValueError:
                    pass
            
            if data.get(max_key):
                try:
                    max_val = float(data[max_key])
                    query += f" AND {column} <= %s"
                    params.append(max_val)
                except ValueError:
                    pass
        
        # Tri et limite
        sort_direction = "DESC" if data.get('sort_order', 'desc').lower() == 'desc' else "ASC"
        query += f" ORDER BY p.market_value {sort_direction} LIMIT 100"
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        cursor.close()
        connection.close()
        
        # Formatage des résultats
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
        
        print(f"✅ {len(formatted_results)} joueurs trouvés")
        return jsonify(formatted_results), 200
        
    except Exception as e:
        print(f"❌ Erreur lors du filtrage: {e}")
        traceback.print_exc()
        return jsonify({"error": "Erreur lors du filtrage des joueurs"}), 500

# ===== ROUTES DES FAVORIS (PROTÉGÉES) =====

@app.route("/api/favorites", methods=["GET"])
def get_favorites():
    """Récupère les favoris de l'utilisateur"""
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        user_id = session['user_id']
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Erreur de connexion à la base de données"}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
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
        """, (user_id,))
        
        results = cursor.fetchall()
        cursor.close()
        connection.close()
        
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
        
        return jsonify(favorites), 200
        
    except Exception as e:
        print(f"❌ Erreur get_favorites: {e}")
        return jsonify({"error": "Erreur lors de la récupération des favoris"}), 500

@app.route("/api/favorites", methods=["POST"])
def add_favorite():
    """Ajoute un joueur aux favoris"""
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        user_id = session['user_id']
        data = request.json
        player_id = data.get('player_id')
        note = data.get('note', '')
        
        if not player_id:
            return jsonify({"error": "ID du joueur requis"}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Erreur de connexion à la base de données"}), 500
        
        cursor = connection.cursor()
        
        # Vérifier si le joueur existe
        cursor.execute("SELECT player_id FROM players WHERE player_id = %s", (player_id,))
        if not cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({"error": "Joueur non trouvé"}), 404
        
        # Ajouter aux favoris
        cursor.execute("""
            INSERT INTO favorites (user_id, player_id, note)
            VALUES (%s, %s, %s)
        """, (user_id, player_id, note))
        
        cursor.close()
        connection.close()
        
        return jsonify({"message": "Joueur ajouté aux favoris", "success": True}), 201
        
    except mysql.connector.IntegrityError:
        return jsonify({"error": "Ce joueur est déjà dans vos favoris"}), 409
    except Exception as e:
        print(f"❌ Erreur add_favorite: {e}")
        return jsonify({"error": "Erreur interne du serveur"}), 500

@app.route("/api/favorites/<int:player_id>", methods=["DELETE"])
def remove_favorite(player_id):
    """Supprime un joueur des favoris"""
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        user_id = session['user_id']
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Erreur de connexion à la base de données"}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            DELETE FROM favorites 
            WHERE user_id = %s AND player_id = %s
        """, (user_id, player_id))
        
        affected_rows = cursor.rowcount
        cursor.close()
        connection.close()
        
        if affected_rows > 0:
            return jsonify({"message": "Joueur supprimé des favoris", "success": True}), 200
        else:
            return jsonify({"message": "Favori non trouvé", "success": False}), 404
        
    except Exception as e:
        print(f"❌ Erreur remove_favorite: {e}")
        return jsonify({"error": "Erreur interne du serveur"}), 500

@app.route("/api/favorites/check/<int:player_id>", methods=["GET"])
def check_favorite(player_id):
    """Vérifie si un joueur est en favoris"""
    if 'user_id' not in session or not session.get('authenticated'):
        return jsonify({"is_favorite": False}), 200
    
    try:
        user_id = session['user_id']
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"is_favorite": False}), 200
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id_favori FROM favorites 
            WHERE user_id = %s AND player_id = %s
        """, (user_id, player_id))
        
        is_favorite = cursor.fetchone() is not None
        cursor.close()
        connection.close()
        
        return jsonify({"is_favorite": is_favorite}), 200
        
    except Exception as e:
        print(f"❌ Erreur check_favorite: {e}")
        return jsonify({"is_favorite": False}), 200

# ===== ROUTES DES COMPARAISONS (PROTÉGÉES) =====

@app.route("/api/comparisons", methods=["GET"])
def get_comparisons():
    """Récupère l'historique des comparaisons de l'utilisateur"""
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        user_id = session['user_id']
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Erreur de connexion à la base de données"}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
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
            LIMIT 50
        """, (user_id,))
        
        results = cursor.fetchall()
        cursor.close()
        connection.close()
        
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
        
        return jsonify(comparisons), 200
        
    except Exception as e:
        print(f"❌ Erreur get_comparisons: {e}")
        return jsonify({"error": "Erreur lors de la récupération des comparaisons"}), 500

@app.route("/api/comparisons", methods=["POST"])
def save_comparison():
    """Sauvegarde une comparaison"""
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        user_id = session['user_id']
        data = request.json
        player1_id = data.get('player1_id')
        player2_id = data.get('player2_id')
        
        if not player1_id or not player2_id:
            return jsonify({"error": "IDs des joueurs requis"}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Erreur de connexion à la base de données"}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO comparisons (user_id, id_player_1, id_player_2)
            VALUES (%s, %s, %s)
        """, (user_id, player1_id, player2_id))
        
        cursor.close()
        connection.close()
        
        return jsonify({"message": "Comparaison sauvegardée", "success": True}), 201
        
    except Exception as e:
        print(f"❌ Erreur save_comparison: {e}")
        return jsonify({"error": "Erreur interne du serveur"}), 500

# ===== FONCTIONS UTILITAIRES =====

def get_role_permissions(role):
    """Retourne les permissions selon le rôle"""
    permissions = {
        'admin': {
            'canManageUsers': True,
            'canViewAllData': True,
            'canExportData': True,
            'canCreateTeams': True,
            'canManageDatabase': True,
            'maxFavorites': 1000,
            'maxTeams': 50
        },
        'analyst': {
            'canManageUsers': False,
            'canViewAllData': True,
            'canExportData': True,
            'canCreateTeams': True,
            'canManageDatabase': False,
            'maxFavorites': 500,
            'maxTeams': 20
        },
        'scout': {
            'canManageUsers': False,
            'canViewAllData': False,
            'canExportData': True,
            'canCreateTeams': True,
            'canManageDatabase': False,
            'maxFavorites': 100,
            'maxTeams': 10
        }
    }
    return permissions.get(role, permissions['scout'])

# ===== ROUTE DE SANTÉ =====

@app.route("/api/health", methods=["GET"])
def health_check():
    """Vérification de l'état de l'API"""
    try:
        connection = get_db_connection()
        if connection and connection.is_connected():
            connection.close()
            return jsonify({
                "status": "healthy",
                "database": "connected",
                "message": "API ScoutAI opérationnelle",
                "port": 3307
            }), 200
        else:
            return jsonify({
                "status": "unhealthy",
                "database": "disconnected",
                "message": "Problème de connexion à la base de données"
            }), 503
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Erreur: {str(e)}"
        }), 500

if __name__ == "__main__":
    print("🚀 Démarrage de ScoutAI Backend Enhanced...")
    print("📊 Configuration MySQL: localhost:3307")
    print("🌐 CORS activé pour: http://localhost:5173")
    print("🔐 Sessions sécurisées activées")
    print("👥 Gestion des rôles activée")
    app.run(debug=True, host='0.0.0.0', port=5000)