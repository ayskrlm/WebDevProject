from django.urls import path
from . import views

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
]
