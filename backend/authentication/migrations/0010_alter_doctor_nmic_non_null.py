from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('authentication', '0009_populate_nmic_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doctor',
            name='nmic_id',
            field=models.CharField(max_length=50, unique=True),
        ),
    ]
