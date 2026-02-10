from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import ScheduleViewSet

router = DefaultRouter()
router.register(r'schedules', ScheduleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('profile/', views.doctor_profile, name='doctor-profile'),
]
