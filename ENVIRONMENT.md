# MediSEWA Environment Setup

This project uses a split architecture with a Django backend and a Vite+React frontend.

## Backend Setup

The backend environment is located in the `backend/venv` directory.

## Dependency Installation

If you see an **"externally-managed-environment"** error when running `pip`, it means you are not using the virtual environment's pip. Always use the explicit path:

### 1. Install Django & Core Backend
```bash
backend/venv/bin/pip install -r backend/requirements.txt
```

### 2. Install AI Chatbot Dependencies
```bash
backend/venv/bin/pip install -r requirements-ai.txt
```

## Running the Servers

### Django Backend
```bash
backend/venv/bin/python3 backend/manage.py runserver 127.0.0.1:8000
```

### AI Chatbot API Server
```bash
backend/venv/bin/python3 frontend/src/components/doctor/api_server.py
```

## Frontend Setup
```bash
cd frontend
npm run dev
```

> [!IMPORTANT]
> **API Key Required**: Ensure you have added `GOOGLE_API_KEY=your_key_here` to your `.env` file in the project root for the AI chatbot to function.

## Virtual Environments

> [!NOTE]
> The root-level `venv` has been removed to avoid confusion. Always use the environment located in `backend/venv` for backend tasks.
