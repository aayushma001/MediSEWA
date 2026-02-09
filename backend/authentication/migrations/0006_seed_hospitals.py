from django.db import migrations

def seed_hospitals(apps, schema_editor):
    User = apps.get_model('authentication', 'User')
    Hospital = apps.get_model('authentication', 'Hospital')

    data = [
        ('CurePlus Hospital', '123 Sunrise Ave, City A', 27.7172, 85.3240),
        ('Medicure General', '45 Elm Street, City B', 28.2096, 83.9856),
        ('NovaCare Clinic', '78 Oak Lane, City C', 26.4667, 87.2833),
        ('Apex Health Center', '9 Pine Drive, City D', 27.6760, 85.3140),
        ('PrimeLife Hospital', '300 Maple Blvd, City E', 27.7000, 85.3333),
        ('ClearSound Medical', '55 Cedar Court, City F', 26.7000, 87.2000),
        ('BlueRiver Hospital', '112 River Rd, City G', 27.5800, 85.3200),
        ('GreenValley Clinic', '19 Valley View, City H', 27.7400, 85.3600),
        ('Sunrise Medical', '88 Horizon Way, City I', 27.6200, 85.2900),
        ('SilverOak Hospital', '5 Grove Park, City J', 27.6500, 85.3500),
    ]

    for idx, (name, address, lat, lon) in enumerate(data, start=1):
        email = f"hospital{idx}@example.com"
        # Create user
        user = User.objects.create_user(
            username=email,
            email=email,
            password='Passw0rd!',
            user_type='hospital',
            mobile=f"+977-{9800000000 + idx}"
        )
        # Create hospital profile
        Hospital.objects.create(
            user=user,
            hospital_name=name,
            address=address,
            latitude=lat,
            longitude=lon
        )

class Migration(migrations.Migration):
    dependencies = [
        ('authentication', '0005_doctor_latitude_doctor_longitude_hospital_latitude_and_more'),
    ]

    operations = [
        migrations.RunPython(seed_hospitals),
    ]
