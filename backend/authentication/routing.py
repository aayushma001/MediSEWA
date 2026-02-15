from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/signaling/(?P<appointment_id>\w+)/$', consumers.SignalingConsumer.as_asgi()),
]
