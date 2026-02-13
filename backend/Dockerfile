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

# Install Python dependencies first (better caching)
# Build context is backend/, so requirements.txt is at the root of the context
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

# Copy Django project
COPY . /app/

# Build-time env so collectstatic doesn't fail during image build
ENV DJANGO_SETTINGS_MODULE=healthcare_platform.settings \
    DEBUG=False \
    SECRET_KEY=django-insecure-build-key \
    DATABASE_URL=sqlite:///db.sqlite3

# Collect static files
RUN python manage.py collectstatic --noinput

# Start Django with Gunicorn on Cloud Run's PORT
CMD ["sh", "-c", "gunicorn healthcare_platform.wsgi:application --bind 0.0.0.0:${PORT} --workers 1 --threads 8 --timeout 0"]
