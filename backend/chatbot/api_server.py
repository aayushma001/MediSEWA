"""
Flask API Server for Medical AI Assistant
Provides REST endpoints for the React frontend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from doctor_chatbot_backend import MedicalAIAssistant
from patient_chatbot_backend import PatientAIAssistant
import os
from dotenv import load_dotenv
from typing import Dict, List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize the AI assistants
try:
    medical_assistant = MedicalAIAssistant(api_key)
    logger.info("✓ Medical AI Assistant (Doctor) initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Medical AI Assistant: {e}")
    medical_assistant = None

try:
    patient_assistant = PatientAIAssistant(api_key)
    logger.info("✓ Patient AI Assistant initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Patient AI Assistant: {e}")
    patient_assistant = None


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "MediSEWA AI Assistant API",
        "doctor_assistant_ready": medical_assistant is not None,
        "patient_assistant_ready": patient_assistant is not None
    }), 200


@app.route('/api/doctor-chatbot', methods=['POST'])
def chat():
    """
    Main chatbot endpoint
    
    Expected JSON payload:
    {
        "message": "What is the dosing for amoxicillin?",
        "doctorId": "doctor_123",
        "context": [
            {"sender": "user", "text": "previous message", "timestamp": "..."},
            {"sender": "ai", "text": "previous response", "timestamp": "..."}
        ]
    }
    
    Returns:
    {
        "response": "AI response text",
        "timestamp": "ISO timestamp",
        "sources": [...],
        "suggestions": [...]
    }
    """
    if not medical_assistant:
        return jsonify({
            "error": "Medical AI Assistant not initialized",
            "response": "Service temporarily unavailable. Please try again later."
        }), 503
    
    try:
        # Parse request
        data = request.json
        message = data.get('message', '').strip()
        doctor_id = data.get('doctorId')
        context = data.get('context', [])
        
        # Validate input
        if not message:
            return jsonify({
                "error": "Message is required",
                "response": "Please provide a message."
            }), 400
        
        # Convert context to chat history format
        chat_history = []
        for msg in context:
            role = "user" if msg.get("sender") == "user" else "assistant"
            content = msg.get("text", "")
            if content:
                chat_history.append({"role": role, "content": content})
        
        # Log the request
        logger.info(f"Processing request from doctor {doctor_id}: {message[:100]}...")
        
        # Get AI response
        result = medical_assistant.chat(
            user_message=message,
            chat_history=chat_history,
            doctor_context={"doctor_id": doctor_id}
        )
        
        # Log success
        logger.info(f"Response generated successfully for doctor {doctor_id}")
        
        return jsonify(result), 200
    
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "response": "I apologize, but I encountered an error processing your request. Please try again.",
            "details": str(e) if app.debug else None
        }), 500


@app.route('/api/patient-chatbot', methods=['POST'])
def patient_chat():
    """
    Patient chatbot endpoint for MediSEWA information and general health guidance
    
    Expected JSON payload:
    {
        "message": "What is MediSEWA?",
        "patientId": "patient_123",
        "context": [...]
    }
    """
    if not patient_assistant:
        return jsonify({
            "error": "Patient AI Assistant not initialized",
            "response": "Service temporarily unavailable. Please try again later."
        }), 503
    
    try:
        data = request.json
        message = data.get('message', '').strip()
        patient_id = data.get('patientId')
        context = data.get('context', [])
        
        if not message:
            return jsonify({
                "error": "Message is required",
                "response": "Please provide a message."
            }), 400
        
        # Convert context to chat history
        chat_history = []
        for msg in context:
            role = "user" if msg.get("sender") == "user" else "assistant"
            content = msg.get("text", "")
            if content:
                chat_history.append({"role": role, "content": content})
        
        logger.info(f"Processing patient request from {patient_id}: {message[:100]}...")
        
        result = patient_assistant.chat(
            user_message=message,
            chat_history=chat_history,
            patient_context={"patient_id": patient_id}
        )
        
        logger.info(f"Response generated for patient {patient_id}")
        return jsonify(result), 200
    
    except Exception as e:
        logger.error(f"Error processing patient chat: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "response": "I apologize, but I encountered an error. Please contact support@medisewa.com.np.",
            "details": str(e) if app.debug else None
        }), 500


@app.route('/api/doctor-chatbot/suggestions', methods=['POST'])
def get_suggestions():
    """
    Get quick action suggestions based on context
    
    Expected JSON:
    {
        "context": "recent conversation context",
        "category": "prescriptions" | "diagnostics" | "guidelines" | null
    }
    """
    try:
        data = request.json
        context = data.get('context', '')
        category = data.get('category')
        
        # Generate context-aware suggestions
        suggestions = {
            "prescriptions": [
                "Write prescription for common antibiotic",
                "Check drug interactions",
                "Review dosing guidelines",
                "Generate prescription template"
            ],
            "diagnostics": [
                "Interpret lab values",
                "Review diagnostic criteria",
                "Differential diagnosis help",
                "Recommend diagnostic tests"
            ],
            "guidelines": [
                "Hypertension management",
                "Diabetes guidelines",
                "Anticoagulation protocols",
                "Pneumonia treatment"
            ],
            "general": [
                "Drug information lookup",
                "Treatment guidelines",
                "Drug interaction check",
                "Lab value interpretation"
            ]
        }
        
        result = suggestions.get(category, suggestions["general"])
        
        return jsonify({
            "suggestions": result,
            "category": category or "general"
        }), 200
    
    except Exception as e:
        logger.error(f"Error getting suggestions: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/doctor-chatbot/knowledge/search', methods=['POST'])
def search_knowledge():
    """
    Direct search in medical knowledge base
    
    Expected JSON:
    {
        "query": "amoxicillin dosing",
        "limit": 5
    }
    """
    if not medical_assistant:
        return jsonify({"error": "Service unavailable"}), 503
    
    try:
        data = request.json
        query = data.get('query', '').strip()
        limit = data.get('limit', 5)
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
        
        # Search knowledge base
        docs = medical_assistant.knowledge_base.retrieve_relevant_knowledge(query, k=limit)
        
        # Format results
        results = [
            {
                "content": doc.page_content,
                "metadata": doc.metadata,
                "source_id": i
            }
            for i, doc in enumerate(docs)
        ]
        
        return jsonify({
            "query": query,
            "results": results,
            "count": len(results)
        }), 200
    
    except Exception as e:
        logger.error(f"Error searching knowledge base: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/doctor-chatbot/reset', methods=['POST'])
def reset_conversation():
    """Reset conversation context (if needed for session management)"""
    data = request.json
    doctor_id = data.get('doctorId')
    
    logger.info(f"Conversation reset requested for doctor {doctor_id}")
    
    return jsonify({
        "status": "success",
        "message": "Conversation context cleared"
    }), 200


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    print("\n" + "="*80)
    print("🏥 MediSEWA AI Assistant API Server")
    print("="*80)
    print(f"Doctor Assistant: {'✓ Ready' if medical_assistant else '✗ Not initialized'}")
    print(f"Patient Assistant: {'✓ Ready' if patient_assistant else '✗ Not initialized'}")
    print("\nEndpoints:")
    print("  POST /api/doctor-chatbot          - Doctor medical assistant")
    print("  POST /api/patient-chatbot         - Patient MediSEWA assistant")
    print("  POST /api/doctor-chatbot/suggestions - Get suggestions")
    print("  POST /api/doctor-chatbot/knowledge/search - Search knowledge base")
    print("  POST /api/doctor-chatbot/reset    - Reset conversation")
    print("  GET  /health                       - Health check")
    print("="*80)
    port = int(os.getenv('PORT', 5000))  # Cloud Run sets PORT
    print(f"Starting server on http://localhost:{port}")
    print("="*80 + "\n")
    
    app.run(debug=False, host='0.0.0.0', port=port)