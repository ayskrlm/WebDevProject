# Generated by Django 5.1.3 on 2024-12-01 13:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('apollos', '0006_remove_userprofile_email'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='first_name',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='last_name',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='password',
            field=models.CharField(max_length=100),
        ),
        migrations.DeleteModel(
            name='UserProfile',
        ),
    ]
