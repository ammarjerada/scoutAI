# 🚀 Guide d'Installation ScoutAI Enhanced

## 📋 Prérequis Système

### 1. Python 3.8+
```bash
# Vérifier la version Python
python --version
# ou
python3 --version
```

### 2. Node.js 16+
```bash
# Vérifier la version Node.js
node --version
npm --version
```

### 3. MySQL/MariaDB
- **Port:** 3307
- **Base de données:** scoutai
- **Utilisateur:** root
- **Mot de passe:** (vide)

## 🔧 Installation Étape par Étape

### Étape 1: Cloner/Copier le Projet
```bash
# Créer un nouveau dossier
mkdir scoutai-enhanced
cd scoutai-enhanced

# Copier tous les fichiers du projet dans ce dossier
```

### Étape 2: Configuration de la Base de Données
```bash
# 1. Démarrer MySQL sur le port 3307
# 2. Importer votre dump SQL existant
# 3. Exécuter le script d'amélioration
cd backend
python init_enhanced_database.py
```

### Étape 3: Installation Backend
```bash
cd backend

# Créer un environnement virtuel (recommandé)
python -m venv venv

# Activer l'environnement virtuel
# Sur Windows:
venv\Scripts\activate
# Sur macOS/Linux:
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

### Étape 4: Installation Frontend
```bash
cd ../frontend

# Installer les dépendances Node.js
npm install

# Si vous avez des erreurs, essayez:
npm install --legacy-peer-deps
```

### Étape 5: Vérification des Dépendances

#### Backend Python:
```bash
cd backend
pip list | grep -E "(Flask|mysql|bcrypt|pandas)"
```

Vous devriez voir:
- Flask==3.0.3
- mysql-connector-python==9.1.0
- bcrypt==4.2.1
- pandas==2.2.3

#### Frontend Node.js:
```bash
cd frontend
npm list --depth=0 | grep -E "(react|axios|lucide|recharts)"
```

Vous devriez voir:
- react@18.3.1
- axios@1.7.9
- lucide-react@0.468.0
- recharts@2.13.3

## 🚀 Lancement de l'Application

### Option 1: Lancement Automatique (Recommandé)
```bash
# Depuis la racine du projet
python run_scoutai.py
```

### Option 2: Lancement Manuel

#### Terminal 1 - Backend:
```bash
cd backend
python app.py
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

## 🔍 Vérification du Fonctionnement

### 1. Vérifier les URLs
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health

### 2. Tester la Connexion MySQL
```bash
# Depuis le backend
python -c "
import mysql.connector
try:
    conn = mysql.connector.connect(
        host='localhost',
        database='scoutai',
        user='root',
        password='',
        port=3307
    )
    print('✅ Connexion MySQL réussie')
    conn.close()
except Exception as e:
    print(f'❌ Erreur MySQL: {e}')
"
```

### 3. Tester l'API
```bash
curl http://localhost:5000/api/health
```

## 🛠️ Résolution des Problèmes Courants

### Problème: Port 3307 non disponible
```bash
# Vérifier les processus MySQL
netstat -an | grep 3307
# ou
lsof -i :3307
```

### Problème: Dépendances Python manquantes
```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

### Problème: Dépendances Node.js
```bash
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Problème: CORS
Vérifiez que le backend autorise `http://localhost:5173` dans la configuration CORS.

### Problème: Sessions
Vérifiez que la `SECRET_KEY` est définie dans `backend/app.py`.

## 📊 Structure des Nouvelles Tables

Le script `init_enhanced_database.py` crée:

1. **Colonne avatar_url** dans `users`
2. **Table teams** pour le mode Draft
3. **Table team_players** pour les compositions
4. **Table notifications** pour les alertes
5. **Table user_activities** pour l'audit

## 🎯 Fonctionnalités par Rôle

### Scout
- ✅ Recherche de joueurs
- ✅ Favoris (max 100)
- ✅ Comparaisons
- ✅ Mode Draft (max 10 équipes)
- ✅ Export PDF

### Analyst
- ✅ Toutes les fonctionnalités Scout
- ✅ Dashboard avancé
- ✅ Favoris (max 500)
- ✅ Mode Draft (max 20 équipes)
- ✅ Accès à toutes les données

### Admin
- ✅ Toutes les fonctionnalités
- ✅ Gestion des utilisateurs
- ✅ Favoris illimités (max 1000)
- ✅ Équipes illimitées (max 50)
- ✅ Gestion de la base de données

## 🔐 Sécurité

- Sessions Flask sécurisées
- Mots de passe hashés avec bcrypt
- Protection CORS
- Validation des permissions par rôle
- Audit des activités utilisateur

## 📱 Responsive Design

L'application est entièrement responsive et fonctionne sur:
- 📱 Mobile (320px+)
- 📱 Tablette (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1440px+)

## 🎨 Nouvelles Fonctionnalités UI/UX

- ✨ Animations fluides
- 🎯 Drag & Drop pour le mode Draft
- 📸 Upload d'avatar
- 🔔 Notifications en temps réel
- 🎨 Thème sombre/clair
- 📊 Graphiques interactifs
- 🏆 Système de rôles visuels

---

**🎉 Votre application ScoutAI Enhanced est prête !**