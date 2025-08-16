import { useState, useCallback } from 'react';
import { ChatbotService } from '../services/chatbotService';
import { Player } from '../types/Player';

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  players?: Player[];
  criteria?: any;
}

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await ChatbotService.chat(message);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.response,
        timestamp: new Date(),
        players: response.players,
        criteria: response.criteria
      };

      setMessages(prev => [...prev, botMessage]);
      
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }

      return response;
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `😅 Désolé, j'ai rencontré un problème : ${error.message}\n\nPouvez-vous reformuler votre question ?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const loadSuggestions = useCallback(async () => {
    try {
      const suggestions = await ChatbotService.getSuggestions();
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  }, []);

  return {
    messages,
    isLoading,
    suggestions,
    sendMessage,
    clearMessages,
    loadSuggestions
  };
};