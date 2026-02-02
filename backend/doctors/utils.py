import os
import faiss
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.documents import Document
from langchain_core.embeddings import FakeEmbeddings # Using FakeEmbeddings to avoid extra cost/setup for now, or use GoogleGenerativeAIEmbeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from django.conf import settings

# Initialize Embeddings
# For persistent storage, we'd ideally use real embeddings. 
# Using Google's embeddings requires the API key.
def get_embeddings():
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return FakeEmbeddings(size=768)
    return GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=api_key)

class DoctorChatService:
    def __init__(self):
        self.api_key = os.environ.get("GOOGLE_API_KEY")
        if not self.api_key:
            print("WARNING: GOOGLE_API_KEY not found in environment.")
        
        # Initialize Gemini Model
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=self.api_key,
            temperature=0.3, # Lower temperature for more factual medical responses
            convert_system_message_to_human=True
        )

        # Vector Store Path
        self.vector_store_path = os.path.join(settings.BASE_DIR, "vector_store")
        self.embeddings = get_embeddings()
        
        # Initialize or Load Vector Store
        self.vector_store = self._initialize_vector_store()

    def _initialize_vector_store(self):
        try:
            if os.path.exists(self.vector_store_path) and os.path.exists(os.path.join(self.vector_store_path, "index.faiss")):
                return FAISS.load_local(
                    self.vector_store_path, 
                    self.embeddings, 
                    allow_dangerous_deserialization=True # Required for local loading
                )
        except Exception as e:
            print(f"Error loading vector store: {e}")
        
        # Create new if doesn't exist or failed to load
        # FAISS requires at least one item to initialize
        initial_doc = Document(page_content="System: Initialized Doctor Chat Memory", metadata={"source": "system"})
        index = faiss.IndexFlatL2(768) # Dimension matches embedding size
        return FAISS(
            embedding_function=self.embeddings,
            index=index,
            docstore=InMemoryDocstore(),
            index_to_docstore_id={}
        )

    def get_system_prompt(self):
        return """You are a highly advanced AI Medical Assistant designed exclusively for doctors. 
Your goal is to assist medical professionals with clinical decision support, research summaries, and patient data analysis.

STRICT GUIDELINES:
1.  **Audience**: You are talking to a DOCTOR. Use professional medical terminology (e.g., "hypertension" instead of "high blood pressure", "myocardial infarction" instead of "heart attack").
2.  **Scope**: Answer ONLY medical and clinical questions. 
    -   If asked about non-medical topics (e.g., sports, movies, weather), politely decline: "I am designed to assist with clinical tasks only."
3.  **Safety**: Always include a disclaimer for critical decisions: "This is AI-generated support. Please verify with standard clinical protocols."
4.  **Tone**: Professional, concise, evidence-based, and objective.
5.  **Context**: Use the provided chat history to maintain context of the current patient or topic.
"""

    def generate_response(self, user_input, user_id="doctor_default"):
        # 1. Retrieve Context (History)
        # In a real app, we'd filter by user_id or session_id. 
        # For this demo, we search purely by semantic similarity to recent queries.
        docs = self.vector_store.similarity_search(user_input, k=3)
        context_text = "\n".join([d.page_content for d in docs])
        
        # 2. Construct Messages
        messages = [
            SystemMessage(content=self.get_system_prompt()),
            SystemMessage(content=f"Relevant History/Context:\n{context_text}"),
            HumanMessage(content=user_input)
        ]

        # 3. Generate Response
        try:
            response = self.llm.invoke(messages)
            ai_text = response.content

            # 4. Save Interaction to Vector Store
            # We save both user query and AI response to build history
            self.vector_store.add_documents([
                Document(page_content=f"Doctor: {user_input}", metadata={"role": "user", "user_id": user_id}),
                Document(page_content=f"AI: {ai_text}", metadata={"role": "assistant", "user_id": user_id})
            ])
            
            # Save index to disk periodically (or every time for safety in this demo)
            self.vector_store.save_local(self.vector_store_path)

            return ai_text
        except Exception as e:
            return f"Error connecting to AI service: {str(e)}"
