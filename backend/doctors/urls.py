from django.urls import path
from .views import ChatbotView, DoctorProfileView

urlpatterns = [
    path('chatbot/', ChatbotView.as_view(), name='doctor-chatbot'),
    path('profile/', DoctorProfileView.as_view(), name='doctor-profile'),
]