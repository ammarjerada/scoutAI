#!/usr/bin/env python3
"""
Script de lancement pour ScoutAI Enhanced
Démarre automatiquement le backend Flask et le frontend Vite
"""

import subprocess
import sys
import os
import time
import signal
from pathlib import Path

def check_python_version():
    """Vérifie la version Python"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ requis")
        print(f"Version actuelle: {sys.version}")
        return False
    print(f"✅ Python {sys.version.split()[0]} OK")
    return True

def check_dependencies():
    """Vérifie que toutes les dépendances sont installées"""
    print("🔍 Vérification des dépendances...")
    
    # Vérifier Python
    try:
        import flask
        import mysql.connector
        import bcrypt
        import flask_cors
        import pandas
        print("✅ Dépendances Python OK")
    except ImportError as e:
        print(f"❌ Dépendance Python manquante: {e}")
        print("💡 Installez avec: pip install -r backend/requirements.txt")
        return False
    
    # Vérifier Node.js
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"✅ Node.js OK: {version}")
            
            # Vérifier la version minimale
            version_num = int(version.replace('v', '').split('.')[0])
            if version_num < 16:
                print("⚠️  Node.js 16+ recommandé")
        else:
            print("❌ Node.js non trouvé")
            return False
    except FileNotFoundError:
        print("❌ Node.js non installé")
        print("💡 Téléchargez depuis: https://nodejs.org/")
        return False
    
    return True

def install_backend_deps():
    """Installe les dépendances du backend"""
    print("📦 Installation des dépendances backend...")
    try:
        os.chdir('backend')
        
        # Vérifier si un environnement virtuel existe
        if not Path('venv').exists():
            print("🔧 Création de l'environnement virtuel...")
            subprocess.run([sys.executable, '-m', 'venv', 'venv'], check=True)
        
        # Déterminer le chemin de l'exécutable Python dans le venv
        if os.name == 'nt':  # Windows
            python_exe = 'venv\\Scripts\\python.exe'
            pip_exe = 'venv\\Scripts\\pip.exe'
        else:  # macOS/Linux
            python_exe = 'venv/bin/python'
            pip_exe = 'venv/bin/pip'
        
        # Installer les dépendances
        subprocess.run([pip_exe, 'install', '--upgrade', 'pip'], check=True)
        subprocess.run([pip_exe, 'install', '-r', 'requirements.txt'], check=True)
        
        os.chdir('..')
        print("✅ Dépendances backend installées")
        return True, python_exe
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors de l'installation des dépendances backend: {e}")
        os.chdir('..')
        return False, None

def install_frontend_deps():
    """Installe les dépendances du frontend"""
    print("📦 Installation des dépendances frontend...")
    try:
        os.chdir('frontend')
        
        # Nettoyer le cache si nécessaire
        if Path('node_modules').exists():
            print("🧹 Nettoyage du cache npm...")
            subprocess.run(['npm', 'cache', 'clean', '--force'], check=False)
        
        # Installer les dépendances
        result = subprocess.run(['npm', 'install'], check=True, capture_output=True, text=True)
        
        os.chdir('..')
        print("✅ Dépendances frontend installées")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors de l'installation des dépendances frontend: {e}")
        print("💡 Essayez: npm install --legacy-peer-deps")
        os.chdir('..')
        return False
    except FileNotFoundError:
        print("❌ npm non trouvé. Installez Node.js")
        os.chdir('..')
        return False

def test_mysql_connection():
    """Teste la connexion MySQL"""
    print("🔍 Test de connexion MySQL...")
    try:
        import mysql.connector
        connection = mysql.connector.connect(
            host='localhost',
            database='scoutai',
            user='root',
            password='',
            port=3307
        )
        if connection.is_connected():
            print("✅ Connexion MySQL réussie (port 3307)")
            
            # Vérifier les tables principales
            cursor = connection.cursor()
            cursor.execute("SHOW TABLES")
            tables = [table[0] for table in cursor.fetchall()]
            
            required_tables = ['users', 'players', 'styles', 'favorites', 'comparisons']
            missing_tables = [table for table in required_tables if table not in tables]
            
            if missing_tables:
                print(f"⚠️  Tables manquantes: {missing_tables}")
                print("💡 Importez votre dump SQL d'abord")
            else:
                print("✅ Toutes les tables principales présentes")
            
            cursor.close()
            connection.close()
            return True
        else:
            print("❌ Connexion MySQL échouée")
            return False
    except Exception as e:
        print(f"❌ Erreur MySQL: {e}")
        print("💡 Vérifiez que MySQL fonctionne sur le port 3307")
        print("💡 Vérifiez que la base 'scoutai' existe")
        return False

def init_enhanced_database():
    """Initialise les nouvelles tables pour les fonctionnalités enhanced"""
    print("🔧 Initialisation des nouvelles fonctionnalités...")
    try:
        os.chdir('backend')
        result = subprocess.run([sys.executable, 'init_enhanced_database.py'], 
                              capture_output=True, text=True)
        os.chdir('..')
        
        if result.returncode == 0:
            print("✅ Base de données enhanced initialisée")
            return True
        else:
            print(f"⚠️  Avertissement lors de l'initialisation: {result.stderr}")
            return True  # Continuer même avec des avertissements
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation enhanced: {e}")
        os.chdir('..')
        return False

def start_backend(python_exe=None):
    """Démarre le serveur backend Flask"""
    print("🚀 Démarrage du backend Flask...")
    try:
        os.chdir('backend')
        
        # Utiliser l'exécutable Python du venv si disponible
        if python_exe and Path(python_exe).exists():
            process = subprocess.Popen([python_exe, 'app.py'], 
                                     stdout=subprocess.PIPE, 
                                     stderr=subprocess.PIPE, 
                                     text=True)
        else:
            process = subprocess.Popen([sys.executable, 'app.py'], 
                                     stdout=subprocess.PIPE, 
                                     stderr=subprocess.PIPE, 
                                     text=True)
        
        os.chdir('..')
        return process
    except Exception as e:
        print(f"❌ Erreur lors du démarrage du backend: {e}")
        os.chdir('..')
        return None

def start_frontend():
    """Démarre le serveur frontend Vite"""
    print("🌐 Démarrage du frontend Vite...")
    try:
        os.chdir('frontend')
        process = subprocess.Popen(['npm', 'run', 'dev'], 
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.PIPE, 
                                 text=True)
        os.chdir('..')
        return process
    except Exception as e:
        print(f"❌ Erreur lors du démarrage du frontend: {e}")
        os.chdir('..')
        return None

def wait_for_backend():
    """Attend que le backend soit prêt"""
    import requests
    max_attempts = 30
    for attempt in range(max_attempts):
        try:
            response = requests.get('http://localhost:5000/api/health', timeout=2)
            if response.status_code == 200:
                print("✅ Backend prêt")
                return True
        except:
            pass
        
        if attempt < max_attempts - 1:
            print(f"⏳ Attente du backend... ({attempt + 1}/{max_attempts})")
            time.sleep(2)
    
    print("❌ Timeout: Backend non accessible")
    return False

def main():
    """Fonction principale"""
    print("=" * 70)
    print("🎯 SCOUTAI ENHANCED - LANCEMENT AUTOMATIQUE")
    print("=" * 70)
    
    # Vérifier Python
    if not check_python_version():
        return
    
    # Vérifier les dépendances
    if not check_dependencies():
        print("📦 Installation des dépendances backend...")
        success, python_exe = install_backend_deps()
        if not success:
            print("❌ Impossible d'installer les dépendances backend.")
            return
    else:
        python_exe = None
    
    # Tester MySQL
    if not test_mysql_connection():
        print("❌ Connexion MySQL impossible. Vérifiez votre configuration.")
        print("💡 Assurez-vous que MySQL fonctionne sur le port 3307")
        print("💡 Importez votre dump SQL dans la base 'scoutai'")
        return
    
    # Initialiser les nouvelles fonctionnalités
    if not init_enhanced_database():
        print("⚠️  Problème lors de l'initialisation enhanced, mais on continue...")
    
    # Installer les dépendances frontend
    if not Path('frontend/node_modules').exists():
        if not install_frontend_deps():
            print("❌ Impossible d'installer les dépendances frontend.")
            return
    
    # Démarrer le backend
    backend_process = start_backend(python_exe)
    if not backend_process:
        print("❌ Impossible de démarrer le backend.")
        return
    
    # Attendre que le backend soit prêt
    print("⏳ Attente du démarrage du backend...")
    if not wait_for_backend():
        print("❌ Backend non accessible.")
        backend_process.terminate()
        return
    
    # Démarrer le frontend
    frontend_process = start_frontend()
    if not frontend_process:
        print("❌ Impossible de démarrer le frontend.")
        backend_process.terminate()
        return
    
    print("\n" + "=" * 70)
    print("✅ SCOUTAI ENHANCED DÉMARRÉ AVEC SUCCÈS!")
    print("=" * 70)
    print("🔗 Frontend: http://localhost:5173")
    print("🔗 Backend:  http://localhost:5000")
    print("🔗 API:      http://localhost:5000/api/health")
    print("🔗 MySQL:    localhost:3307")
    print("=" * 70)
    print("🎯 NOUVELLES FONCTIONNALITÉS:")
    print("   👤 Profils utilisateur avec avatars")
    print("   🏆 Système de rôles (Scout/Analyst/Admin)")
    print("   🧩 Mode Draft avec drag & drop")
    print("   🎨 Interface améliorée")
    print("   🔔 Notifications en temps réel")
    print("=" * 70)
    print("💡 Appuyez sur Ctrl+C pour arrêter les serveurs")
    print("=" * 70)
    
    def signal_handler(sig, frame):
        print("\n🛑 Arrêt des serveurs...")
        backend_process.terminate()
        frontend_process.terminate()
        print("✅ Serveurs arrêtés. Au revoir!")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        # Attendre que les processus se terminent
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main()