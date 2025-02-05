from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    """
    Custom UserAdmin for the User model to display additional fields in the admin interface.
    """
    # Define which fields are displayed in the admin list view
    list_display = ('id', 'fullname', 'email', 'is_verified', 'is_staff', 'is_active')
    
    # Fields to include in the User creation form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'fullname', 'password1', 'password2', 'is_staff', 'is_superuser', 'is_verified'),
        }),
    )
    
    # Fields to include in the User edit form
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('fullname',)}),
        ('Permissions', {'fields': ('is_verified', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )

# Register the User model with the custom admin class
admin.site.register(User, CustomUserAdmin)