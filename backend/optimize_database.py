# backend/optimize_database.py
"""
Script d'optimisation de la base de données ScoutAI
Ajoute des index pour améliorer les performances
"""

import mysql.connector
from mysql.connector import Error
import os

# Configuration de la base de données
DB_CONFIG = {
    'host': 'localhost',
    'database': 'scoutai',
    'user': 'root',
    'password': '',
    'port': 3307,
    'charset': 'utf8mb4'
}

def get_db_connection():
    """Établit une connexion à la base de données"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"❌ Erreur de connexion: {e}")
        return None

def add_indexes():
    """Ajoute des index pour optimiser les performances"""
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Index pour la table players
        indexes = [
            # Index sur le nom pour la recherche
            "CREATE INDEX IF NOT EXISTS idx_players_name ON players(name)",
            
            # Index sur la position pour le filtrage
            "CREATE INDEX IF NOT EXISTS idx_players_position ON players(position)",
            
            # Index sur l'équipe pour le filtrage
            "CREATE INDEX IF NOT EXISTS idx_players_squad ON players(squad)",
            
            # Index sur l'âge pour le filtrage
            "CREATE INDEX IF NOT EXISTS idx_players_age ON players(age)",
            
            # Index composite sur position et valeur marchande
            "CREATE INDEX IF NOT EXISTS idx_players_pos_market ON players(position, market_value)",
            
            # Index composite sur équipe et valeur marchande
            "CREATE INDEX IF NOT EXISTS idx_players_squad_market ON players(squad, market_value)",
            
            # Index sur les statistiques pour le tri
            "CREATE INDEX IF NOT EXISTS idx_players_goals ON players(goals)",
            "CREATE INDEX IF NOT EXISTS idx_players_assists ON players(assists)",
            "CREATE INDEX IF NOT EXISTS idx_players_xg ON players(xG)",
            
            # Index sur le style pour le filtrage
            "CREATE INDEX IF NOT EXISTS idx_players_style ON players(id_style)",
        ]
        
        print("🔧 Ajout des index d'optimisation...")
        
        for index_query in indexes:
            try:
                cursor.execute(index_query)
                print(f"✅ Index ajouté: {index_query.split('IF NOT EXISTS ')[1].split(' ON')[0]}")
            except Error as e:
                if "Duplicate key name" not in str(e):
                    print(f"⚠️  Index déjà existant ou erreur: {e}")
        
        connection.commit()
        cursor.close()
        print("✅ Tous les index ont été ajoutés avec succès")
        return True
        
    except Error as e:
        print(f"❌ Erreur lors de l'ajout des index: {e}")
        return False
    finally:
        connection.close()

def analyze_tables():
    """Analyse les tables pour optimiser les requêtes"""
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        tables = ['players', 'styles', 'users', 'favorites', 'comparisons']
        
        print("📊 Analyse des tables...")
        
        for table in tables:
            try:
                cursor.execute(f"ANALYZE TABLE {table}")
                print(f"✅ Table {table} analysée")
            except Error as e:
                print(f"⚠️  Erreur lors de l'analyse de {table}: {e}")
        
        cursor.close()
        print("✅ Analyse des tables terminée")
        return True
        
    except Error as e:
        print(f"❌ Erreur lors de l'analyse: {e}")
        return False
    finally:
        connection.close()

def show_performance_stats():
    """Affiche les statistiques de performance"""
    connection = get_db_connection()
    if not connection:
        return
    
    try:
        cursor = connection.cursor()
        
        # Compter les joueurs par position
        cursor.execute("""
            SELECT position, COUNT(*) as count 
            FROM players 
            GROUP BY position 
            ORDER BY count DESC
        """)
        
        print("\n📊 RÉPARTITION PAR POSITION:")
        for row in cursor.fetchall():
            print(f"   {row[0]}: {row[1]} joueurs")
        
        # Compter les joueurs par style
        cursor.execute("""
            SELECT s.name, COUNT(*) as count 
            FROM players p 
            JOIN styles s ON p.id_style = s.id_style 
            GROUP BY s.name 
            ORDER BY count DESC
        """)
        
        print("\n📊 RÉPARTITION PAR STYLE:")
        for row in cursor.fetchall():
            print(f"   {row[0]}: {row[1]} joueurs")
        
        # Statistiques sur les valeurs marchandes
        cursor.execute("""
            SELECT 
                MIN(market_value) as min_value,
                MAX(market_value) as max_value,
                AVG(market_value) as avg_value,
                COUNT(*) as total_players
            FROM players 
            WHERE market_value > 0
        """)
        
        stats = cursor.fetchone()
        print(f"\n💰 STATISTIQUES DE VALEUR MARCHANDE:")
        print(f"   Valeur min: {stats[0]:,.0f}€")
        print(f"   Valeur max: {stats[1]:,.0f}€")
        print(f"   Valeur moyenne: {stats[2]:,.0f}€")
        print(f"   Total joueurs: {stats[3]}")
        
        cursor.close()
        
    except Error as e:
        print(f"❌ Erreur lors de l'affichage des stats: {e}")
    finally:
        connection.close()

def main():
    """Fonction principale d'optimisation"""
    print("🚀 OPTIMISATION DE LA BASE DE DONNÉES ScoutAI")
    print("=" * 50)
    
    # 1. Ajouter les index
    print("\n1️⃣  Ajout des index d'optimisation...")
    if not add_indexes():
        print("❌ Échec de l'ajout des index")
        return
    
    # 2. Analyser les tables
    print("\n2️⃣  Analyse des tables...")
    if not analyze_tables():
        print("❌ Échec de l'analyse des tables")
        return
    
    # 3. Afficher les statistiques
    print("\n3️⃣  Statistiques de performance...")
    show_performance_stats()
    
    print("\n🎉 OPTIMISATION TERMINÉE AVEC SUCCÈS!")
    print("Votre base de données est maintenant optimisée pour de meilleures performances.")

if __name__ == "__main__":
    main() 