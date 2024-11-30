# models.py
from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
import random

# Custom user model
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.email


# UserProfile model
class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)

    def __str__(self):
        return self.user.username

    # Method to return initials from the first letter of the email
    def get_initials(self):
        initials = ''
        if self.first_name:
            initials += self.first_name[0].upper()  # First letter of first name
        if self.last_name:
            initials += self.last_name[0].upper()  # First letter of last name
        return initials or self.user.email[0].upper()  # Fallback to first letter of email if initials are empty

    # Method to generate a random color
    def get_random_color(self):
        # List of random colors (you can customize this)
        colors = ['#748CAC', '#FF5733', '#33FF57', '#3357FF']
        return random.choice(colors)
    
from django.db import models

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

    name = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True, null=True)
    genre = models.CharField(max_length=100, blank=True, null=True)
    volume = models.CharField(max_length=100, blank=True, null=True)
    authors = models.CharField(max_length=255, blank=True, null=True)
    standard_numbers = models.CharField(max_length=255, blank=True, null=True)
    publisher = models.CharField(max_length=255, blank=True, null=True)
    published_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    page_count = models.IntegerField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='inactive')
    num_of_copies = models.IntegerField(blank=True, null=True)
    starting_barcode = models.CharField(max_length=100, blank=True, null=True)
    code_number = models.CharField(max_length=100, blank=True, null=True)
    material_type = models.CharField(max_length=100, blank=True, null=True)
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
