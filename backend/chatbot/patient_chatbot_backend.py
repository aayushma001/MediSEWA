"""
Patient AI Assistant Backend for MediSEWA
Provides patients with easy-to-understand health information, appointment booking assistance,
and emergency guidance.
"""

from typing import List, Dict, Optional, Any
from datetime import datetime
import os
import json
from dotenv import load_dotenv

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

# Load environment variables
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

class PatientKnowledgeBase:
    """
    Manages the patient-facing knowledge base.
    Contains simplified medical info, hospital booking procedures, and emergency guides.
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=api_key
        )
        self.vectorstore = None
        self.initialize_knowledge_base()
    
    def initialize_knowledge_base(self):
        """Initialize with patient-centric documents"""
        
        patient_documents = [
            # Emergency Protocols (User Provided)
            Document(
                page_content="""
                EMERGENCY MEDICAL ASSISTANCE - What to Do:
                
                🚨 FOR LIFE-THREATENING EMERGENCIES:
                - Call 102 (Nepal Emergency Ambulance) IMMEDIATELY
                - Call 103 (Nepal Police) if needed
                - Go to nearest emergency room
                
                FOR URGENT MEDICAL CARE (Non-life-threatening):
                
                Option 1: EMERGENCY BOOKING (NO LOGIN REQUIRED!)
                - Click "Emergency Appointment" on MediSEWA homepage
                - Select your symptoms or condition
                - Choose nearest hospital
                - Get INSTANT booking confirmation
                - Receive PRIORITY treatment at hospital
                - No waiting in regular queues!
                - Register account later to access records
                
                Option 2: LOGIN AS PATIENT (If you have account)
                - Login to your MediSEWA account
                - Go to "Book Appointment" 
                - Select "Emergency Booking"
                - Your medical history is instantly available to doctors
                - Faster check-in and treatment
                - Allergies and medications already on file
                - Safer emergency care
                
                Nearest Emergency Hospitals in Kathmandu:
                📍 Norvic International Hospital - Thapathali
                📍 Grande International Hospital - Dhapasi
                📍 Mediciti Hospital - Bhaisepati
                📍 HAMS Hospital - Dhumbarahi
                📍 Tribhuvan University Teaching Hospital - Maharajgunj
                
                WHAT QUALIFIES AS EMERGENCY:
                - Severe chest pain or pressure
                - Difficulty breathing
                - Sudden severe headache
                - Loss of consciousness
                - Severe bleeding
                - High fever (above 103°F/39.4°C)
                - Severe allergic reaction
                - Broken bones
                - Severe burns
                - Poisoning
                - Severe accidents or injuries
                
                URGENT BUT NOT EMERGENCY (Book regular appointment):
                - Mild fever
                - Common cold or flu
                - Minor cuts or bruises
                - Routine check-ups
                - Prescription refills
                - Follow-up consultations
                
                Remember: 
                - Emergency booking = NO login required
                - Login booking = Medical history instantly available (safer!)
                - Both options give you priority treatment
                - Call 102 for ambulance if you cannot travel
                
                MediSEWA saves lives by giving doctors instant access to your medical history!
                """,
                metadata={"category": "emergency", "type": "protocol"}
            ),
            
            # MediSEWA Features
            Document(
                page_content="""
                About MediSEWA:
                MediSEWA is a comprehensive healthcare platform connecting patients with hospitals and doctors.
                
                Key Features for Patients:
                - Book Appointments: Schedule visits with specialists or general practitioners.
                - Digital Health Records: Access your consultation reports, lab results, and prescriptions anytime.
                - QR Code ID: Show your unique QR code at hospitals for instant check-in.
                - Medication Reminders: Get alerts for your prescriptions.
                - Health Vitals Tracking: Log and monitor your blood pressure, glucose, and more.
                - Telemedicine: Video consults coming soon!
                
                How to Book:
                1. Login to your dashboard.
                2. Click "Book Appointment".
                3. Choose Department and Doctor.
                4. Select Date and Time.
                5. Confirm Booking.
                """,
                metadata={"category": "platform_info", "topic": "features"}
            ),
            
            # General Health - Common Conditions
            Document(
                page_content="""
                Common Cold & Flu Tips:
                - Rest and hydration are key.
                - Symptoms: Runny nose, sore throat, cough, mild mild fever.
                - Home care: Warm fluids, salt water gargle, honey for cough.
                - When to see a doctor: High fever, trouble breathing, or symptoms last >1 week.
                
                Diabetes Basics:
                - A condition where blood sugar is too high.
                - Management: Healthy diet (low sugar/carbs), regular exercise, medication (Metformin/Insulin) as prescribed.
                - Warning signs: Excessive thirst, frequent urination, blurred vision.
                
                Hypertension (High Blood Pressure):
                - "Silent Killer" - often has no symptoms.
                - Management: Low sodium diet, exercise, stress reduction, medication.
                - Regular checks are important!
                """,
                metadata={"category": "general_health", "topic": "common_conditions"}
            ),
             Document(
                page_content="""
                Understanding Your Prescriptions:
                
                Prescription Information:
                - Drug Name: The active ingredient (e.g., Amoxicillin).
                - Dosage: How much to take (e.g., 500mg).
                - Frequency: How often (e.g., twice daily).
                - Duration: How long to take it (e.g., 7 days).
                
                Safety Tips:
                - Always finish the full course of antibiotics even if you feel better.
                - Take with water unless specified otherwise.
                - Check if it should be taken with or without food.
                - Ask your doctor about side effects.
                """,
                metadata={"category": "medication", "topic": "safety"}
            ),
        ]
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=100
        )
        splits = text_splitter.split_documents(patient_documents)
        self.vectorstore = FAISS.from_documents(splits, self.embeddings)
        print(f"✓ Patient knowledge base initialized with {len(splits)} chunks")

    def retrieve_relevant_knowledge(self, query: str, k: int = 3) -> List[Document]:
        if not self.vectorstore:
            return []
        return self.vectorstore.similarity_search(query, k=k)

class PatientAIAssistant:
    """
    AI Assistant for Patients.
    Focuses on empathy, clear communication, and guiding users to professional care.
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-flash-latest",
            google_api_key=api_key,
            temperature=0.4,
            max_output_tokens=1024,
        )
        self.knowledge_base = PatientKnowledgeBase(api_key)
        
        self.system_prompt = """You are MediSEWA's friendly AI Health Assistant for patients.
        
        **YOUR ROLE**:
        - Help patients navigate the MediSEWA platform (booking, records, etc.).
        - Provide general, easy-to-understand health information.
        - Guide patients during emergencies (calling 102/103, using Emergency Booking).
        - Explain medical terms in simple language.
        
        **CRITICAL SAFETY RULES**:
        1. **NOT A DOCTOR**: You are an AI, not a doctor. NEVER diagnose conditions or prescribe medication.
           - Instead of "You have the flu," say "These symptoms are often associated with the flu, but please see a doctor for a diagnosis."
        2. **EMERGENCIES**: If a user mentions severe pain, difficulty breathing, or trauma, IMMEDIATELY tell them to call emergency services (102) or go to the hospital. Use the "EMERGENCY MEDICAL ASSISTANCE" protocols.
        3. **MEDICATION**: Do not change dosages. Advise patients to follow their doctor's prescription.
        
        **RESPONSE STYLE**:
        - Friendly, empathetic, and professional.
        - Use emojis occasionally to be approachable (e.g., 🏥, 💊, 👋).
        - Keep answers concise and helpful.
        
        **CONTEXT**:
        Use the retrieved information below to answer user questions regarding MediSEWA features, emergency procedures, or general health tips.
        
        Retrieved Knowledge:
        {context}
        """

        self.prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{question}")
        ])
        
        self.chain = (
            {
                "context": lambda x: self._format_docs(
                    self.knowledge_base.retrieve_relevant_knowledge(x["question"])
                ),
                "question": lambda x: x["question"],
                "chat_history": lambda x: x["chat_history"]
            }
            | self.prompt
            | self.llm
            | StrOutputParser()
        )
    
    def _format_docs(self, docs: List[Document]) -> str:
        return "\n\n".join([d.page_content for d in docs]) if docs else "No specific knowledge found."

    def chat(self, user_message: str, chat_history: List[Dict[str, str]] = None, patient_context: Dict = None) -> Dict[str, Any]:
        if chat_history is None:
            chat_history = []
        
        # Convert to LangChain format
        lc_history = []
        for msg in chat_history:
            if msg["role"] == "user":
                lc_history.append(HumanMessage(content=msg["content"]))
            else:
                lc_history.append(AIMessage(content=msg["content"]))
        
        try:
            response = self.chain.invoke({
                "question": user_message,
                "chat_history": lc_history
            })
            
            return {
                "response": response,
                "timestamp": datetime.now().isoformat(),
                "suggestions": self._generate_suggestions(user_message)
            }
        except Exception as e:
            return {
                "response": "I'm having trouble connecting right now. Please try again later. 😓",
                "error": str(e)
            }

    def _generate_suggestions(self, query: str) -> List[str]:
        q = query.lower()
        if "emergency" in q or "pain" in q or "urgent" in q:
            return ["Call 102 (Ambulance)", "Find nearest hospital", "Emergency Booking"]
        elif "book" in q or "appointment" in q:
            return ["View Doctors", "Check Availability", "My Appointments"]
        elif "medicine" in q or "prescription" in q:
            return ["View Prescriptions", "Medication Reminders", "Refill Request"]
        else:
            return ["Book Appointment", "Check Vitals", "Emergency Help"]

if __name__ == "__main__":
    print("MediSEWA Patient Assistant Initialized")