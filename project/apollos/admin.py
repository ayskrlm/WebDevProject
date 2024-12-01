from django.contrib import admin
from .models import CustomUser, BookTitle

admin.site.register(CustomUser)
admin.site.register(BookTitle)
