# apollos/apps.py

from django.apps import AppConfig

class ApollosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apollos'

    def ready(self):
        # Import the signals module here
        import apollos.signals  # Ensure signals are loaded when the app is ready
