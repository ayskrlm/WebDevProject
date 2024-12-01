import random
import string
from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.http import JsonResponse
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.models import User
from apollos.models import CustomUser
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import PasswordResetForm
from .models import UserProfile
from django.contrib.auth import update_session_auth_hash
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.contrib.auth.decorators import login_required
from django.utils.html import strip_tags
from django.contrib.auth import get_user_model, login
from django.templatetags.static import static
from email.mime.image import MIMEImage
from .models import BookTitle
from datetime import datetime
from django.core.exceptions import ValidationError
from django.core.files.storage import FileSystemStorage
import os
import json

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

def reset_password_view(request):
    return render(request, 'apollos/reset_password.html')


@login_required
def home_admin_view(request):
    return render(request, 'apollos/home_admin.html')

@login_required
def home_view(request):
    return render(request, 'apollos/home.html')  # Render the correct home page


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
        if CustomUser.objects.filter(email=email).exists():
            messages.error(request, "This email is already registered.")
            return render(request, 'apollos/register.html')

        # Get stored OTP from session
        stored_otp = request.session.get('otp')

        if entered_otp == stored_otp:
            # OTP is correct, register the user
            user = CustomUser.objects.create_user(username=email, email=email, password=request.POST.get('password'))
            user.first_name = first_name
            user.last_name = last_name
            user.save()

            messages.success(request, "Registration successful!")
            return redirect('login')  # Redirect to login page or home

        else:
            messages.error(request, "Invalid OTP. Please try again.")
            return render(request, 'apollos/register.html')

    return render(request, 'apollos/register.html')

# View to send OTP (AJAX request)
def send_otp_view(request):
    if request.method == "POST":
        import json
        data = json.loads(request.body)
        email = data.get("email")

        # Check if email is already used
        if CustomUser.objects.filter(email=email).exists():
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

            # If user is staff, redirect to the admin home page
            if user.is_staff:
                return redirect('home_admin')  # Redirect to home_admin view if the user is a staff member

            # Redirect to the 'next' parameter, or default to 'home'
            next_url = request.GET.get('next', 'home')
            return redirect(next_url)
        else:
            # If authentication fails, show an error message
            error_message = "Invalid email or password."
            return render(request, 'apollos/login.html', {'error_message': error_message})  # Pass error message to template

    return render(request, 'apollos/login.html')  # Adjusted path to 'apollos/login.html' if necessary


def send_otp_email2(user_email, otp):
    subject = "APOLLO'S Password Reset - Your OTP Code"
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user_email]
    
    # HTML content
    html_content = render_to_string('apollos/otp_password_email.html', {'otp': otp})
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

def password_reset_request(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        
        if CustomUser.objects.filter(email=email).exists():
            otp = generate_otp(length=6)
            request.session['reset_otp'] = otp
            request.session['reset_email'] = email
            
            # Send OTP email using the HTML email function
            send_otp_email2(email, otp)

            # Send success response for AJAX
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'error': 'Email address not found.'}, status=400)

    return JsonResponse({'error': 'Invalid method.'}, status=405)

# Function to handle OTP verification and password reset
def password_reset_confirm(request):
    if request.method == 'POST':
        otp = request.POST.get('otp')
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')

        if otp == request.session.get('reset_otp'):
            if new_password == confirm_password:
                email = request.session.get('reset_email')
                try:
                    user = get_user_model().objects.get(email=email)
                    user.set_password(new_password)
                    user.save()

                    # Clear session
                    del request.session['reset_otp']
                    del request.session['reset_email']

                    # Log the user in after password reset
                    login(request, user)  # This logs the user in

                    # Return success response
                    return JsonResponse({'success': True, 'redirect_url': '/login/'})
                except get_user_model().DoesNotExist:
                    return JsonResponse({'error': 'User with this email does not exist.'}, status=400)
            else:
                return JsonResponse({'error': 'New password and confirm password do not match.'}, status=400)
        else:
            return JsonResponse({'error': 'Invalid OTP.'}, status=400)

    return JsonResponse({'error': 'Invalid method.'}, status=405)

def user_profile(request):
    initials = "NA"  # Default initials
    color = "#000000"  # Default color
    
    if request.user.is_authenticated:
        try:
            # Access the related UserProfile for the logged-in user
            print(f"Fetching profile for user: {request.user.email}")  # Debugging log
            user_profile = request.user.userprofile  # Get related profile
            
            # Print debug statements for user profile
            print(f"User Profile: {user_profile}")  # Check user profile
            print(f"First Name: {user_profile.first_name}, Last Name: {user_profile.last_name}")  # Debugging
            
            initials = user_profile.get_initials()  # Get initials
            color = user_profile.get_random_color()  # Get random color

        except CustomUser.DoesNotExist:
            print(f"No UserProfile found for {request.user.email}")  # Debugging output
    
    # Print the initials and color for debugging purposes
    print(f"Initials: {initials}, Color: {color}")  
    
    # Choose template based on user role (admin or regular)
    if request.user.is_staff:
        template = 'apollos/home_admin.html'  # Admin template
    else:
        template = 'apollos/home.html'  # Regular user template
    
    # Pass initials and color to the template context
    return render(request, template, {'initials': initials, 'color': color})



def get_random_color():
    # Example function to generate a random color (you can customize this)
    colors = ['#748CAC', '#FF5733', '#33FF57', '#3357FF']
    return random.choice(colors)


def home_admin(request):
    # Fetch all book titles for the 'Title' section
    titles = BookTitle.objects.all()
    return render(request, 'apollos/home_admin.html', {'titles': titles})


# View to return book titles as JSON
def get_book_titles(request):
    titles = BookTitle.objects.all()
    titles_data = []
    for title in titles:
        titles_data.append({
            'name': title.name,
            'attach_image': title.attach_image.url if title.attach_image else None,
            'attach_file': title.attach_file.url if title.attach_file else None,  # Include file URL
            'standard_numbers': title.standard_numbers,
            'authors': title.authors,
            'date_acquired': title.date_acquired,
        })
    return JsonResponse({'titles': titles_data})



def add_title(request):
    if request.method == 'POST':
        # Handle form data with files
        book_title = request.POST.get('book_title', '').strip()
        subtitle = request.POST.get('subtitle', '')
        genre = request.POST.get('genre', '')
        volume = request.POST.get('volume', '')
        authors = request.POST.get('authors', '')
        standard_numbers = str(request.POST.get('standard_numbers', '')).strip()
        publisher = request.POST.get('publisher', '')
        published_date = request.POST.get('published_date', '')
        description = request.POST.get('description', '')
        page_count = request.POST.get('page_count', '')
        status = request.POST.get('status', '')
        num_of_copies = request.POST.get('num_of_copies', '')
        starting_barcode = request.POST.get('starting_barcode', '')
        code_number = request.POST.get('code_number', '')
        material_type = request.POST.get('material_type', '')
        purchase_price = request.POST.get('purchase_price', '')
        date_acquired = request.POST.get('date_acquired', '')
        sub_location = request.POST.get('sub_location', '')
        vendor = request.POST.get('vendor', '')
        funding_source = request.POST.get('funding_source', '')
        note = request.POST.get('note', '')
        attach_file = request.FILES.get('attach_file', None)
        attach_image = request.FILES.get('attach_image', None)

        # Debugging the standard_numbers value
        print(f"standard_numbers value: '{standard_numbers}'")

        # Validate required fields
        if not book_title:
            return JsonResponse({'error': 'Book title is required.'}, status=400)
        if not standard_numbers:
            return JsonResponse({'error': 'Standard number is required.'}, status=400)

        # Check if the standard number already exists
        if BookTitle.objects.filter(standard_numbers=standard_numbers).exists():
            return JsonResponse({'error': 'Standard number already exists.'}, status=400)

        # Helper function to handle numeric fields
        def handle_numeric_field(field_value, default=None):
            """Helper function to handle numeric fields (either int or float)."""
            if field_value == '' or field_value is None:
                return default
            try:
                return float(field_value) if '.' in field_value else int(field_value)
            except ValueError:
                raise ValueError(f"Invalid value for numeric field: {field_value}")

        # Handle numeric fields
        try:
            page_count = handle_numeric_field(page_count, default=None)
            num_of_copies = handle_numeric_field(num_of_copies, default=None)
            purchase_price = handle_numeric_field(purchase_price, default=None)
        except ValueError as e:
            return JsonResponse({'error': str(e)}, status=400)

        # Handle date fields (if empty, leave as None)
        published_date = published_date if published_date else None
        date_acquired = date_acquired if date_acquired else None

        # Create the BookTitle object
        try:
            new_title = BookTitle.objects.create(
                name=book_title,
                subtitle=subtitle,
                genre=genre,
                volume=volume,
                authors=authors,
                standard_numbers=standard_numbers,
                publisher=publisher,
                published_date=published_date,
                description=description,
                page_count=page_count,
                status=status,
                num_of_copies=num_of_copies,
                starting_barcode=starting_barcode,
                code_number=code_number,
                material_type=material_type,
                purchase_price=purchase_price,
                date_acquired=date_acquired,
                sub_location=sub_location,
                vendor=vendor,
                funding_source=funding_source,
                note=note,
                attach_file=attach_file,
                attach_image=attach_image
            )
        except ValidationError as e:
            return JsonResponse({'error': str(e)}, status=400)

        # Fetch all book titles after the new one is added
        titles = BookTitle.objects.all()

        # Return the updated list of titles as JSON
        titles_data = [{'name': title.name} for title in titles]
        return JsonResponse({'titles': titles_data})

    else:
        # For GET requests, pass the list of titles to the template
        titles = BookTitle.objects.all()
        return render(request, 'apollos/home_admin.html', {'titles': titles})
def delete_titles(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)  # Get the request data (expected to be in JSON format)
            standard_numbers = data.get("standard_numbers", [])  # Get list of standard numbers from request data
            
            if not standard_numbers:
                return JsonResponse({"error": "No books selected"}, status=400)
            
            # Check if the books with the given standard numbers exist in the database
            books_to_delete = BookTitle.objects.filter(standard_numbers__in=standard_numbers)

            # If no books were found for the provided standard numbers
            if not books_to_delete.exists():
                return JsonResponse({"error": "No books found for the provided standard numbers"}, status=404)
            
            # Delete the selected books
            deleted_count, _ = books_to_delete.delete()

            if deleted_count > 0:
                return JsonResponse({"success": f"{deleted_count} books deleted successfully"})
            else:
                return JsonResponse({"error": "No books were deleted"}, status=400)
        
        except Exception as e:
            # Catch any errors and return as a JSON response
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid HTTP method. Use POST to delete books."}, status=405)


from django.http import JsonResponse
from django.shortcuts import render
from django.core.exceptions import ValidationError
import json
from .models import BookTitle

def update_title(request):
    if request.method == 'POST':
        try:
            # Ensure the body is read only once
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                data = request.POST
            
            # Extract the form data
            standard_numbers = data.get('standard_numbers')
            book_title = data.get('book_title')
            subtitle = data.get('subtitle', '')
            genre = data.get('genre', '')
            volume = data.get('volume', '')
            authors = data.get('authors', '')
            publisher = data.get('publisher', '')
            published_date = data.get('published_date', '')
            description = data.get('description', '')
            page_count = data.get('page_count', '')
            status = data.get('status', '')
            num_of_copies = data.get('num_of_copies', '')
            starting_barcode = data.get('starting_barcode', '')
            code_number = data.get('code_number', '')
            material_type = data.get('material_type', '')
            purchase_price = data.get('purchase_price', '')
            date_acquired = data.get('date_acquired', '')
            sub_location = data.get('sub_location', '')
            vendor = data.get('vendor', '')
            funding_source = data.get('funding_source', '')
            note = data.get('note', '')

            # Handle file uploads
            attach_file = request.FILES.get('attach_file', None)
            attach_image = request.FILES.get('attach_image', None)

            # Validate required fields
            if not book_title or not standard_numbers:
                return JsonResponse({'error': 'Book title and standard number are required.'}, status=400)

            # Check if the book with the provided standard number exists
            book_to_update = BookTitle.objects.filter(standard_numbers=standard_numbers).first()
            if not book_to_update:
                return JsonResponse({'error': 'Book not found with the given standard number.'}, status=404)

            # Update the fields of the book
            book_to_update.name = book_title
            book_to_update.subtitle = subtitle
            book_to_update.genre = genre
            book_to_update.volume = volume
            book_to_update.authors = authors
            book_to_update.publisher = publisher
            book_to_update.published_date = published_date if published_date else None
            book_to_update.description = description
            book_to_update.page_count = page_count if page_count else None
            book_to_update.status = status
            book_to_update.num_of_copies = num_of_copies if num_of_copies else None
            book_to_update.starting_barcode = starting_barcode
            book_to_update.code_number = code_number
            book_to_update.material_type = material_type
            book_to_update.purchase_price = purchase_price if purchase_price else None
            book_to_update.date_acquired = date_acquired if date_acquired else None
            book_to_update.sub_location = sub_location
            book_to_update.vendor = vendor
            book_to_update.funding_source = funding_source
            book_to_update.note = note

            # Update file attachments (if any)
            if attach_file:
                book_to_update.attach_file = attach_file
            if attach_image:
                book_to_update.attach_image = attach_image

            # Save the updated book title
            book_to_update.save()

            # Return the updated list of titles
            titles = BookTitle.objects.all()
            titles_data = [{'name': title.name, 'standard_numbers': title.standard_numbers} for title in titles]

            return JsonResponse({'titles': titles_data})

        except Exception as e:
            # Catch any errors and return a JSON response with the error message
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({"error": "Invalid HTTP method. Use POST to update books."}, status=405)




def get_book_data(request, standard_number):
    try:
        # Fetch the book using the standard number
        book = BookTitle.objects.get(standard_numbers=standard_number)
        
        # Prepare the book data to return
        book_data = {
            'name': book.name,
            'standard_numbers': book.standard_numbers,
            'subtitle': book.subtitle,
            'genre': book.genre,
            'volume': book.volume,
            'authors': book.authors,
            'publisher': book.publisher,
            'published_date': book.published_date,
            'description': book.description,
            'page_count': book.page_count,
            'status': book.status,
            'num_of_copies': book.num_of_copies,
            'starting_barcode': book.starting_barcode,
            'code_number': book.code_number,
            'material_type': book.material_type,
            'purchase_price': book.purchase_price,
            'date_acquired': book.date_acquired,
            'sub_location': book.sub_location,
            'vendor': book.vendor,
            'funding_source': book.funding_source,
            'note': book.note,
        }
        
        return JsonResponse({'success': True, 'book': book_data})
    except BookTitle.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Book not found'}, status=404)