FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps (psycopg2 needs libpq)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    libpq-dev \
  && rm -rf /var/lib/apt/lists/*

# Install Python deps first (better caching)
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

# Copy Django project
COPY backend/ /app/

# Optional: build-time env to let collectstatic run without crashing
# Adjust module if needed
ENV DJANGO_SETTINGS_MODULE=healthcare_platform.settings \
    DEBUG=False

# Collect static files (requires correct settings)
RUN python manage.py collectstatic --noinput

# Run gunicorn on Cloud Run's injected PORT
CMD ["sh", "-c", "gunicorn healthcare_platform.wsgi:application --bind 0.0.0.0:${PORT} --workers 1 --threads 8 --timeout 0"]
