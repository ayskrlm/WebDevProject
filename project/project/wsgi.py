import os
import sys

# Add project path to sys.path
sys.path.append('/opt/render/project/src/project')  # Adjust if needed

# Debugging line to print sys.path
print(sys.path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.project.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
