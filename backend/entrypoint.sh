#!/bin/sh
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Ensuring admin user exists..."
python create_admin.py

echo "Starting Daphne (ASGI)..."
exec daphne -b 0.0.0.0 -p ${PORT:-8080} healthcare_platform.asgi:application

