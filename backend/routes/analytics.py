from flask import Blueprint, jsonify, request, session
from config.database import db
import mysql.connector
from datetime import datetime, timedelta

analytics_bp = Blueprint('analytics', __name__)

def require_auth():
    """Middleware pour vérifier l'authentification"""
    if 'user_id' not in session or not session.get('authenticated'):
        return jsonify({"error": "Authentification requise"}), 401
    return None

@analytics_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Récupère les statistiques pour le dashboard"""
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        connection = db.connect()
        if not connection:
            return jsonify({"error": "Erreur de connexion à la base de données"}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Statistiques générales
        stats = {}
        
        # Nombre total de joueurs
        cursor.execute("SELECT COUNT(*) as total FROM players")
        stats['totalPlayers'] = cursor.fetchone()['total']
        
        # Nombre de favoris de l'utilisateur
        cursor.execute("SELECT COUNT(*) as total FROM favorites WHERE user_id = %s", (session['user_id'],))
        stats['userFavorites'] = cursor.fetchone()['total']
        
        # Nombre de comparaisons de l'utilisateur
        cursor.execute("SELECT COUNT(*) as total FROM comparisons WHERE user_id = %s", (session['user_id'],))
        stats['userComparisons'] = cursor.fetchone()['total']
        
        # Valeur moyenne du marché
        cursor.execute("SELECT AVG(market_value) as avg_value FROM players WHERE market_value > 0")
        result = cursor.fetchone()
        stats['avgMarketValue'] = float(result['avg_value']) if result['avg_value'] else 0
        
        # Distribution par position
        cursor.execute("""
            SELECT position, COUNT(*) as count 
            FROM players 
            WHERE position IS NOT NULL 
            GROUP BY position 
            ORDER BY count DESC
        """)
        stats['positionDistribution'] = cursor.fetchall()
        
        # Distribution par style
        cursor.execute("""
            SELECT s.name as style, COUNT(*) as count 
            FROM players p 
            LEFT JOIN styles s ON p.id_style = s.id_style 
            WHERE s.name IS NOT NULL 
            GROUP BY s.name 
            ORDER BY count DESC
        """)
        stats['styleDistribution'] = cursor.fetchall()
        
        # Top joueurs par valeur
        cursor.execute("""
            SELECT name, squad, market_value, position 
            FROM players 
            WHERE market_value > 0 
            ORDER BY market_value DESC 
            LIMIT 10
        """)
        stats['topValuePlayers'] = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify(stats), 200
        
    except Exception as e:
        print(f"❌ Erreur get_dashboard_stats: {e}")
        return jsonify({"error": "Erreur lors de la récupération des statistiques"}), 500

@analytics_bp.route('/player/<int:player_id>/performance', methods=['GET'])
def get_player_performance(player_id):
    """Récupère les données de performance d'un joueur"""
    try:
        connection = db.connect()
        if not connection:
            return jsonify({"error": "Erreur de connexion à la base de données"}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Récupérer les données du joueur
        cursor.execute("""
            SELECT p.*, s.name as style_name
            FROM players p
            LEFT JOIN styles s ON p.id_style = s.id_style
            WHERE p.player_id = %s
        """, (player_id,))
        
        player_data = cursor.fetchone()
        
        if not player_data:
            cursor.close()
            connection.close()
            return jsonify({"error": "Joueur non trouvé"}), 404
        
        # Générer des données de performance historiques simulées
        performance_data = []
        months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
        
        for i, month in enumerate(months):
            # Simuler une progression réaliste
            base_goals = player_data['goals'] or 0
            base_assists = player_data['assists'] or 0
            
            goals_progression = base_goals * (i + 1) / 12
            assists_progression = base_assists * (i + 1) / 12
            
            performance_data.append({
                'month': month,
                'goals': round(goals_progression, 1),
                'assists': round(assists_progression, 1),
                'xG': round((player_data['xG'] or 0) * (i + 1) / 12, 2),
                'tackles': round((player_data['tackles'] or 0) * (i + 1) / 12, 1)
            })
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'player': player_data,
            'performance': performance_data
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur get_player_performance: {e}")
        return jsonify({"error": "Erreur lors de la récupération des performances"}), 500