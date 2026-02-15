FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    libpq-dev \
    libxml2-dev \
    libxslt-dev \
    && rm -rf /var/lib/apt/lists/*

# Set Locale for UTF-8 support (fixes 'ascii' codec errors)
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PYTHONUTF8=1

COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

COPY . /app/

# Build-time env only for collectstatic
ENV DJANGO_SETTINGS_MODULE=healthcare_platform.settings \
    DEBUG=False \
    SECRET_KEY=django-insecure-build-key \
    DATABASE_URL=sqlite:///db.sqlite3

RUN python manage.py collectstatic --noinput

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Use Daphne for ASGI (Channels support)
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "healthcare_platform.asgi:application"]
