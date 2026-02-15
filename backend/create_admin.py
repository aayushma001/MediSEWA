import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "healthcare_platform.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Force env variables (no defaults)
username = os.environ["DJANGO_ADMIN_USER"]
password = os.environ["DJANGO_ADMIN_PASS"]
email = os.environ.get("DJANGO_ADMIN_EMAIL", "[EMAIL_ADDRESS]")

user, created = User.objects.get_or_create(username=username, defaults={"email": email})

# Ensure proper admin flags
user.email = email
user.is_staff = True
user.is_superuser = True
user.is_active = True
user.set_password(password)
user.save()

print(f"✅ Admin ensured (created={created})")

