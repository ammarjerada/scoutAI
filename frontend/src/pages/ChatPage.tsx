import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  User, 
  Send, 
  Loader2, 
  Lightbulb, 
  Sparkles,
  Users,
  RefreshCw,
  Download,
  MessageCircle
} from 'lucide-react';
import { Player } from '../types/Player';
import { ChatbotService } from '../services/chatbotService';
import { PlayerCard } from '../components/ui/PlayerCard';
import { usePlayerSearch } from '../hooks/usePlayerSearch';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationSystem } from '../components/ui/NotificationSystem';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  players?: Player[];
  criteria?: any;
}

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [examples, setExamples] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const notifications = useNotifications();
  const { toggleFavorite } = usePlayerSearch();

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    // Message de bienvenue
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'bot',
      content: "👋 **Bienvenue dans l'Assistant ScoutAI !**\n\nJe suis votre expert en scouting personnel. Décrivez-moi le type de joueur que vous recherchez en langage naturel, et je vous proposerai les meilleurs profils de notre base de données.\n\n🎯 **Je peux analyser :**\n• Position et rôle\n• Âge et expérience\n• Style de jeu\n• Budget et valeur marchande\n• Statistiques spécifiques\n\n💡 **Commencez par une question !**",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);

    // Charger les suggestions et exemples
    try {
      const [suggestionsData, examplesData] = await Promise.all([
        ChatbotService.getSuggestions(),
        ChatbotService.getExamples()
      ]);
      setSuggestions(suggestionsData);
      setExamples(examplesData);
    } catch (error) {
      console.error('Error loading chat data:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

      if (response.players && response.players.length > 0) {
        notifications.success(
          'Recherche terminée',
          `${response.players.length} joueur(s) trouvé(s) !`
        );
      }
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `😅 Désolé, j'ai rencontré un problème : ${error.message}\n\nPouvez-vous reformuler votre question ?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      notifications.error('Erreur', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePlayerSelect = (player: Player) => {
    notifications.info('Joueur sélectionné', `${player.Player} ajouté à votre sélection`);
  };

  const handleFavoriteToggle = async (player: Player): Promise<boolean> => {
    try {
      const newState = await toggleFavorite(player);
      notifications.success(
        'Favoris mis à jour',
        newState ? 'Joueur ajouté aux favoris' : 'Joueur retiré des favoris'
      );
      return newState;
    } catch (error: any) {
      notifications.error('Erreur', error.message);
      throw error;
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    initializeChat();
  };

  const formatMessageContent = (content: string) => {
    const parts = content.split('\n');
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <div key={index} className="font-bold text-slate-900 dark:text-white mb-1">
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <NotificationSystem 
        notifications={notifications.notifications}
        onDismiss={notifications.removeNotification}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Assistant ScoutAI
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Trouvez des joueurs en décrivant vos besoins en langage naturel
                </p>
              </div>
            </div>
            
            <button
              onClick={handleClearChat}
              className="flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Nouveau chat
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-4">
                    <div className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {message.type === 'bot' && (
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] p-4 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-emerald-500 text-white ml-auto'
                          : 'bg-slate-100 dark:bg-slate-700'
                      }`}>
                        <div className="space-y-2">
                          {formatMessageContent(message.content)}
                        </div>
                        <div className="text-xs opacity-70 mt-3">
                          {message.timestamp.toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>

                      {message.type === 'user' && (
                        <div className="w-10 h-10 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Players Results */}
                    {message.players && message.players.length > 0 && (
                      <div className="ml-14 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Users className="w-4 h-4" />
                            <span>{message.players.length} joueur(s) trouvé(s)</span>
                          </div>
                          {message.players.length > 0 && (
                            <button
                              onClick={() => {
                                // Export des résultats
                                const csvData = message.players.map(p => ({
                                  Nom: p.Player,
                                  Age: p.Age,
                                  Position: p.Pos,
                                  Club: p.Squad,
                                  Valeur: p.MarketValue
                                }));
                                
                                const csvContent = [
                                  Object.keys(csvData[0]).join(','),
                                  ...csvData.map(row => Object.values(row).join(','))
                                ].join('\n');
                                
                                const blob = new Blob([csvContent], { type: 'text/csv' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `scoutai_chat_results_${new Date().toISOString().split('T')[0]}.csv`;
                                a.click();
                              }}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              Export
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {message.players.map((player, index) => (
                            <div key={index} className="transform scale-95">
                              <PlayerCard
                                player={player}
                                isSelected={false}
                                onClick={() => handlePlayerSelect(player)}
                                onFavoriteToggle={handleFavoriteToggle}
                                onLoginRequired={() => notifications.warning('Connexion', 'Connexion requise')}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                        <span className="text-slate-600 dark:text-slate-300">
                          Analyse de votre demande...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Décrivez le joueur que vous cherchez..."
                    disabled={isLoading}
                    className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Envoyer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Suggestions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Suggestions
                </h3>
              </div>
              <div className="space-y-2">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Examples */}
            {examples.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Exemples
                  </h3>
                </div>
                <div className="space-y-3">
                  {examples.slice(0, 3).map((example, index) => (
                    <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <button
                        onClick={() => handleSuggestionClick(example.question)}
                        className="w-full text-left"
                      >
                        <div className="font-medium text-slate-900 dark:text-white text-sm mb-1">
                          "{example.question}"
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {example.description}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-3">
                💡 Conseils d'utilisation
              </h3>
              <ul className="text-sm text-emerald-700 dark:text-emerald-400 space-y-2">
                <li>• Soyez spécifique sur la position</li>
                <li>• Mentionnez l'âge ou le budget</li>
                <li>• Décrivez le style de jeu souhaité</li>
                <li>• Utilisez des termes football</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};