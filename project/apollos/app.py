# apps.py
from django.apps import AppConfig

class ApollosConfig(AppConfig):
    name = 'apollos'

    def ready(self):
        import apollos.signals  # Import signals to ensure they are connected
