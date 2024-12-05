# models.py
from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.shortcuts import render
from django.contrib.auth import get_user_model
import random

class CustomUser(AbstractUser):
    # You can retain the email field (it's already included by default in AbstractUser, but you can customize it)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    password = models.CharField(max_length=100)  # This is already part of AbstractUser, so may not be needed

    def __str__(self):
        return self.email

    def get_initials(self):
        initials = ''
        if self.first_name:
            initials += self.first_name[0].upper()  # First letter of first name
        if self.last_name:
            initials += self.last_name[0].upper()  # First letter of last name
        return initials or self.email[0].upper()  # Fallback to first letter of email if initials are empty

    def get_random_color(self):
        # List of random colors (you can customize this)
        colors = ['#748CAC', '#FF5733', '#33FF57', '#3357FF']
        return random.choice(colors)


class BookTitle(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    SUB_LOCATION_CHOICES = [
        ('circulation', 'Circulation'),
        ('floor1', 'Floor 1'),
        ('floor2', 'Floor 2'),
    ]

    MATERIAL_TYPE_CHOICES = [
        ('e-Book', 'E-Book'),
        ('e-Journal', 'E-Journal'),
        ('manuscript', 'Manuscript'),
    
    ]

    name = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True, null=True)
    genre = models.CharField(max_length=100, blank=True, null=True)
    volume = models.CharField(max_length=100, blank=True, null=True)
    authors = models.CharField(max_length=255, blank=True, null=True)
    standard_numbers = models.CharField(max_length=255, blank=True, null=False, unique=True)
    publisher = models.CharField(max_length=255, blank=True, null=True)
    published_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    page_count = models.IntegerField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='inactive')
    num_of_copies = models.IntegerField(blank=True, null=True)
    starting_barcode = models.CharField(max_length=100, blank=True, null=True)
    code_number = models.CharField(max_length=100, blank=True, null=True)
    material_type = models.CharField(max_length=100, choices=MATERIAL_TYPE_CHOICES, blank=True, null=True)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    date_acquired = models.DateField(blank=True, null=True)
    sub_location = models.CharField(max_length=20, choices=SUB_LOCATION_CHOICES, blank=True, null=True)
    vendor = models.CharField(max_length=255, blank=True, null=True)
    funding_source = models.CharField(max_length=255, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    attach_file = models.FileField(upload_to='book_files/', blank=True, null=True)
    attach_image = models.ImageField(upload_to='book_images/', blank=True, null=True)

    def __str__(self):
        return self.name

class FavoriteBook(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorite_books")
    book = models.ForeignKey(BookTitle, on_delete=models.CASCADE, related_name="favorited_by")
    added_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.book.name}"
    

