import re
from typing import Dict, List, Optional

class ValidationError(Exception):
    """Exception pour les erreurs de validation"""
    pass

class Validators:
    """Classe utilitaire pour la validation des données"""
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Valide le format d'un email"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_password(password: str) -> List[str]:
        """Valide un mot de passe et retourne les erreurs"""
        errors = []
        
        if len(password) < 6:
            errors.append("Le mot de passe doit contenir au moins 6 caractères")
        
        if not re.search(r'[A-Za-z]', password):
            errors.append("Le mot de passe doit contenir au moins une lettre")
        
        return errors
    
    @staticmethod
    def validate_user_data(data: Dict) -> List[str]:
        """Valide les données d'un utilisateur"""
        errors = []
        
        # Email requis et valide
        if not data.get('email'):
            errors.append("L'email est requis")
        elif not Validators.validate_email(data['email']):
            errors.append("Format d'email invalide")
        
        # Mot de passe requis et valide
        if not data.get('password'):
            errors.append("Le mot de passe est requis")
        else:
            password_errors = Validators.validate_password(data['password'])
            errors.extend(password_errors)
        
        # Prénom et nom requis
        if not data.get('firstName'):
            errors.append("Le prénom est requis")
        
        if not data.get('lastName'):
            errors.append("Le nom est requis")
        
        # Rôle valide
        valid_roles = ['scout', 'analyst', 'admin']
        if data.get('role') and data['role'] not in valid_roles:
            errors.append(f"Rôle invalide. Rôles autorisés: {', '.join(valid_roles)}")
        
        return errors
    
    @staticmethod
    def validate_player_filters(filters: Dict) -> List[str]:
        """Valide les filtres de recherche de joueurs"""
        errors = []
        
        # Validation de l'âge
        if filters.get('minAge'):
            try:
                age = int(filters['minAge'])
                if age < 16 or age > 45:
                    errors.append("L'âge minimum doit être entre 16 et 45 ans")
            except ValueError:
                errors.append("L'âge minimum doit être un nombre")
        
        if filters.get('maxAge'):
            try:
                age = int(filters['maxAge'])
                if age < 16 or age > 45:
                    errors.append("L'âge maximum doit être entre 16 et 45 ans")
            except ValueError:
                errors.append("L'âge maximum doit être un nombre")
        
        # Validation du budget
        if filters.get('budget'):
            try:
                budget = float(filters['budget'])
                if budget < 0:
                    errors.append("Le budget ne peut pas être négatif")
            except ValueError:
                errors.append("Le budget doit être un nombre")
        
        # Validation des statistiques
        stat_fields = ['goals_min', 'goals_max', 'assists_min', 'assists_max', 'tackles_min', 'tackles_max']
        for field in stat_fields:
            if filters.get(field):
                try:
                    value = float(filters[field])
                    if value < 0:
                        errors.append(f"La valeur de {field} ne peut pas être négative")
                except ValueError:
                    errors.append(f"La valeur de {field} doit être un nombre")
        
        return errors
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = 255) -> str:
        """Nettoie et limite une chaîne de caractères"""
        if not isinstance(value, str):
            return ""
        
        # Supprimer les caractères dangereux
        cleaned = re.sub(r'[<>"\']', '', value.strip())
        
        # Limiter la longueur
        return cleaned[:max_length]
    
    @staticmethod
    def validate_player_id(player_id: any) -> Optional[int]:
        """Valide et convertit un ID de joueur"""
        try:
            pid = int(player_id)
            if pid <= 0:
                raise ValidationError("L'ID du joueur doit être positif")
            return pid
        except (ValueError, TypeError):
            raise ValidationError("ID de joueur invalide")