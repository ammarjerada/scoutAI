#!/usr/bin/env python3
"""
Script d'initialisation de la base de données ScoutAI Enhanced
Crée les nouvelles tables pour les fonctionnalités avancées
"""

import mysql.connector
from mysql.connector import Error

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

def add_new_columns():
    """Ajoute les nouvelles colonnes aux tables existantes"""
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Ajouter avatar_url à la table users
        try:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN avatar_url TEXT DEFAULT NULL
            """)
            print("✅ Colonne avatar_url ajoutée à la table users")
        except Error as e:
            if "Duplicate column name" in str(e):
                print("ℹ️  Colonne avatar_url déjà existante")
            else:
                print(f"⚠️  Erreur lors de l'ajout de avatar_url: {e}")
        
        connection.commit()
        cursor.close()
        return True
        
    except Error as e:
        print(f"❌ Erreur lors de l'ajout des colonnes: {e}")
        return False
    finally:
        connection.close()

def create_new_tables():
    """Crée les nouvelles tables pour les fonctionnalités avancées"""
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Table des équipes (Draft Mode)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS teams (
                team_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(255) NOT NULL DEFAULT 'Mon Équipe',
                formation VARCHAR(20) DEFAULT '4-3-3',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ Table 'teams' créée")
        
        # Table des joueurs dans les équipes
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS team_players (
                id INT AUTO_INCREMENT PRIMARY KEY,
                team_id INT NOT NULL,
                player_id INT NOT NULL,
                position VARCHAR(20) DEFAULT 'SUB',
                position_x INT DEFAULT 0,
                position_y INT DEFAULT 0,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
                FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
                UNIQUE KEY unique_team_player (team_id, player_id),
                INDEX idx_team_id (team_id),
                INDEX idx_player_id (player_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ Table 'team_players' créée")
        
        # Table des notifications
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_is_read (is_read),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ Table 'notifications' créée")
        
        # Table des activités utilisateur (pour les admins)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_activities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                action VARCHAR(100) NOT NULL,
                details JSON DEFAULT NULL,
                ip_address VARCHAR(45) DEFAULT NULL,
                user_agent TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_action (action),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ Table 'user_activities' créée")
        
        connection.commit()
        cursor.close()
        print("✅ Toutes les nouvelles tables ont été créées avec succès")
        return True
        
    except Error as e:
        print(f"❌ Erreur lors de la création des tables: {e}")
        return False
    finally:
        connection.close()

def main():
    """Fonction principale d'initialisation"""
    print("🚀 INITIALISATION DE LA BASE DE DONNÉES ENHANCED")
    print("=" * 50)
    
    # 1. Ajouter les nouvelles colonnes
    print("\n1️⃣  Ajout des nouvelles colonnes...")
    if not add_new_columns():
        print("❌ Échec de l'ajout des colonnes")
        return
    
    # 2. Créer les nouvelles tables
    print("\n2️⃣  Création des nouvelles tables...")
    if not create_new_tables():
        print("❌ Échec de la création des tables")
        return
    
    print("\n🎉 INITIALISATION ENHANCED TERMINÉE AVEC SUCCÈS!")
    print("Votre base de données est prête pour les nouvelles fonctionnalités.")

if __name__ == "__main__":
    main()