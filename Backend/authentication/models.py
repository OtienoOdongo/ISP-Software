# from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
# from django.db import models


# class UserAccountManager(BaseUserManager):
#     def create_user(self, name, email, password=None):
#         if not email:
#             raise ValueError('Users must have an email address')
#         email = self.normalize_email(email)
#         user = self.model(email=email, name=name)
        
#         user.set_password(password)
#         user.save()
        
#         return user

# class UserAccount(AbstractBaseUser, PermissionsMixin):
#     name = models.CharField(max_length=255)
#     email = models.EmailField(max_length=255, unique=True)
#     profile_pic = models.ImageField(upload_to="profile_pics/", null=True, blank=True)
#     is_active = models.BooleanField(default=True)
#     is_staff = models.BooleanField(default=False)
    
    
#     objects = UserAccountManager()
    

#     USERNAME_FIELD = 'email'
#     REQUIRED_FIELDS = ['name']
    
    
#     def get_full_name(self):
#         return self.name
    
#     def get_short_name(self):
#         return self.name

#     def __str__(self):
#         return self.email




# authentication/models.py
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models

class UserAccountManager(BaseUserManager):
    def create_user(self, name, email, password=None, is_staff=False):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, is_staff=is_staff)
        
        user.set_password(password)
        user.save()
        
        return user

    def create_superuser(self, name, email, password=None):
        user = self.create_user(
            name=name,
            email=email,
            password=password,
            is_staff=True  
        )
        user.is_superuser = True
        user.save()
        return user

class UserAccount(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, unique=True)
    profile_pic = models.ImageField(upload_to="profile_pics/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    objects = UserAccountManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    def get_full_name(self):
        return self.name
    
    def get_short_name(self):
        return self.name

    def __str__(self):
        return self.email