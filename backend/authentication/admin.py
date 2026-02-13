from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Hospital, PatientProfile

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'user_type', 'is_staff')
    list_filter = ('user_type', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'mobile', 'unique_id')}),
    )

class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('patient_unique_id', 'user', 'age', 'gender', 'blood_group', 'phone_number', 'city')
    list_filter = ('gender', 'blood_group', 'province')
    search_fields = ('patient_unique_id', 'user__email', 'user__first_name', 'user__last_name', 'phone_number')
    readonly_fields = ('created_at', 'updated_at')

admin.site.register(User, CustomUserAdmin)
admin.site.register(Hospital)
admin.site.register(PatientProfile, PatientProfileAdmin)