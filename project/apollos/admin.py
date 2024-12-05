from django.contrib import admin
from .models import CustomUser, BookTitle, FavoriteBook

admin.site.register(CustomUser)
admin.site.register(BookTitle)
admin.site.register(FavoriteBook)
