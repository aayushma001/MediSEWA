from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .utils import DoctorChatService, process_signature
from .serializers import DoctorProfileSerializer
from rest_framework import generics

# Create your views here.

class ChatbotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_message = request.data.get('message')
        if not user_message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Initialize service (Singleton pattern could be better, but this is fine for now)
            bot_service = DoctorChatService()
            
            # Generate response
            # Using username as user_id for context
            response_text = bot_service.generate_response(user_message, user_id=request.user.username)
            
            return Response({"response": response_text})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DoctorProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DoctorProfileSerializer

    def get_object(self):
        return self.request.user.doctor

    def perform_update(self, serializer):
        signature = self.request.data.get('signature')
        if signature:
            # simple check if it looks like a base64 string
            if signature.startswith('data:image'):
                 processed_sig = process_signature(signature)
                 serializer.save(signature=processed_sig)
            else:
                 serializer.save()
        else:
            serializer.save()