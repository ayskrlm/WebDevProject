# Generated by Django 5.1.3 on 2024-12-05 16:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('apollos', '0008_favoritebook'),
    ]

    operations = [
        migrations.AlterField(
            model_name='booktitle',
            name='material_type',
            field=models.CharField(blank=True, choices=[('e-Book', 'E-Book'), ('e-Journal', 'E-Journal')], max_length=100, null=True),
        ),
    ]
