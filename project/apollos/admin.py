from django.contrib import admin
from .models import CustomUser, UserProfile, BookTitle

admin.site.register(CustomUser)
admin.site.register(UserProfile)
admin.site.register(BookTitle)
