import json
import time
from typing import Any, Optional
from functools import wraps

class CacheService:
    """Service de cache en mémoire pour améliorer les performances"""
    
    def __init__(self):
        self._cache = {}
        self._timestamps = {}
        self._default_ttl = 300  # 5 minutes par défaut
    
    def get(self, key: str) -> Optional[Any]:
        """Récupère une valeur du cache"""
        if key not in self._cache:
            return None
        
        # Vérifier l'expiration
        if self._is_expired(key):
            self.delete(key)
            return None
        
        return self._cache[key]
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Stocke une valeur dans le cache"""
        self._cache[key] = value
        self._timestamps[key] = time.time() + (ttl or self._default_ttl)
    
    def delete(self, key: str) -> None:
        """Supprime une valeur du cache"""
        self._cache.pop(key, None)
        self._timestamps.pop(key, None)
    
    def clear(self) -> None:
        """Vide tout le cache"""
        self._cache.clear()
        self._timestamps.clear()
    
    def _is_expired(self, key: str) -> bool:
        """Vérifie si une clé a expiré"""
        if key not in self._timestamps:
            return True
        return time.time() > self._timestamps[key]
    
    def cached(self, ttl: Optional[int] = None):
        """Décorateur pour mettre en cache les résultats de fonction"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Créer une clé unique basée sur la fonction et ses arguments
                cache_key = f"{func.__name__}:{hash(str(args) + str(sorted(kwargs.items())))}"
                
                # Essayer de récupérer du cache
                cached_result = self.get(cache_key)
                if cached_result is not None:
                    print(f"🚀 Cache hit pour {func.__name__}")
                    return cached_result
                
                # Exécuter la fonction et mettre en cache
                result = func(*args, **kwargs)
                self.set(cache_key, result, ttl)
                print(f"💾 Cache miss pour {func.__name__} - résultat mis en cache")
                
                return result
            return wrapper
        return decorator

# Instance globale
cache = CacheService()