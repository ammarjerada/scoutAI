# backend/services/data_migrator.py
import pandas as pd
from config.database import db

class DataMigrator:
    """Service pour migrer les données CSV vers MySQL"""
    
    def migrate_styles(self):
        """Migre les styles de jeu correspondant à votre interface"""
        styles = [
            'football total', 'jeu de possession', 'jeu positionnel', 
            'jeu direct', 'pressing intense', 'defensif', 'gardien'
        ]
        
        query = "INSERT INTO styles (name) VALUES (%s) ON DUPLICATE KEY UPDATE name = VALUES(name)"
        data = [(style,) for style in styles]
        
        success = db.execute_many(query, data)
        if success:
            print("✅ Styles migrés avec succès")
        return success
    
    def migrate_players_from_csv(self, csv_path: str):
        """Migre les joueurs depuis le fichier CSV"""
        try:
            # Charger le CSV
            df = pd.read_csv(csv_path)
            
            # Nettoyer les données
            df = df.fillna(0)
            df['Player'] = df['Player'].str.strip()
            
            # Préparer les données pour l'insertion
            players_data = []
            for _, row in df.iterrows():
                # Récupérer l'ID du style
                style_id = self.get_style_id(row.get('style', ''))
                
                player_data = (
                    row['Player'],                    # name
                    int(row.get('Age', 0)),          # age
                    row.get('Pos', ''),              # position
                    row.get('Squad', ''),            # squad
                    float(row.get('MarketValue', 0)), # market_value
                    int(row.get('Gls', 0)),          # goals
                    int(row.get('Ast', 0)),          # assists
                    int(row.get('Tkl', 0)),          # tackles
                    float(row.get('xG', 0)),         # xG
                    float(row.get('xAG', 0)),        # xAG
                    int(row.get('KP', 0)),           # key_passes
                    int(row.get('PrgP', 0)),         # progressive_passes
                    int(row.get('Carries', 0)),      # carries
                    row.get('image_url', ''),        # image_url
                    style_id                         # id_style
                )
                players_data.append(player_data)
            
            # Insérer les joueurs
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
            
            success = db.execute_many(query, players_data)
            if success:
                print(f"✅ {len(players_data)} joueurs migrés avec succès")
            return success
            
        except Exception as e:
            print(f"❌ Erreur lors de la migration: {e}")
            return False
    
    def get_style_id(self, style_name: str) -> Optional[int]:
        """Récupère l'ID d'un style par son nom"""
        if not style_name:
            return None
            
        query = "SELECT id_style FROM styles WHERE name = %s"
        result = db.execute_query(query, (style_name.lower(),))
        
        if result and len(result) > 0:
            return result[0]['id_style']
        return None
    
    def run_full_migration(self):
        """Lance la migration complète"""
        print("🚀 Début de la migration des données...")
        
        # 1. Migrer les styles
        self.migrate_styles()
        
        # 2. Migrer les joueurs
        csv_path = "../data/players_with_predicted_styles_and_market_value.csv"
        self.migrate_players_from_csv(csv_path)
        
        print("✅ Migration terminée !")

# Script d'exécution
if __name__ == "__main__":
    migrator = DataMigrator()
    migrator.run_full_migration()