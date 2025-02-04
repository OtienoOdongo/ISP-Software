# from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin
# from .models import User

# class CustomUserAdmin(UserAdmin):
#     """
#     Custom User Admin to manage the User model in the Django admin interface.

#     This admin class extends Django's UserAdmin to accommodate our custom fields.
#     """
#     # The fields to be used in displaying the User model.
#     # These override the definitions on the base UserAdmin
#     # that reference specific fields on auth.User.
#     list_display = ('id', 'username', 'fullname', 'email', 'is_staff', 'is_verified', 'last_login', 'created_at')
#     list_filter = ('is_staff', 'is_superuser', 'is_active', 'is_verified', 'groups')
#     fieldsets = (
#         (None, {'fields': ('username', 'password')}),
#         ('Personal info', {'fields': ('fullname', 'email')}),
#         ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
#         ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
#         ('Status', {'fields': ('is_verified',)}),
#     )
#     # add_fieldsets is not a standard ModelAdmin attribute. UserAdmin
#     # overrides get_fieldsets to use this attribute when creating a user.
#     add_fieldsets = (
#         (None, {
#             'classes': ('wide',),
#             'fields': ('username', 'fullname', 'email', 'password1', 'password2'),
#         }),
#     )
#     search_fields = ('username', 'fullname', 'email')
#     ordering = ('email',)

# # Unregister the default User model admin first
# admin.site.unregister(User)

# # Now register the new UserAdmin
# admin.site.register(User, CustomUserAdmin)