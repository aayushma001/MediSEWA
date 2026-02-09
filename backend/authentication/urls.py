from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('doctors/', views.get_doctors, name='get_doctors'),
    path('dashboard-stats/', views.dashboard_stats, name='dashboard_stats'),
    path('hospitals/', views.get_hospitals, name='get_hospitals'),
    path('patient/consent/', views.patient_consent, name='patient_consent'),
]
