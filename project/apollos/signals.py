from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import UserProfile
from django.contrib.auth import get_user_model

@receiver(post_save, sender=get_user_model())  # Listen for saving CustomUser
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        # Create a UserProfile for the newly created user
        UserProfile.objects.create(user=instance, 
                                   first_name=instance.first_name, 
                                   last_name=instance.last_name, 
                                   email=instance.email, 
                                   password=instance.password)
        
@receiver(post_save, sender=get_user_model())
def save_user_profile(sender, instance, **kwargs):
    # Save the related user profile whenever the user instance is saved
    instance.userprofile.save()
