from django.apps import AppConfig

class ApollosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apollos'

    def ready(self):
        # Import signals to ensure they are connected when the app is ready
        import apollos.signals  # This ensures signals are connected
