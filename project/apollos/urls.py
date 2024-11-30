from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.landing_page, name='landing_page'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('send-otp/', views.send_otp_view, name='send_otp'),
    path('success/', views.success_view, name='success'),
    path('otp-email/', views.otp_email_view, name='otp_email'),
    path('login-home/', views.user_login_view, name='login-home'),
    path('home/', views.home_view, name='home'),
    path('reset_password/', views.reset_password_view, name='reset_password'),
    path('password-reset/', views.password_reset_request, name='password_reset_request'),
    path('password-reset/confirm/', views.password_reset_confirm, name='password_reset_confirm'),
    path('home_admin/', views.home_admin_view, name='home_admin'),
    path('user_profile/', views.user_profile, name='user_profile'),
    path('add_title/', views.add_title, name='add_title'),
    path('home_admin/', views.home_admin, name='home_admin'),
    path('get-titles/', views.get_book_titles, name='get_book_titles'),
    
    
]  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)