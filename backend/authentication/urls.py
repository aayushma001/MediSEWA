from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('dashboard-stats/', views.dashboard_stats, name='dashboard_stats'),
    path('hospitals/', views.get_hospitals, name='get_hospitals'),
    path('profile/update/', views.update_profile, name='update_profile'),
]
