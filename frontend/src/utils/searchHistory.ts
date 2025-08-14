const SEARCH_HISTORY_KEY = 'scoutai_search_history';
const MAX_HISTORY_ITEMS = 10;

export class SearchHistoryService {
  static getSearchHistory(): string[] {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  }

  static addToSearchHistory(query: string): void {
    if (!query.trim()) return;

    try {
      const history = this.getSearchHistory();
      
      // Remove if already exists
      const filtered = history.filter(item => item.toLowerCase() !== query.toLowerCase());
      
      // Add to beginning
      const updated = [query.trim(), ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  static clearSearchHistory(): void {
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  static removeFromHistory(query: string): void {
    try {
      const history = this.getSearchHistory();
      const filtered = history.filter(item => item !== query);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from search history:', error);
    }
  }
}