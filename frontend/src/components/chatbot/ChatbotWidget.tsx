import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Loader2,
  Lightbulb,
  Sparkles,
  Users
} from 'lucide-react';
import { Player } from '../../types/Player';
import { ChatbotService } from '../../services/chatbotService';
import { PlayerCard } from '../ui/PlayerCard';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  players?: Player[];
  criteria?: any;
}

interface ChatbotWidgetProps {
  onPlayerSelect?: (player: Player) => void;
  onFavoriteToggle?: (player: Player) => Promise<boolean>;
  onLoginRequired?: () => void;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  onPlayerSelect,
  onFavoriteToggle,
  onLoginRequired
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Message de bienvenue
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'bot',
        content: "👋 Bonjour ! Je suis votre assistant ScoutAI.\n\nJe peux vous aider à trouver des joueurs en analysant vos demandes en langage naturel.\n\n💡 **Essayez par exemple :**\n• \"Je cherche un attaquant rapide de moins de 25 ans\"\n• \"Trouvez-moi un milieu créatif avec de bonnes passes\"\n• \"Quel défenseur pour moins de 20 millions d'euros ?\"",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      loadSuggestions();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSuggestions = async () => {
    try {
      const suggestions = await ChatbotService.getSuggestions();
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await ChatbotService.chat(inputMessage);
      
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
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `😅 Désolé, j'ai rencontré un problème : ${error.message}\n\nPouvez-vous reformuler votre question ?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageContent = (content: string) => {
    // Convertir le markdown simple en JSX
    const parts = content.split('\n');
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <div key={index} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </div>
        );
      } else if (part.startsWith('• ')) {
        return (
          <div key={index} className="ml-4 text-slate-700 dark:text-slate-300">
            {part}
          </div>
        );
      } else if (part.includes('**')) {
        // Gestion du gras inline
        const formatted = part.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <div 
            key={index} 
            className="text-slate-700 dark:text-slate-300"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      } else {
        return (
          <div key={index} className="text-slate-700 dark:text-slate-300">
            {part}
          </div>
        );
      }
    });
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-40 ${
          isOpen ? 'scale-0' : 'scale-100 hover:scale-110'
        }`}
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-2 h-2 text-white" />
        </div>
      </button>

      {/* Chatbot Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-end justify-end p-6 z-50">
          <div className="w-full max-w-md h-[600px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Assistant ScoutAI</h3>
                  <p className="text-xs opacity-90">Votre expert en scouting</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="space-y-3">
                  <div className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.type === 'bot' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-emerald-500 text-white ml-auto'
                        : 'bg-slate-100 dark:bg-slate-700'
                    }`}>
                      <div className="space-y-1">
                        {formatMessageContent(message.content)}
                      </div>
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>

                    {message.type === 'user' && (
                      <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Players Results */}
                  {message.players && message.players.length > 0 && (
                    <div className="ml-11 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Users className="w-4 h-4" />
                        <span>{message.players.length} joueur(s) trouvé(s)</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                        {message.players.slice(0, 6).map((player, index) => (
                          <div key={index} className="transform scale-90 origin-left">
                            <PlayerCard
                              player={player}
                              isSelected={false}
                              onClick={() => onPlayerSelect?.(player)}
                              onFavoriteToggle={onFavoriteToggle}
                              onLoginRequired={onLoginRequired}
                            />
                          </div>
                        ))}
                      </div>
                      {message.players.length > 6 && (
                        <div className="text-center">
                          <button
                            onClick={() => {
                              // Rediriger vers la page des joueurs avec les critères
                              window.location.href = `/players?chatbot_criteria=${encodeURIComponent(JSON.stringify(message.criteria))}`;
                            }}
                            className="text-sm text-emerald-500 hover:text-emerald-600 font-medium"
                          >
                            Voir tous les {message.players.length} résultats →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                      <span className="text-slate-600 dark:text-slate-300 text-sm">
                        Analyse en cours...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && messages.length <= 1 && (
              <div className="px-4 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Suggestions
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Décrivez le joueur que vous cherchez..."
                  disabled={isLoading}
                  className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-3 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 rounded-xl flex items-center justify-center transition-colors disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};