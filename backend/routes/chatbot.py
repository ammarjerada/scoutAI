from flask import Blueprint, request, jsonify, session
from services.chatbot_service import chatbot_service
import traceback

chatbot_bp = Blueprint('chatbot', __name__)

def require_auth():
    """Middleware pour vérifier l'authentification"""
    if 'user_id' not in session or not session.get('authenticated'):
        return jsonify({"error": "Authentification requise"}), 401
    return None

@chatbot_bp.route('/chat', methods=['POST'])
def chat():
    """Endpoint principal du chatbot"""
    try:
        data = request.json
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({
                "error": "Message vide",
                "response": "🤔 Posez-moi une question sur les joueurs que vous recherchez !",
                "suggestions": chatbot_service.get_conversation_starters()
            }), 400
        
        print(f"💬 Message reçu: {message}")
        
        # Analyser l'intention
        intent = chatbot_service.analyze_intent(message)
        print(f"🎯 Intention détectée: {intent}")
        
        if intent == 'help':
            return jsonify({
                "response": "🤖 **Je suis votre assistant ScoutAI !**\n\nJe peux vous aider à :\n• Rechercher des joueurs selon vos critères\n• Analyser les profils et statistiques\n• Recommander des talents\n\n💡 **Exemples de questions :**\n• \"Je cherche un attaquant rapide de moins de 25 ans\"\n• \"Trouve-moi un milieu créatif avec de bonnes passes\"\n• \"Quel défenseur pour moins de 20M€ ?\"",
                "suggestions": chatbot_service.get_conversation_starters(),
                "intent": intent
            }), 200
        
        # Parser le message pour extraire les critères
        criteria = chatbot_service.parse_message(message)
        print(f"📊 Critères extraits: {criteria}")
        
        # Rechercher les joueurs
        players = chatbot_service.search_players(criteria)
        print(f"✅ {len(players)} joueurs trouvés")
        
        # Générer la réponse
        response_text = chatbot_service.generate_response(message, players, criteria)
        
        return jsonify({
            "response": response_text,
            "players": players,
            "criteria": criteria,
            "intent": intent,
            "suggestions": chatbot_service.get_conversation_starters() if not players else []
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur dans le chatbot: {e}")
        traceback.print_exc()
        return jsonify({
            "error": "Erreur interne",
            "response": "😅 Désolé, j'ai rencontré un problème. Pouvez-vous reformuler votre question ?",
            "suggestions": chatbot_service.get_conversation_starters()
        }), 500

@chatbot_bp.route('/suggestions', methods=['GET'])
def get_suggestions():
    """Retourne des suggestions de questions"""
    try:
        return jsonify({
            "suggestions": chatbot_service.get_conversation_starters()
        }), 200
    except Exception as e:
        print(f"❌ Erreur get_suggestions: {e}")
        return jsonify({"error": "Erreur lors de la récupération des suggestions"}), 500

@chatbot_bp.route('/examples', methods=['GET'])
def get_examples():
    """Retourne des exemples d'utilisation du chatbot"""
    examples = [
        {
            "question": "Je cherche un attaquant rapide de moins de 25 ans",
            "criteria": "Position: Attaquant, Âge: < 25 ans, Style: Jeu direct",
            "description": "Recherche par position, âge et style de jeu"
        },
        {
            "question": "Trouve-moi un milieu créatif avec de bonnes passes",
            "criteria": "Position: Milieu, Style: Jeu de possession, Stats: Passes clés",
            "description": "Recherche par créativité et vision du jeu"
        },
        {
            "question": "Quel défenseur solide pour moins de 20M€ ?",
            "criteria": "Position: Défenseur, Budget: < 20M€, Stats: Tacles",
            "description": "Recherche avec contrainte budgétaire"
        },
        {
            "question": "Montre-moi les meilleurs jeunes talents",
            "criteria": "Âge: < 23 ans, Tri: Par valeur marchande",
            "description": "Focus sur le potentiel et l'avenir"
        }
    ]
    
    return jsonify({"examples": examples}), 200