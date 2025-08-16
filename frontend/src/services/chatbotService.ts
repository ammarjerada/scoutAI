import axios from 'axios';
import { Player } from '../types/Player';

const API_BASE_URL = 'http://localhost:5000/api/chatbot';

axios.defaults.withCredentials = true;

export interface ChatbotResponse {
  response: string;
  players?: Player[];
  criteria?: any;
  intent?: string;
  suggestions?: string[];
  error?: string;
}

export class ChatbotService {
  static async chat(message: string): Promise<ChatbotResponse> {
    try {
      console.log('💬 Envoi du message au chatbot:', message);
      const response = await axios.post(`${API_BASE_URL}/chat`, { message });
      console.log('✅ Réponse du chatbot reçue');
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur chatbot:', error);
      throw new Error(error.response?.data?.error || 'Erreur de communication avec le chatbot');
    }
  }

  static async getSuggestions(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/suggestions`);
      return response.data.suggestions;
    } catch (error: any) {
      console.error('❌ Erreur suggestions:', error);
      return [
        "Je cherche un attaquant rapide de moins de 25 ans",
        "Trouve-moi un milieu créatif avec de bonnes passes",
        "Quel défenseur pour moins de 20M€ ?"
      ];
    }
  }

  static async getExamples(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/examples`);
      return response.data.examples;
    } catch (error: any) {
      console.error('❌ Erreur exemples:', error);
      return [];
    }
  }
}