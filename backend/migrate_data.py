# backend/migrate_data.py
"""
Script de migration des données CSV vers MySQL
Exécutez ce script une seule fois pour importer vos données
"""

import pandas as pd
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

def migrate_styles():
    """Migre les styles de jeu correspondant à votre interface"""
    styles = [
        'football total',
        'jeu de possession', 
        'jeu positionnel',
        'jeu direct',
        'pressing intense',
        'defensif',
        'gardien'
    ]
    
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Insérer les styles
        query = "INSERT INTO styles (name) VALUES (%s) ON DUPLICATE KEY UPDATE name = VALUES(name)"
        cursor.executemany(query, [(style,) for style in styles])
        
        connection.commit()
        cursor.close()
        print("✅ Styles migrés avec succès")
        return True
        
    except Error as e:
        print(f"❌ Erreur lors de la migration des styles: {e}")
        return False
    finally:
        connection.close()

def get_style_id(style_name, connection):
    """Récupère l'ID d'un style par son nom"""
    if not style_name:
        return None
    
    try:
        cursor = connection.cursor()
        query = "SELECT id_style FROM styles WHERE name = %s"
        cursor.execute(query, (style_name.lower(),))
        result = cursor.fetchone()
        cursor.close()
        
        return result[0] if result else None
    except Error as e:
        print(f"❌ Erreur lors de la récupération du style: {e}")
        return None

def migrate_players():
    """Migre les joueurs depuis le fichier CSV"""
    csv_path = "../data/players_with_predicted_styles_and_market_value.csv"
    
    if not os.path.exists(csv_path):
        print(f"❌ Fichier CSV non trouvé: {csv_path}")
        return False
    
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        # Charger le CSV
        print("📂 Chargement du fichier CSV...")
        df = pd.read_csv(csv_path)
        
        # Nettoyer les données
        df = df.fillna(0)
        df['Player'] = df['Player'].str.strip()
        
        print(f"📊 {len(df)} joueurs trouvés dans le CSV")
        
        cursor = connection.cursor()
        
        # Préparer les données pour l'insertion
        players_data = []
        problematic_players = []
        
        for index, row in df.iterrows():
            try:
                # Récupérer l'ID du style
                style_id = get_style_id(row.get('style', ''), connection)
                
                # Convertir les valeurs avec gestion d'erreur
                def safe_int(value, default=0):
                    try:
                        return int(float(value)) if pd.notna(value) else default
                    except (ValueError, TypeError):
                        return default
                
                def safe_float(value, default=0.0):
                    try:
                        return float(value) if pd.notna(value) else default
                    except (ValueError, TypeError):
                        return default
                
                player_data = (
                    str(row['Player']),                              # name
                    safe_int(row.get('Age', 0)),                    # age
                    str(row.get('Pos', '')),                        # position
                    str(row.get('Squad', '')),                      # squad
                    safe_float(row.get('MarketValue', 0)),          # market_value
                    safe_int(row.get('Gls', 0)),                    # goals
                    safe_int(row.get('Ast', 0)),                    # assists
                    safe_int(row.get('Tkl', 0)),                    # tackles
                    safe_float(row.get('xG', 0)),                   # xG
                    safe_float(row.get('xAG', 0)),                  # xAG
                    safe_int(row.get('KP', 0)),                     # key_passes
                    safe_int(row.get('PrgP', 0)),                   # progressive_passes
                    safe_int(row.get('Carries', 0)),                # carries
                    str(row.get('image_url', '')),                  # image_url
                    style_id                                        # id_style
                )
                
                players_data.append(player_data)
                
            except Exception as e:
                problematic_players.append(f"Ligne {index}: {str(e)}")
                continue
        
        print(f"📝 {len(players_data)} joueurs préparés pour l'insertion")
        
        if problematic_players:
            print(f"⚠️  {len(problematic_players)} joueurs problématiques ignorés")
        
        # Insérer les joueurs par batch pour éviter les timeouts
        batch_size = 100
        total_inserted = 0
        
        query = """
            INSERT INTO players 
            (name, age, position, squad, market_value, goals, assists, tackles, 
             xG, xAG, key_passes, progressive_passes, carries, image_url, id_style)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            age = VALUES(age),
            position = VALUES(position),
            squad = VALUES(squad),
            market_value = VALUES(market_value),
            goals = VALUES(goals),
            assists = VALUES(assists),
            tackles = VALUES(tackles),
            xG = VALUES(xG),
            xAG = VALUES(xAG),
            key_passes = VALUES(key_passes),
            progressive_passes = VALUES(progressive_passes),
            carries = VALUES(carries),
            image_url = VALUES(image_url),
            id_style = VALUES(id_style)
        """
        
        for i in range(0, len(players_data), batch_size):
            batch = players_data[i:i + batch_size]
            cursor.executemany(query, batch)
            connection.commit()
            total_inserted += len(batch)
            print(f"📈 {total_inserted}/{len(players_data)} joueurs migrés...")
        
        cursor.close()
        print(f"✅ Migration terminée: {total_inserted} joueurs migrés avec succès")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la migration des joueurs: {e}")
        return False
    finally:
        connection.close()

def verify_migration():
    """Vérifie que la migration s'est bien passée"""
    connection = get_db_connection()
    if not connection:
        return
    
    try:
        cursor = connection.cursor()
        
        # Compter les styles
        cursor.execute("SELECT COUNT(*) FROM styles")
        styles_count = cursor.fetchone()[0]
        
        # Compter les joueurs
        cursor.execute("SELECT COUNT(*) FROM players")
        players_count = cursor.fetchone()[0]
        
        # Compter les joueurs avec style
        cursor.execute("SELECT COUNT(*) FROM players WHERE id_style IS NOT NULL")
        players_with_style = cursor.fetchone()[0]
        
        cursor.close()
        
        print("\n📊 RÉSULTATS DE LA MIGRATION:")
        print(f"   - Styles: {styles_count}")
        print(f"   - Joueurs: {players_count}")
        print(f"   - Joueurs avec style: {players_with_style}")
        
    except Error as e:
        print(f"❌ Erreur lors de la vérification: {e}")
    finally:
        connection.close()

def main():
    """Fonction principale de migration"""
    print("🚀 DÉBUT DE LA MIGRATION DES DONNÉES ScoutAI")
    print("=" * 50)
    
    # 1. Migrer les styles
    print("\n1️⃣  Migration des styles de jeu...")
    if not migrate_styles():
        print("❌ Échec de la migration des styles")
        return
    
    # 2. Migrer les joueurs
    print("\n2️⃣  Migration des joueurs...")
    if not migrate_players():
        print("❌ Échec de la migration des joueurs")
        return
    
    # 3. Vérifier la migration
    print("\n3️⃣  Vérification de la migration...")
    verify_migration()
    
    print("\n🎉 MIGRATION TERMINÉE AVEC SUCCÈS!")
    print("Vous pouvez maintenant utiliser votre application avec MySQL.")

if __name__ == "__main__":
    main()