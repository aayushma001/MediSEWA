@api_view(['POST'])
@permission_classes([AllowAny])
def recommend_doctors(request):
    try:
        data = request.data
        symptoms = data.get('symptoms', '')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        location_query = data.get('location', '') # If text location is passed

        # Start with all verified doctors
        doctors = DoctorProfile.objects.filter(is_verified=True).select_related('user', 'hospital')
        
        # 1. Filter by location if coordinates provided (simple radius check or bounding box could be here)
        # For now, we will just return all if no location, or maybe filter by city if text provided
        if latitude and longitude:
            # In a real app with PostGIS, we'd do a distance query.
            # Here, we might just order by proximity if we had that capability, or just return all for now.
            pass
        elif location_query:
            # Filter by city/district in hospital address or doctor address
            doctors = doctors.filter(
                Q(hospital__city__icontains=location_query) | 
                Q(hospital__district__icontains=location_query) |
                Q(hospital__address__icontains=location_query) |
                Q(address__icontains=location_query)
            )

        # 2. Filter by symptoms (rudimentary keyword matching)
        if symptoms:
            # Map symptoms to specializations (simplified)
            symptom_spec_map = {
                'heart': ['Cardiology', 'Cardiologist'],
                'chest': ['Cardiology', 'Pulmonology'],
                'skin': ['Dermatology'],
                'child': ['Pediatrics'],
                'bone': ['Orthopedics'],
                'tooth': ['Dentistry'],
                'teeth': ['Dentistry'],
                'eye': ['Ophthalmology'],
                'stomach': ['Gastroenterology'],
                'head': ['Neurology', 'General Medicine'],
            }
            
            relevant_specs = []
            for key, specs in symptom_spec_map.items():
                if key in symptoms.lower():
                    relevant_specs.extend(specs)
            
            if relevant_specs:
                doctors = doctors.filter(specialization__in=relevant_specs)

        # Return data
        # We need a serializer or manual construction
        results = []
        for doc in doctors[:20]: # Limit to 20
            results.append({
                'id': doc.id,
                'user': {
                    'first_name': doc.user.first_name,
                    'last_name': doc.user.last_name,
                },
                'specialization': doc.specialization,
                'qualification': doc.qualification,
                'experience_years': doc.experience_years,
                'hospital_id': doc.hospital.id if doc.hospital else None,
                'hospital_name': doc.hospital.hospital_name if doc.hospital else None,
                'profile_picture': doc.profile_picture.url if doc.profile_picture else None,
                'latitude': doc.hospital.latitude if doc.hospital else None,
                'longitude': doc.hospital.longitude if doc.hospital else None,
                'departments': [{'name': d.name, 'id': d.id} for d in (doc.hospital.departments.all() if doc.hospital else [])]
            })
        
        return Response(results)
    except Exception as e:
        print(f"Error in recommend_doctors: {e}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def nearby_hospitals(request):
    try:
        latitude = request.query_params.get('latitude')
        longitude = request.query_params.get('longitude')
        location_query = request.query_params.get('location') # If text provided

        hospitals = Hospital.objects.all()

        if location_query:
            hospitals = hospitals.filter(
                Q(city__icontains=location_query) | 
                Q(district__icontains=location_query) |
                Q(address__icontains=location_query) |
                Q(hospital_name__icontains=location_query)
            )
        
        # If coordinates provided, we could calculate distance and sort
        
        results = []
        for hosp in hospitals[:20]:
            results.append({
                'id': hosp.user.id, # Using OneToOne User ID as ID
                'hospital_name': hosp.hospital_name,
                'hospital_type': hosp.hospital_type,
                'address': hosp.address,
                'city': hosp.city,
                'district': hosp.district,
                'latitude': hosp.latitude,
                'longitude': hosp.longitude,
                'logo': hosp.logo.url if hosp.logo else None,
                'opening_hours': hosp.opening_hours,
                'departments': [{'name': d.name, 'id': d.id} for d in hosp.departments.all()]
            })

        return Response(results)
    except Exception as e:
        print(f"Error in nearby_hospitals: {e}")
        return Response({'error': str(e)}, status=500)
