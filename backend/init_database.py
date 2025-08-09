# backend/init_database.py
"""
Script d'initialisation de la base de données ScoutAI
Crée les tables nécessaires pour l'application
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

def create_database():
    """Crée la base de données si elle n'existe pas"""
    try:
        # Connexion sans spécifier de base de données
        connection = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        
        cursor = connection.cursor()
        
        # Créer la base de données
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"✅ Base de données '{DB_CONFIG['database']}' créée ou déjà existante")
        
        cursor.close()
        connection.close()
        return True
        
    except Error as e:
        print(f"❌ Erreur lors de la création de la base de données: {e}")
        return False

def get_db_connection():
    """Établit une connexion à la base de données"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"❌ Erreur de connexion: {e}")
        return None

def create_tables():
    """Crée toutes les tables nécessaires"""
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Table des styles de jeu
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS styles (
                id_style INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ Table 'styles' créée")
        
        # Table des joueurs
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS players (
                player_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                age INT,
                position VARCHAR(50),
                squad VARCHAR(255),
                market_value DECIMAL(15,2) DEFAULT 0,
                goals INT DEFAULT 0,
                assists INT DEFAULT 0,
                tackles INT DEFAULT 0,
                xG DECIMAL(10,3) DEFAULT 0,
                xAG DECIMAL(10,3) DEFAULT 0,
                key_passes INT DEFAULT 0,
                progressive_passes INT DEFAULT 0,
                carries INT DEFAULT 0,
                image_url TEXT,
                id_style INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (id_style) REFERENCES styles(id_style) ON DELETE SET NULL,
                INDEX idx_name (name),
                INDEX idx_position (position),
                INDEX idx_squad (squad),
                INDEX idx_market_value (market_value),
                INDEX idx_style (id_style)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ Table 'players' créée")
        
        # Table des utilisateurs
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                role ENUM('scout', 'manager', 'analyst', 'admin') DEFAULT 'scout',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ Table 'users' créée")
        
        # Table des favoris
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS favorites (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                player_id INT NOT NULL,
                note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_player (user_id, player_id),
                INDEX idx_user_id (user_id),
                INDEX idx_player_id (player_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ Table 'favorites' créée")
        
        # Table des comparaisons
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS comparisons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                id_player_1 INT NOT NULL,
                id_player_2 INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (id_player_1) REFERENCES players(player_id) ON DELETE CASCADE,
                FOREIGN KEY (id_player_2) REFERENCES players(player_id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_players (id_player_1, id_player_2)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ Table 'comparisons' créée")
        
        connection.commit()
        cursor.close()
        print("✅ Toutes les tables ont été créées avec succès")
        return True
        
    except Error as e:
        print(f"❌ Erreur lors de la création des tables: {e}")
        return False
    finally:
        connection.close()

def verify_tables():
    """Vérifie que toutes les tables ont été créées"""
    connection = get_db_connection()
    if not connection:
        return
    
    try:
        cursor = connection.cursor()
        
        # Lister toutes les tables
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        
        expected_tables = ['styles', 'players', 'users', 'favorites', 'comparisons']
        
        print("\n📊 TABLES CRÉÉES:")
        for table in expected_tables:
            if table in tables:
                print(f"   ✅ {table}")
            else:
                print(f"   ❌ {table} (manquante)")
        
        cursor.close()
        
    except Error as e:
        print(f"❌ Erreur lors de la vérification: {e}")
    finally:
        connection.close()

def main():
    """Fonction principale d'initialisation"""
    print("🚀 INITIALISATION DE LA BASE DE DONNÉES ScoutAI")
    print("=" * 50)
    
    # 1. Créer la base de données
    print("\n1️⃣  Création de la base de données...")
    if not create_database():
        print("❌ Échec de la création de la base de données")
        return
    
    # 2. Créer les tables
    print("\n2️⃣  Création des tables...")
    if not create_tables():
        print("❌ Échec de la création des tables")
        return
    
    # 3. Vérifier les tables
    print("\n3️⃣  Vérification des tables...")
    verify_tables()
    
    print("\n🎉 INITIALISATION TERMINÉE AVEC SUCCÈS!")
    print("Vous pouvez maintenant exécuter le script de migration des données.")

if __name__ == "__main__":
    main() 