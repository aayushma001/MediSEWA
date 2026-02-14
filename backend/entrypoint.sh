#!/bin/sh
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Ensuring admin user exists..."
python create_admin.py

echo "Starting Gunicorn..."
exec gunicorn healthcare_platform.wsgi:application \
  --bind 0.0.0.0:${PORT} --workers 1 --threads 8 --timeout 0
