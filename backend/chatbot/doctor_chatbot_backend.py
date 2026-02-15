"""
Advanced Medical AI Assistant Backend with RAG System
Provides doctors with intelligent assistance for medical queries, drug interactions,
prescriptions, and patient care recommendations.
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
from langchain_core.runnables import RunnablePassthrough
from langchain_core.documents import Document

# Load environment variables
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

# ============================================================================
# RAG KNOWLEDGE BASE SETUP
# ============================================================================

class MedicalKnowledgeBase:
    """
    Manages the medical knowledge base using RAG (Retrieval-Augmented Generation).
    In production, load from actual medical databases, drug databases, and clinical guidelines.
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
        """
        Initialize the vector database with medical knowledge.
        In production, replace with actual medical databases:
        - Drug interaction databases (DrugBank, FDA databases)
        - Clinical guidelines (UpToDate, clinical protocols)
        - Disease information (ICD-10, medical references)
        - Treatment protocols
        """
        
        # Sample medical knowledge (Replace with real medical database)
        medical_documents = [
            # Drug Information
            Document(
                page_content="""
                Amoxicillin: Beta-lactam antibiotic used for bacterial infections.
                Dosage: Adults: 500mg every 8 hours or 875mg every 12 hours for 7-10 days.
                Pediatric: 20-40 mg/kg/day divided every 8 hours.
                Contraindications: Penicillin allergy, infectious mononucleosis.
                Side effects: Nausea, diarrhea, rash, allergic reactions.
                Drug interactions: Reduces effectiveness of oral contraceptives, interacts with methotrexate.
                """,
                metadata={"category": "antibiotics", "drug_name": "amoxicillin", "class": "beta-lactam"}
            ),
            Document(
                page_content="""
                Metformin: First-line medication for Type 2 Diabetes Mellitus.
                Dosage: Start 500mg once or twice daily with meals, titrate to 2000mg/day maximum.
                Extended-release: 500-2000mg once daily with evening meal.
                Contraindications: Severe renal impairment (eGFR <30), metabolic acidosis, dehydration.
                Side effects: GI upset (nausea, diarrhea), metallic taste, vitamin B12 deficiency (long-term).
                Monitoring: Check renal function annually, vitamin B12 every 2-3 years.
                Drug interactions: Contrast dye (hold 48hrs before), alcohol (lactic acidosis risk).
                """,
                metadata={"category": "diabetes", "drug_name": "metformin", "class": "biguanide"}
            ),
            Document(
                page_content="""
                Lisinopril: ACE inhibitor for hypertension and heart failure.
                Dosage: Hypertension: Start 10mg once daily, max 40mg/day.
                Heart failure: Start 5mg once daily, titrate to 20-40mg/day.
                Contraindications: Pregnancy, angioedema history, bilateral renal artery stenosis.
                Side effects: Dry cough (10-15%), hyperkalemia, dizziness, angioedema (rare).
                Monitoring: Check potassium and creatinine 1-2 weeks after initiation/dose changes.
                Drug interactions: NSAIDs (reduce effect, worsen renal function), potassium supplements.
                """,
                metadata={"category": "cardiovascular", "drug_name": "lisinopril", "class": "ACE-inhibitor"}
            ),
            
            # Clinical Guidelines
            Document(
                page_content="""
                Hypertension Management Guidelines (2023):
                - Target BP: <130/80 mmHg for most adults, <130/80 for diabetes/CKD
                - Stage 1 (130-139/80-89): Lifestyle + medication if CV risk >10%
                - Stage 2 (≥140/90): Lifestyle + 2 medications
                - First-line: ACE-I/ARB, CCB, thiazide diuretics
                - Follow-up: Monthly until controlled, then every 3-6 months
                - Lifestyle: DASH diet, <2.3g sodium, exercise 150min/week, weight loss if BMI >25
                """,
                metadata={"category": "guidelines", "condition": "hypertension"}
            ),
            Document(
                page_content="""
                Type 2 Diabetes Management:
                - Diagnosis: HbA1c ≥6.5%, FPG ≥126 mg/dL, or 2hr OGTT ≥200 mg/dL
                - Target: HbA1c <7% (individualize based on age, comorbidities)
                - First-line: Metformin + lifestyle (diet, exercise, weight loss)
                - If HbA1c remains >7%: Add SGLT2-i (CV/renal benefits) or GLP-1 RA
                - Monitoring: HbA1c every 3 months until stable, then every 6 months
                - Annual: Eye exam, foot exam, urine albumin/creatinine, lipid panel
                - Lifestyle: Mediterranean/low-carb diet, 150min moderate exercise/week
                """,
                metadata={"category": "guidelines", "condition": "diabetes"}
            ),
            Document(
                page_content="""
                Acute Pharyngitis Management:
                - Assess for Group A Streptococcus (GAS) using Centor criteria
                - Centor 0-1: Viral likely, symptomatic treatment only
                - Centor 2-3: Consider rapid antigen test or throat culture
                - Centor 4: Treat empirically for strep throat
                - Treatment: Penicillin V 500mg PO BID x10 days or Amoxicillin 500mg TID x10 days
                - Alternative (PCN allergy): Azithromycin 500mg day 1, then 250mg days 2-5
                - Symptomatic: NSAIDs, throat lozenges, warm salt water gargles
                """,
                metadata={"category": "guidelines", "condition": "pharyngitis"}
            ),
            
            # Drug Interactions
            Document(
                page_content="""
                Warfarin Drug Interactions (Critical):
                - Antibiotics: Many increase INR (macrolides, fluoroquinolones, metronidazole) - monitor INR closely
                - NSAIDs/Aspirin: Increase bleeding risk significantly - avoid or use PPI
                - Amiodarone: Decreases warfarin clearance - reduce warfarin dose 30-50%
                - St. John's Wort: Decreases warfarin effect - avoid
                - Vitamin K-rich foods: Decrease warfarin effect - maintain consistent intake
                - Alcohol: Acute increases INR, chronic decreases - counsel moderation
                Action: Check INR 3-5 days after starting/stopping interacting medications
                """,
                metadata={"category": "drug_interactions", "primary_drug": "warfarin", "severity": "critical"}
            ),
            Document(
                page_content="""
                Statin Drug Interactions:
                - Gemfibrozil + any statin: Severe myopathy risk - avoid combination
                - Macrolides (clarithromycin, erythromycin) + simvastatin/lovastatin: Myopathy risk - avoid or use low-dose atorvastatin
                - Azole antifungals + statins: Increase statin levels - use low dose or rosuvastatin
                - Grapefruit juice: Increases simvastatin/lovastatin/atorvastatin levels - avoid or switch to pravastatin/rosuvastatin
                - Amiodarone + simvastatin: Max simvastatin 20mg/day
                Monitoring: Check CK if muscle pain/weakness, monitor LFTs at baseline and PRN
                """,
                metadata={"category": "drug_interactions", "primary_drug": "statins", "severity": "moderate-high"}
            ),
            
            # Prescription Templates
            Document(
                page_content="""
                Prescription Writing Best Practices:
                - Patient: Full name, DOB, address
                - Date of prescription
                - Drug name (generic preferred): Capitalize first letter
                - Strength: Include units (mg, mcg, mL)
                - Dosage form: Tablet, capsule, solution, etc.
                - Quantity: Numeric and written out
                - Directions (Sig): Clear, in plain language (not abbreviations)
                - Refills: Number or "0" if none
                - DAW (Dispense as Written): If brand required
                - Prescriber signature, DEA# (if controlled), NPI
                Example: "Amoxicillin 500mg capsules. Quantity: 21 (twenty-one). Sig: Take one capsule by mouth three times daily for 7 days. Refills: 0"
                """,
                metadata={"category": "prescriptions", "type": "template"}
            ),
        ]
        
        # Add more documents for comprehensive coverage
        additional_docs = self._generate_additional_medical_knowledge()
        medical_documents.extend(additional_docs)
        
        # Create text splitter for longer documents
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=100,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        
        splits = text_splitter.split_documents(medical_documents)
        
        # Create vector store
        self.vectorstore = FAISS.from_documents(splits, self.embeddings)
        print(f"✓ Knowledge base initialized with {len(splits)} document chunks")
    
    def _generate_additional_medical_knowledge(self) -> List[Document]:
        """Generate additional medical knowledge documents"""
        return [
            Document(
                page_content="""
                Common Lab Value Interpretations:
                - Hemoglobin: Normal Male 13.5-17.5 g/dL, Female 12-15.5 g/dL. Low: Anemia. High: Polycythemia.
                - WBC: Normal 4,500-11,000/μL. Low: Immunosuppression. High: Infection/inflammation.
                - Platelets: Normal 150,000-400,000/μL. Low <150k: Thrombocytopenia. High >400k: Thrombocytosis.
                - Creatinine: Normal Male 0.7-1.3, Female 0.6-1.1 mg/dL. High: Reduced renal function.
                - eGFR: >60 normal. 45-59 mild decrease. 30-44 moderate. 15-29 severe. <15 kidney failure.
                - HbA1c: <5.7% normal, 5.7-6.4% prediabetes, ≥6.5% diabetes
                - TSH: Normal 0.4-4.0 mIU/L. Low: Hyperthyroid. High: Hypothyroid.
                """,
                metadata={"category": "lab_values", "type": "reference"}
            ),
            Document(
                page_content="""
                Pneumonia Management:
                - Diagnosis: Fever, cough, dyspnea + infiltrate on CXR
                - Severity assessment: CURB-65 or PSI score
                - Outpatient: Healthy - Amoxicillin 1g TID or doxycycline 100mg BID x5-7d
                - Outpatient: Comorbidities - Amoxicillin-clavulanate + macrolide or respiratory FQ
                - Inpatient non-ICU: Ceftriaxone + azithromycin or respiratory FQ
                - ICU: Beta-lactam (ceftriaxone/cefotaxime) + azithromycin or FQ
                - Duration: Minimum 5 days, afebrile 48-72hrs, clinically stable
                - Follow-up CXR: 6-8 weeks in smokers/high-risk patients
                """,
                metadata={"category": "guidelines", "condition": "pneumonia"}
            ),
            Document(
                page_content="""
                Anticoagulation for Atrial Fibrillation:
                - Risk stratification: CHA2DS2-VASc score (≥2 men, ≥3 women = anticoagulate)
                - First-line: DOACs (apixaban, rivaroxaban, edoxaban, dabigatran)
                - Apixaban: 5mg BID (2.5mg if 2/3: age≥80, wt≤60kg, Cr≥1.5)
                - Rivaroxaban: 20mg daily with evening meal (15mg if CrCl 15-50)
                - Warfarin: If mechanical valve, severe CKD (CrCl<15), or mitral stenosis. Target INR 2-3.
                - Bleeding risk: HAS-BLED score - but don't avoid anticoagulation based on this alone
                - Monitoring: DOACs - annual renal function, CBC. Warfarin - INR every 4 weeks when stable
                """,
                metadata={"category": "guidelines", "condition": "atrial_fibrillation"}
            ),
        ]
    
    def retrieve_relevant_knowledge(self, query: str, k: int = 4) -> List[Document]:
        """Retrieve relevant medical knowledge for a query"""
        if not self.vectorstore:
            return []
        return self.vectorstore.similarity_search(query, k=k)


# ============================================================================
# MEDICAL AI ASSISTANT
# ============================================================================

class MedicalAIAssistant:
    """
    Advanced AI Assistant for Medical Professionals with RAG capabilities
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        
        # Initialize LLM
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-flash-latest",
            google_api_key=api_key,
            temperature=0.3,  # Lower temperature for medical accuracy
            max_output_tokens=1024,
        )
        
        # Initialize knowledge base
        self.knowledge_base = MedicalKnowledgeBase(api_key)
        
        # System prompt for medical context
        self.system_prompt = """You are a specialized medical AI assistant EXCLUSIVELY for healthcare professionals.

**CRITICAL RESTRICTION - SCOPE OF ASSISTANCE**:
You ONLY answer medical and healthcare-related questions. Your expertise is limited to:
- Medications (drugs, dosing, contraindications, side effects)
- Drug interactions and safety concerns
- Clinical guidelines and treatment protocols
- Differential diagnoses and diagnostic approaches
- Lab values and test interpretations
- Prescription writing and medical documentation
- Medical procedures and clinical practices
- Patient care and treatment planning
- Medical terminology and concepts

**NON-MEDICAL QUESTIONS**:
If asked about non-medical topics (geography, history, entertainment, general knowledge, mathematics, coding, etc.), you MUST respond with:
"I'm a specialized medical assistant for healthcare professionals. I can only answer medical and clinical questions. Please ask me about medications, treatments, diagnoses, lab values, clinical guidelines, or patient care."

Do NOT answer questions like:
- "What is the capital of Nepal?" → Decline (geography)
- "Who won the World Cup?" → Decline (sports)
- "How to code in Python?" → Decline (programming)
- "What's 2+2?" → Decline (general math not related to dosing)

ONLY answer if the question is clearly related to medicine, healthcare, or clinical practice.

---

**YOUR CORE RESPONSIBILITIES**:

1. **Provide Evidence-Based Medical Information**: Use the retrieved medical knowledge to give accurate, up-to-date information about:
   - Drug dosages, contraindications, and side effects
   - Drug interactions and safety concerns
   - Clinical guidelines and treatment protocols
   - Differential diagnoses and diagnostic approaches
   - Lab value interpretations
   - Medical procedures and best practices

2. **Assist with Clinical Decision-Making**: Help doctors make informed decisions by:
   - Suggesting appropriate treatment options based on guidelines
   - Highlighting important drug interactions or contraindications
   - Recommending relevant diagnostic tests
   - Providing differential diagnosis considerations
   - Offering evidence-based clinical recommendations

3. **Generate Professional Medical Documentation**: Help with:
   - Prescription writing with proper formatting
   - Clinical note suggestions
   - Patient education materials (medical content only)
   - Treatment plans and protocols

4. **Important Safety Guidelines**:
   - Always emphasize that final clinical decisions rest with the physician
   - Highlight critical drug interactions or contraindications prominently
   - Remind about allergy checks before prescribing
   - Note when immediate specialist consultation or emergency care is needed
   - Acknowledge limitations and recommend consulting specialized resources when appropriate

5. **Communication Style**:
   - Be concise but comprehensive
   - Use medical terminology appropriately (this is for healthcare professionals)
   - Organize information clearly (bullet points when appropriate)
   - Cite guidelines or evidence when relevant
   - Always include relevant clinical considerations
   - Stay strictly within medical/clinical scope

**Context**: You have access to a medical knowledge base that includes drug information, clinical guidelines, drug interactions, and treatment protocols. Use this information to provide accurate, evidence-based responses.

**Limitations**: You are an AI assistant tool for medical professionals. Always remind physicians to:
- Verify critical information with primary sources
- Consider individual patient factors
- Use clinical judgment
- Follow institutional protocols
- Check for drug allergies and patient-specific contraindications

Retrieved Medical Knowledge:
{context}

Provide your response based on the above knowledge and your medical training. Remember: ONLY answer medical/healthcare questions. Politely decline all other topics."""

        # Create the prompt template
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{question}")
        ])
        
        # Create the chain
        self.chain = (
            {
                "context": lambda x: self._format_retrieved_docs(
                    self.knowledge_base.retrieve_relevant_knowledge(x["question"])
                ),
                "question": lambda x: x["question"],
                "chat_history": lambda x: x["chat_history"]
            }
            | self.prompt
            | self.llm
            | StrOutputParser()
        )
    
    def _format_retrieved_docs(self, docs: List[Document]) -> str:
        """Format retrieved documents for context"""
        if not docs:
            return "No specific medical knowledge retrieved for this query."
        
        formatted = []
        for i, doc in enumerate(docs, 1):
            metadata_str = ", ".join([f"{k}: {v}" for k, v in doc.metadata.items()])
            formatted.append(f"[Reference {i}] ({metadata_str})\n{doc.page_content}\n")
        
        return "\n".join(formatted)
    
    def chat(self, 
             user_message: str, 
             chat_history: List[Dict[str, str]] = None,
             doctor_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Process a chat message with RAG-enhanced response
        
        Args:
            user_message: The doctor's message/query
            chat_history: Previous conversation history
            doctor_context: Optional context about the doctor (specialization, etc.)
        
        Returns:
            Dict with response and metadata
        """
        if chat_history is None:
            chat_history = []
        
        # Convert chat history to LangChain message format
        lc_chat_history = []
        for msg in chat_history:
            if msg["role"] == "user":
                lc_chat_history.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                lc_chat_history.append(AIMessage(content=msg["content"]))
        
        # Get response from the chain
        try:
            response = self.chain.invoke({
                "question": user_message,
                "chat_history": lc_chat_history
            })
            
            # Retrieve relevant docs for metadata
            relevant_docs = self.knowledge_base.retrieve_relevant_knowledge(user_message, k=3)
            
            return {
                "response": response,
                "timestamp": datetime.now().isoformat(),
                "sources": [
                    {
                        "category": doc.metadata.get("category", "general"),
                        "relevance_score": "high"  # Could add actual scoring
                    }
                    for doc in relevant_docs
                ],
                "suggestions": self._generate_suggestions(user_message, response)
            }
        
        except Exception as e:
            return {
                "response": f"I apologize, but I encountered an error processing your request. Please try rephrasing your question or contact support if the issue persists. Error: {str(e)}",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    def _generate_suggestions(self, query: str, response: str) -> List[str]:
        """Generate follow-up suggestions based on the conversation"""
        suggestions = []
        
        query_lower = query.lower()
        
        # Context-aware suggestions
        if "drug" in query_lower or "medication" in query_lower or "prescription" in query_lower:
            suggestions = [
                "Check for drug interactions",
                "Review dosing guidelines",
                "See contraindications",
                "Generate prescription template"
            ]
        elif "diagnosis" in query_lower or "symptom" in query_lower:
            suggestions = [
                "Review diagnostic criteria",
                "See treatment guidelines",
                "Check lab work recommendations",
                "View differential diagnosis"
            ]
        elif "lab" in query_lower or "test" in query_lower:
            suggestions = [
                "Interpret lab values",
                "Recommend follow-up tests",
                "See normal ranges",
                "Review clinical significance"
            ]
        else:
            suggestions = [
                "Drug information",
                "Treatment guidelines",
                "Drug interactions",
                "Prescription help"
            ]
        
        return suggestions[:4]  # Limit to 4 suggestions


# ============================================================================
# API INTERFACE (Flask/FastAPI Integration)
# ============================================================================

def create_chatbot_api():
    """
    Example function to create API endpoints
    Use with Flask or FastAPI
    """
    assistant = MedicalAIAssistant(api_key)
    
    # Example Flask endpoint structure
    """
    from flask import Flask, request, jsonify
    
    app = Flask(__name__)
    
    @app.route('/api/doctor-chatbot', methods=['POST'])
    def chat():
        data = request.json
        message = data.get('message')
        doctor_id = data.get('doctorId')
        context = data.get('context', [])
        
        # Convert context to chat_history format
        chat_history = [
            {"role": "user" if msg["sender"] == "user" else "assistant", 
             "content": msg["text"]}
            for msg in context
        ]
        
        response = assistant.chat(message, chat_history)
        return jsonify(response)
    """
    
    return assistant


# ============================================================================
# STANDALONE TESTING
# ============================================================================

if __name__ == "__main__":
    print("="*80)
    print("Medical AI Assistant - Interactive Testing")
    print("="*80)
    
    # Initialize assistant
    assistant = MedicalAIAssistant(api_key)
    
    # Test queries
    test_queries = [
        "What is the appropriate dosing for amoxicillin in an adult with sinusitis?",
        "What are the important drug interactions I should know about with warfarin?",
        "Can you help me write a prescription for metformin for a newly diagnosed type 2 diabetic?",
        "What are the current guidelines for treating community-acquired pneumonia in an outpatient setting?",
    ]
    
    print("\n🔬 Running test queries...\n")
    
    chat_history = []
    for query in test_queries:
        print(f"\n{'='*80}")
        print(f"DOCTOR: {query}")
        print(f"{'='*80}\n")
        
        result = assistant.chat(query, chat_history)
        print(f"AI ASSISTANT:\n{result['response']}\n")
        
        if result.get('suggestions'):
            print(f"💡 Suggestions: {', '.join(result['suggestions'])}")
        
        # Update chat history
        chat_history.append({"role": "user", "content": query})
        chat_history.append({"role": "assistant", "content": result['response']})
        
        print()
    
    print("="*80)
    print("✓ Testing complete!")
    print("="*80)