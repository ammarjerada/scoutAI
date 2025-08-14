# 🎯 ScoutAI - Application de Scouting Football

Une application complète de scouting football avec intelligence artificielle pour analyser et comparer les joueurs. Version Enhanced 2025 avec fonctionnalités avancées.

## 🚀 Installation et Lancement Rapide

### Prérequis
- Python 3.8+
- Node.js 16+
- MySQL/MariaDB (port 3307)
- Base de données `scoutai` configurée

### Lancement Automatique
```bash
python run_scoutai.py
```

Ce script lance automatiquement :
- ✅ Backend Flask (port 5000)
- ✅ Frontend React/Vite (port 5173)
- ✅ Installation des dépendances si nécessaire

### Lancement Manuel

#### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuration

### Base de Données MySQL
Assurez-vous que votre base de données MySQL est configurée :
- **Host:** localhost
- **Port:** 3307
- **Database:** scoutai
- **User:** root
- **Password:** (vide par défaut)

### Variables d'Environnement
Le backend utilise les configurations par défaut. Pour personnaliser :
```python
DB_CONFIG = {
    'host': 'localhost',
    'database': 'scoutai',
    'user': 'root',
    'password': '',
    'port': 3307
}
```

## 🎮 Fonctionnalités

### 🆕 Nouvelles Fonctionnalités Enhanced
- ✅ **Système de notifications** en temps réel
- ✅ **Filtres avancés** avec statistiques détaillées
- ✅ **Recommandations intelligentes** de joueurs similaires
- ✅ **Métriques de performance** avancées
- ✅ **Graphiques de progression** temporelle
- ✅ **Actions rapides** pour filtrage instantané
- ✅ **Export multi-format** (PDF, CSV, PNG, Email)
- ✅ **Historique de recherche** intelligent
- ✅ **Cache optimisé** pour de meilleures performances
- ✅ **Documentation complète** du modèle IA

### 🔐 Authentification
- ✅ Inscription/Connexion sécurisée
- ✅ Sessions persistantes
- ✅ Gestion des rôles (scout, analyst, admin)

### 🔍 Recherche de Joueurs
- ✅ Filtrage avancé (style, position, âge, budget)
- ✅ Recherche par nom
- ✅ Tri par valeur marchande
- ✅ Plus de 2900 joueurs en base

### ❤️ Favoris (Connexion Requise)
- ✅ Ajout/suppression de favoris
- ✅ Notes personnalisées
- ✅ Sauvegarde en base de données

### 📊 Comparaisons (Connexion Requise)
- ✅ Comparaison de 2 joueurs
- ✅ Graphiques radar interactifs
- ✅ Historique des comparaisons
- ✅ Export PDF

### 📈 Dashboard
- ✅ Statistiques globales
- ✅ Graphiques de distribution
- ✅ Analyse des performances

## 🛠️ Technologies

### Backend
- **Flask** - Framework web Python
- **MySQL** - Base de données
- **bcrypt** - Chiffrement des mots de passe
- **Flask-CORS** - Gestion CORS

### Frontend
- **React 18** - Interface utilisateur
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styles
- **Vite** - Build tool
- **Recharts** - Graphiques
- **Axios** - Requêtes HTTP

## 📁 Structure du Projet

```
scoutai/
├── backend/
│   ├── app.py              # Application Flask principale
│   ├── requirements.txt    # Dépendances Python
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/         # Pages de l'application
│   │   ├── services/      # Services API
│   │   ├── hooks/         # Hooks personnalisés
│   │   └── types/         # Types TypeScript
│   ├── package.json       # Dépendances Node.js
│   └── ...
├── run_scoutai.py         # Script de lancement automatique
└── README.md
```

## 🔗 URLs de l'Application

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health

## 🐛 Dépannage

### Problème de Connexion MySQL
```bash
# Vérifiez que MySQL fonctionne sur le port 3307
mysql -u root -p -P 3307 -h localhost

# Vérifiez que la base 'scoutai' existe
SHOW DATABASES;
```

### Problème de Dépendances
```bash
# Backend
pip install -r backend/requirements.txt

# Frontend
cd frontend && npm install
```

### Problème de CORS
Le backend est configuré pour accepter les requêtes depuis `http://localhost:5173`. Si vous utilisez un autre port, modifiez la configuration CORS dans `backend/app.py`.

## 📊 Base de Données

L'application utilise les tables suivantes :
- **users** - Utilisateurs de l'application
- **players** - Joueurs de football (2900+ entrées)
- **styles** - Styles de jeu
- **favorites** - Favoris des utilisateurs
- **comparisons** - Historique des comparaisons

## 🎯 Utilisation

1. **Lancez l'application** avec `python run_scoutai.py`
2. **Ouvrez** http://localhost:5173
3. **Inscrivez-vous** ou connectez-vous
4. **Explorez** la base de joueurs
5. **Ajoutez** des favoris et comparez les joueurs
6. **Exportez** vos analyses en PDF

## 🤝 Support

Pour toute question ou problème :
1. Vérifiez que MySQL fonctionne sur le port 3307
2. Vérifiez que toutes les dépendances sont installées
3. Consultez les logs dans la console

---

**Développé avec ❤️ pour les passionnés de football**