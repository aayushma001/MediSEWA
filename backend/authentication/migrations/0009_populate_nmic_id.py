from django.db import migrations


def populate_nmic_ids(apps, schema_editor):
    Doctor = apps.get_model('authentication', 'Doctor')
    for doctor in Doctor.objects.all():
        if not getattr(doctor, 'nmic_id', None):
            base = getattr(doctor, 'doctor_unique_id', None)
            if not base:
                base = f"DOC-{doctor.pk}"
            doctor.nmic_id = f"NMIC-{base}"
            doctor.save(update_fields=['nmic_id'])


class Migration(migrations.Migration):
    dependencies = [
        ('authentication', '0008_doctor_nmic_id'),
    ]

    operations = [
        migrations.RunPython(populate_nmic_ids, migrations.RunPython.noop),
    ]
