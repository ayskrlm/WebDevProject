from django.db.models.signals import post_save
from django.dispatch import receiver
from apollos.models import FavoriteBook, TrendingBook
import logging
from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver


logger = logging.getLogger(__name__)

@receiver(post_save, sender=FavoriteBook)
def update_trending_book(sender, instance, created, **kwargs):
    if created:  # Only update when a new favorite is created
        logger.info(f"FavoriteBook added: {instance.user.email} added {instance.book.name} to favorites.")
        trending_book, created = TrendingBook.objects.get_or_create(book=instance.book)
        trending_book.update_favorite_count()
        logger.info(f"TrendingBook updated for {instance.book.name} with {trending_book.favorite_count} favorites.")

@receiver(post_save, sender=FavoriteBook)
def update_favorite_count_on_add(sender, instance, created, **kwargs):
    if created:  # This is triggered when a FavoriteBook is created (i.e., a book is added to favorites)
        trending_book, created = TrendingBook.objects.get_or_create(book=instance.book)
        trending_book.update_favorite_count()

# Signal to update the trending book's favorite count when a favorite is removed
@receiver(post_delete, sender=FavoriteBook)
def update_favorite_count_on_remove(sender, instance, **kwargs):
    trending_book, created = TrendingBook.objects.get_or_create(book=instance.book)
    trending_book.update_favorite_count()