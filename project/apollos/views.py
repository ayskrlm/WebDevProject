import random
import string
from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.http import JsonResponse
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from .models import UserProfile
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.templatetags.static import static
from email.mime.image import MIMEImage
import os

# Email configuration from settings
# Make sure you define these in your settings.py
EMAIL_ACCOUNT = settings.EMAIL_HOST_USER
EMAIL_PASSWORD = settings.EMAIL_HOST_PASSWORD

def landing_page(request):
    return render(request, 'apollos/landing.html')

def login_view(request):
    return render(request, 'apollos/login.html')

def success_view(request):
    return render(request, 'apollos/success.html')

def otp_email_view(request):
    return render(request, 'apollos/otp_email.html')

# Email configuration (from settings.py)
EMAIL_ACCOUNT = settings.EMAIL_HOST_USER

# Function to send OTP via email
# Function to send OTP via email
def send_otp_email(user_email, otp):
    subject = "APOLLO'S User Registration - Your OTP Code"
    from_email = EMAIL_ACCOUNT
    recipient_list = [user_email]
    
    # HTML content
    html_content = render_to_string('apollos/otp_email.html', {'otp': otp})
    text_content = strip_tags(html_content)  # Fallback for plain text

    try:
        # Creating the email
        email = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
        email.attach_alternative(html_content, "text/html")
        email.send()
    except Exception as e:
        print(f"Error sending OTP: {e}")
        return False
    return True


# Function to generate OTP
def generate_otp(length=6):
    characters = string.ascii_letters + string.digits  # Mix of letters and numbers
    otp = ''.join(random.choice(characters) for _ in range(length))
    return otp

# Registration view
def register_view(request):
    if request.method == "POST":
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        entered_otp = request.POST.get('otp')

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            messages.error(request, "This email is already registered.")
            return render(request, 'apollos/register.html')

        # Get stored OTP from session
        stored_otp = request.session.get('otp')

        if entered_otp == stored_otp:
            # OTP is correct, register the user
            user = User.objects.create_user(username=email, email=email, password=request.POST.get('password'))
            user.first_name = first_name
            user.last_name = last_name
            user.save()

            messages.success(request, "Registration successful!")
            return redirect('login')  # Redirect to login page or home

        else:
            messages.error(request, "Invalid OTP. Please try again.")

    return render(request, 'apollos/register.html')

# View to send OTP (AJAX request)
def send_otp_view(request):
    if request.method == "POST":
        import json
        data = json.loads(request.body)
        email = data.get("email")

        # Check if email is already used
        if User.objects.filter(email=email).exists():
            return JsonResponse({'success': False, 'error': 'Email is already registered.'})

        if email:
            otp = generate_otp()
            request.session['otp'] = otp  # Store OTP in session for verification

            # Send OTP email
            if send_otp_email(email, otp):
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'success': False})

    return JsonResponse({'success': False})

def user_login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        # Authenticate the user
        user = authenticate(request, username=email, password=password)

        if user is not None:
            # Log the user in
            login(request, user)
            return redirect('home')  # Redirect to a page after successful login
        else:
            # If authentication fails, show an error message
            messages.error(request, "Invalid email or password.")
            return redirect('login')  # Redirect back to the login page

    return render(request, 'login.html')