from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('dashboard-stats/', views.dashboard_stats, name='dashboard_stats'),
    path('hospitals/', views.get_hospitals, name='get_hospitals'),
    path('doctors/', views.get_doctors, name='get_doctors'),
    path('profile/', views.get_profile, name='get_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('connect/', views.connect_entities, name='connect_entities'),
    path('confirm-connection/', views.update_connection_status, name='confirm_connection'),
    path('schedules/', views.manage_schedules, name='manage_schedules'),
    path('connections/', views.get_connected_entities, name='get_connected_entities'),
    path('payment-methods/', views.payment_methods, name='payment_methods'),
    path('payment-methods/<int:method_id>/', views.payment_methods, name='delete_payment_method'),
    path('notifications/', views.notifications, name='notifications'),
    path('send-otp/', views.SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', views.VerifyOTPView.as_view(), name='verify-otp'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
]
