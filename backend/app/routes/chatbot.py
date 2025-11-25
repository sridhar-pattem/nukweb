from flask import Blueprint, request, jsonify
import json
import os
import re
from datetime import datetime

chatbot_bp = Blueprint('chatbot', __name__)

# Load knowledge base
KNOWLEDGE_BASE_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'website', 'src', 'config', 'chatbotKnowledge.json')

def load_knowledge_base():
    """Load the chatbot knowledge base from JSON file"""
    try:
        with open(KNOWLEDGE_BASE_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading knowledge base: {e}")
        return None

KNOWLEDGE_BASE = load_knowledge_base()

def get_anthropic_client():
    """Initialize Anthropic client"""
    try:
        import anthropic
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            print("ANTHROPIC_API_KEY not found in environment")
            return None

        # Initialize client with minimal configuration to avoid proxy issues
        client = anthropic.Anthropic(
            api_key=api_key,
            max_retries=2,
            timeout=30.0
        )
        return client
    except ImportError:
        print("Anthropic library not installed. Run: pip install anthropic")
        return None
    except TypeError as e:
        # Handle initialization errors (like unexpected arguments)
        print(f"Anthropic client initialization error: {e}")
        # Try basic initialization without extra parameters
        try:
            import anthropic
            return anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
        except:
            return None
    except Exception as e:
        print(f"Error initializing Anthropic client: {e}")
        return None

def extract_relevant_context(user_message):
    """Extract relevant sections from knowledge base based on user message"""
    if not KNOWLEDGE_BASE:
        return ""

    message_lower = user_message.lower()
    relevant_sections = []

    # Check each response category for keyword matches
    for category, data in KNOWLEDGE_BASE.get('responses', {}).items():
        if 'keywords' in data:
            for keyword in data['keywords']:
                if re.search(r'\b' + re.escape(keyword) + r'\b', message_lower):
                    relevant_sections.append({
                        'category': category,
                        'response': data['response']
                    })
                    break

    # If no specific match, include general library info
    if not relevant_sections:
        relevant_sections.append({
            'category': 'general',
            'library_info': KNOWLEDGE_BASE.get('libraryInfo', {}),
            'hours': KNOWLEDGE_BASE.get('hours', {}),
            'facilities': KNOWLEDGE_BASE.get('facilities', {})
        })

    # Format context for LLM
    context_text = "=== NUK LIBRARY KNOWLEDGE BASE ===\n\n"

    # Always include basic info
    library_info = KNOWLEDGE_BASE.get('libraryInfo', {})
    if library_info:
        context_text += f"LOCATION: {library_info.get('location', {}).get('address', '')}\n"
        context_text += f"CONTACT: Phone: {library_info.get('contact', {}).get('phone', '')} | Email: {library_info.get('contact', {}).get('email', '')}\n\n"

    hours_info = KNOWLEDGE_BASE.get('hours', {})
    if hours_info:
        context_text += "HOURS:\n"
        context_text += f"Library: {hours_info.get('library', {}).get('weekdays', '')} | {hours_info.get('library', {}).get('holiday', '')}\n"
        context_text += f"Cowork/Study: {hours_info.get('coworkStudy', {}).get('weekdays', '')} | Weekends: {hours_info.get('coworkStudy', {}).get('weekends', '')}\n\n"

    # Add relevant sections
    for section in relevant_sections:
        if 'response' in section:
            context_text += f"{section['category'].upper()}:\n{section['response']}\n\n"

    # Add membership info if relevant
    if any(keyword in message_lower for keyword in ['membership', 'plan', 'price', 'cost', 'fee']):
        membership = KNOWLEDGE_BASE.get('membership', {})
        if membership:
            context_text += "MEMBERSHIP PLANS:\n"
            for plan_key, plan_data in membership.items():
                if isinstance(plan_data, dict) and 'name' in plan_data:
                    context_text += f"{plan_data['name']}: {plan_data.get('pricing', {})}\n"

    # Add cowork pricing if relevant
    if any(keyword in message_lower for keyword in ['cowork', 'desk', 'workspace', 'study']):
        cowork = KNOWLEDGE_BASE.get('coworkPricing', {})
        if cowork:
            context_text += "\nCOWORK/STUDY SPACE PRICING:\n"
            for desk_type, desk_data in cowork.items():
                if isinstance(desk_data, dict) and 'name' in desk_data:
                    context_text += f"{desk_data['name']}: {desk_data.get('pricing', {})}\n"

    return context_text

def detect_book_query(user_message):
    """Detect if the message is asking about books"""
    book_patterns = [
        r'do you have.*book',
        r'show me.*book',
        r'books? (on|about|by)',
        r'search.*book',
        r'catalogue',
        r'catalog',
        r'find.*book',
        r'looking for.*book',
        r'any.*books',
    ]

    message_lower = user_message.lower()
    return any(re.search(pattern, message_lower, re.IGNORECASE) for pattern in book_patterns)

def call_llm(user_message, conversation_history=None, context=""):
    """Call Anthropic Claude API to generate response"""
    client = get_anthropic_client()

    if not client:
        # Fallback to rule-based response
        return fallback_response(user_message), "fallback"

    try:
        # Build system prompt
        system_prompt = f"""You are Nuk Assistant, the AI-powered chatbot for Nuk Library, a community library in Bengaluru, India.

YOUR ROLE:
- Help visitors and members with library information
- Answer questions about memberships, pricing, facilities
- Guide users to search our 10,000+ book catalog
- Provide information about cowork and study spaces
- Give directions and contact information

GUIDELINES:
1. Be warm, friendly, and professional
2. Keep responses concise (under 250 words)
3. Use emojis sparingly for readability (⏰ 📍 📚 💼)
4. Format important information with bullet points or line breaks
5. If users ask about specific books in our collection, acknowledge and suggest they use the book search
6. Stay focused on library-related topics
7. If you don't know something, admit it and offer contact info for staff
8. Include relevant contact info when helpful

KNOWLEDGE BASE:
{context}

Provide a helpful, accurate response based on the knowledge base."""

        # Build messages array
        messages = []

        # Add conversation history if provided
        if conversation_history:
            for msg in conversation_history[-6:]:  # Last 6 messages (3 turns)
                messages.append({
                    "role": msg.get("role"),
                    "content": msg.get("content")
                })

        # Add current user message
        messages.append({
            "role": "user",
            "content": user_message
        })

        # Call Claude API
        response = client.messages.create(
            model="claude-3-5-haiku-20241022",  # Claude 3.5 Haiku
            max_tokens=500,
            system=system_prompt,
            messages=messages
        )

        # Extract response text
        response_text = response.content[0].text

        return response_text, "claude-3-5-haiku"

    except Exception as e:
        print(f"Error calling LLM: {e}")
        return fallback_response(user_message), "fallback_error"

def fallback_response(user_message):
    """Fallback to rule-based response if LLM fails"""
    if not KNOWLEDGE_BASE:
        return "I'm currently experiencing technical difficulties. Please call us at +91 725 952 8336 or email sridhar@mynuk.com for assistance."

    message_lower = user_message.lower()

    # Check for keyword matches in knowledge base
    for category, data in KNOWLEDGE_BASE.get('responses', {}).items():
        if 'keywords' in data and 'response' in data:
            for keyword in data['keywords']:
                if re.search(r'\b' + re.escape(keyword) + r'\b', message_lower):
                    return data['response']

    # Return fallback message
    return KNOWLEDGE_BASE.get('fallback', "I can help you with information about our library, memberships, cowork space, and more. What would you like to know?")

@chatbot_bp.route('/conversation', methods=['POST'])
def chatbot_conversation():
    """Main chatbot conversation endpoint"""
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        conversation_history = data.get('conversation_history', [])

        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        # Check if this is a book search query
        is_book_query = detect_book_query(user_message)

        if is_book_query:
            # Return flag to frontend to handle book search
            return jsonify({
                "response": None,
                "is_book_search": True,
                "context_used": ["book_search"],
                "model": "book_search_detection"
            }), 200

        # Extract relevant context from knowledge base
        context = extract_relevant_context(user_message)

        # Call LLM to generate response
        response_text, model_used = call_llm(user_message, conversation_history, context)

        return jsonify({
            "response": response_text,
            "is_book_search": False,
            "context_used": ["knowledge_base"],
            "model": model_used,
            "timestamp": datetime.utcnow().isoformat()
        }), 200

    except Exception as e:
        print(f"Error in chatbot conversation: {e}")
        return jsonify({
            "error": "An error occurred processing your message",
            "response": fallback_response(data.get('message', '')),
            "model": "error_fallback"
        }), 500

@chatbot_bp.route('/health', methods=['GET'])
def chatbot_health():
    """Health check endpoint for chatbot service"""
    client = get_anthropic_client()

    return jsonify({
        "status": "healthy",
        "llm_available": client is not None,
        "knowledge_base_loaded": KNOWLEDGE_BASE is not None,
        "timestamp": datetime.utcnow().isoformat()
    }), 200
