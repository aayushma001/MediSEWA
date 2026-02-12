from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('dashboard-stats/', views.dashboard_stats, name='dashboard_stats'),
    path('hospitals/', views.get_hospitals, name='get_hospitals'),
    path('doctors/', views.get_doctors, name='get_doctors'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('payment-methods/', views.payment_methods, name='payment_methods'),
    path('payment-methods/<int:method_id>/', views.payment_methods, name='delete_payment_method'),
    path('notifications/', views.notifications, name='notifications'),
]
