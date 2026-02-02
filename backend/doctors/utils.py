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
import base64
import numpy as np
import cv2

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

def process_signature(base64_str):
    """
    Process signature image:
    1. Decode base64
    2. Convert to grayscale
    3. Threshold to extract signature strokes
    4. Crop to content
    5. Convert to transparent PNG
    """
    if not base64_str or ',' not in base64_str:
        return base64_str

    try:
        header, encoded = base64_str.split(',', 1)
        nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)

        if img is None:
            return base64_str

        # Convert to grayscale
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        elif len(img.shape) == 4:
            gray = cv2.cvtColor(img, cv2.COLOR_BGRA2GRAY)
        else:
            gray = img

        # Denoise
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Adaptive Thresholding - robust for different lighting
        # Result: White signature on Black background (THRESH_BINARY_INV)
        thresh = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)
        
        # Find contours to crop
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        x_min, y_min = float('inf'), float('inf')
        x_max, y_max = float('-inf'), float('-inf')
        
        has_content = False
        if contours:
            for cnt in contours:
                x, y, w, h = cv2.boundingRect(cnt)
                if w * h > 50: # Filter tiny noise
                    x_min = min(x_min, x)
                    y_min = min(y_min, y)
                    x_max = max(x_max, x + w)
                    y_max = max(y_max, y + h)
                    has_content = True
        
        if has_content:
            padding = 10
            h_img, w_img = img.shape[:2]
            x_min = max(0, int(x_min) - padding)
            y_min = max(0, int(y_min) - padding)
            x_max = min(w_img, int(x_max) + padding)
            y_max = min(h_img, int(y_max) + padding)
            
            # Crop the threshold which is our mask
            mask = thresh[y_min:y_max, x_min:x_max]
            h_final, w_final = mask.shape
        else:
            mask = thresh
            h_final, w_final = mask.shape

        # Create BGRA image (Black signature, Transparent background)
        result = np.zeros((h_final, w_final, 4), dtype=np.uint8)
        
        # Set RGB to Black (0,0,0)
        result[:, :, 0] = 0 
        result[:, :, 1] = 0
        result[:, :, 2] = 0
        
        # Set Alpha to mask (White pixels in mask become Opaque)
        result[:, :, 3] = mask
        
        # Encode back to PNG base64
        retval, buffer = cv2.imencode('.png', result)
        png_as_text = base64.b64encode(buffer).decode('utf-8')
        
        return f"data:image/png;base64,{png_as_text}"

    except Exception as e:
        print(f"Error processing signature: {e}")
        return base64_str
