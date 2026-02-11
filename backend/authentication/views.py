from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserRegistrationSerializer, UserLoginSerializer, HospitalSerializer, DoctorProfileSerializer, PaymentMethodSerializer, NotificationSerializer
from .models import Hospital, DoctorProfile, PaymentMethod, Notification
import traceback

@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_stats(request):
    print("=== DASHBOARD STATS DEBUG ===")
    try:
        # Placeholder stats since models are deleted
        stats = {
            'doctors': 0,
            'patients': 0,
            'appointments': 0,
            'revenue': 0
        }
        
        print(f"Stats calculated: {stats}")
        return Response(stats)
    except Exception as e:
        print("Error fetching dashboard stats:", str(e))
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    print("=== REGISTRATION DEBUG ===")
    print("Raw request data:", request.data)
    
    serializer = UserRegistrationSerializer(data=request.data)
    print("Serializer created with data:", serializer.initial_data)
    
    if serializer.is_valid():
        print("Serializer is valid, proceeding with user creation...")
        try:
            user = serializer.save()
            print(f"User created successfully: {user.email} ({user.user_type})")
            
            refresh = RefreshToken.for_user(user)
            
            # Get user profile data
            user_data = None
            if user.user_type == 'hospital':
                try:
                    hospital = Hospital.objects.get(user=user)
                    print("Hospital profile found and serialized")
                    user_data = HospitalSerializer(hospital).data
                except Hospital.DoesNotExist:
                    print("ERROR: Hospital profile not found after creation")
                    return Response({'error': 'Hospital profile not created'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            elif user.user_type == 'doctor':
                try:
                    profile = DoctorProfile.objects.get(user=user)
                    print("Doctor profile found and serialized")
                    user_data = DoctorProfileSerializer(profile).data
                except DoctorProfile.DoesNotExist:
                    print("ERROR: Doctor profile not found after creation")
                    return Response({'error': 'Doctor profile not created'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            print("Registration successful, returning response")
            return Response({
                'user': user_data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print("EXCEPTION during user creation:", str(e))
            print("Exception type:", type(e).__name__)
            traceback.print_exc()
            return Response({'error': f'Registration failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    print("SERIALIZER VALIDATION FAILED:")
    print("Errors:", serializer.errors)
    for field, errors in serializer.errors.items():
        print(f"  {field}: {errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    print("=== LOGIN DEBUG ===")
    print("Login request data:", request.data)
    
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        print("Login serializer is valid")
        user = serializer.validated_data['user']
        print(f"User authenticated: {user.email} ({user.user_type})")
        
        refresh = RefreshToken.for_user(user)
        
        # Get user profile data
        user_data = None
        if user.user_type == 'hospital':
            try:
                hospital = Hospital.objects.get(user=user)
                user_data = HospitalSerializer(hospital).data
                print("Hospital data serialized successfully")
            except Hospital.DoesNotExist:
                print("ERROR: Hospital profile not found")
                return Response({'error': 'Hospital profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        elif user.user_type == 'doctor':
            try:
                profile = DoctorProfile.objects.get(user=user)
                user_data = DoctorProfileSerializer(profile).data
                print("Doctor data serialized successfully")
            except DoctorProfile.DoesNotExist:
                print("ERROR: Doctor profile not found")
                return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        print("Login successful, returning response")
        return Response({
            'user': user_data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
    
    print("Login validation errors:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_hospitals(request):
    try:
        hospitals = Hospital.objects.all()
        serializer = HospitalSerializer(hospitals, many=True)
        return Response(serializer.data)
    except Exception as e:
        print("Error fetching hospitals:", str(e))
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    if user.user_type == 'doctor':
        try:
            profile = user.doctor_profile
            serializer = DoctorProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
            
    elif user.user_type == 'hospital':
        try:
            profile = user.hospital_profile
            serializer = HospitalSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Hospital.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    return Response({'error': 'Invalid user type'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def payment_methods(request, method_id=None):
    if request.method == 'GET':
        methods = PaymentMethod.objects.filter(user=request.user)
        serializer = PaymentMethodSerializer(methods, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = PaymentMethodSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        if not method_id:
            return Response({'error': 'Method ID required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            method = PaymentMethod.objects.get(id=method_id, user=request.user)
            method.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except PaymentMethod.DoesNotExist:
            return Response({'error': 'Method not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def notifications(request):
    if request.method == 'GET':
        notifs = Notification.objects.filter(user=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifs, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Used to mark as read or create internal notification
        if 'mark_read' in request.data:
            Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
            return Response({'status': 'marked read'})
            
        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
