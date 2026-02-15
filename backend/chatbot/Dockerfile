FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Cloud Run sets $PORT; gunicorn will bind to it (fallback to 5000)
EXPOSE 5000

# Use shell form to expand $PORT env var
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-5000} api_server:app"]
