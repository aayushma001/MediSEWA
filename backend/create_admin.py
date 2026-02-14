import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "healthcare_platform.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = os.environ.get("DJANGO_ADMIN_USER", "MediSewa")
password = os.environ.get("DJANGO_ADMIN_PASS", "MEDISEWA@123")
email = os.environ.get("DJANGO_ADMIN_EMAIL", "katuwalaayushma508@gmail.com")

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print("✅ Superuser created")
else:
    print("ℹ️ Superuser already exists")
