from django.contrib import admin
from .models import CustomUser, BookTitle, FavoriteBook, TrendingBook

admin.site.register(CustomUser)
admin.site.register(BookTitle)
admin.site.register(FavoriteBook)
admin.site.register(TrendingBook)
