# backend/config/database.py
import mysql.connector
from mysql.connector import Error
import os
from typing import Optional
import pandas as pd
from flask_sqlalchemy import SQLAlchemy

db_sqlalchemy = SQLAlchemy()

class DatabaseConnection:
    def __init__(self):
        self.host = os.getenv('DB_HOST', 'localhost')
        self.database = os.getenv('DB_NAME', 'scoutai')
        self.user = os.getenv('DB_USER', 'root')
        self.password = os.getenv('DB_PASSWORD', '')
        self.port = int(os.getenv('DB_PORT', 3307))  
        self._connection = None
    
    def connect(self):
        """Établit la connexion à la base de données"""
        try:
            if self._connection is None or not self._connection.is_connected():
                self._connection = mysql.connector.connect(
                    host=self.host,
                    database=self.database,
                    user=self.user,
                    password=self.password,
                    port=self.port,
                    charset='utf8mb4',
                    autocommit=True
                )
                print("✅ Connexion MySQL établie")
            return self._connection
        except Error as e:
            print(f"❌ Erreur de connexion MySQL: {e}")
            return None
    
    def disconnect(self):
        """Ferme la connexion à la base de données"""
        if self._connection and self._connection.is_connected():
            self._connection.close()
            print("🔌 Connexion MySQL fermée")
    
    def execute_query(self, query: str, params: tuple = None, fetch: bool = True):
        """Exécute une requête SQL"""
        try:
            connection = self.connect()
            if connection:
                cursor = connection.cursor(dictionary=True)
                cursor.execute(query, params or ())
                
                if fetch:
                    result = cursor.fetchall()
                    cursor.close()
                    return result
                else:
                    connection.commit()
                    cursor.close()
                    return True
            return None
        except Error as e:
            print(f"❌ Erreur lors de l'exécution de la requête: {e}")
            return None
    
    def execute_many(self, query: str, data: list):
        """Exécute une requête avec plusieurs ensembles de données"""
        try:
            connection = self.connect()
            if connection:
                cursor = connection.cursor()
                cursor.executemany(query, data)
                connection.commit()
                cursor.close()
                return True
            return False
        except Error as e:
            print(f"❌ Erreur lors de l'insertion multiple: {e}")
            return False

# Instance globale
db = DatabaseConnection()