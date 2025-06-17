# # account/models/admin_model.py
# from django.db import models
# from django.contrib.auth import get_user_model
# from phonenumber_field.modelfields import PhoneNumberField

# User = get_user_model()  # Admin user (UserAccount)


# class Client(models.Model):
#     # represents the client user or end-users of the system who are managed by the admin users.
#     full_name = models.CharField(max_length=255)
#     phonenumber = PhoneNumberField(unique=True)  
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.first_name} {self.last_name} ({self.phonenumber})"


# class Subscription(models.Model):
#     client = models.ForeignKey(Client, on_delete=models.CASCADE)
#     is_active = models.BooleanField(default=True)
#     start_date = models.DateTimeField(auto_now_add=True)
#     end_date = models.DateTimeField()

#     def __str__(self):
#         return f"Subscription for {self.client.email}"

# class Payment(models.Model):
#     client = models.ForeignKey(Client, on_delete=models.CASCADE)
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     timestamp = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Payment of {self.amount} by {self.client.email}"

# class ActivityLog(models.Model):
#     user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)  
#     description = models.TextField()
#     timestamp = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Activity: {self.description}"

# class Router(models.Model):
#     name = models.CharField(max_length=100)
#     status = models.CharField(max_length=20, default="Offline")
#     latency = models.FloatField(null=True, blank=True)
#     bandwidth_usage = models.FloatField(null=True, blank=True)
#     color = models.CharField(max_length=20, default="red")

#     def save(self, *args, **kwargs):
#         # Automatically set color based on status
#         if self.status == "Online":
#             self.color = "green"
#         elif self.status == "Offline":
#             self.color = "red"
#         else:
#             self.color = "yellow"
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return self.name






# from django.db import models
# from django.contrib.auth import get_user_model
# from phonenumber_field.modelfields import PhoneNumberField

# User = get_user_model()  # Admin user (UserAccount)

# class Client(models.Model):
#     full_name = models.CharField(max_length=255)
#     phonenumber = PhoneNumberField(unique=True)  # Stores as +254XXXXXXXX
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         # Fixed: Use full_name instead of first_name/last_name
#         return f"{self.full_name} ({self.phonenumber})"

# class Subscription(models.Model):
#     client = models.ForeignKey(Client, on_delete=models.CASCADE)
#     is_active = models.BooleanField(default=True)
#     start_date = models.DateTimeField(auto_now_add=True)
#     end_date = models.DateTimeField()

#     def __str__(self):
#         # Fixed: Use phonenumber instead of email (Client has no email field)
#         return f"Subscription for {self.client.phonenumber}"

# class Payment(models.Model):
#     client = models.ForeignKey(Client, on_delete=models.CASCADE)
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     timestamp = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         # Fixed: Use phonenumber instead of email
#         return f"Payment of {self.amount} by {self.client.phonenumber}"

# class ActivityLog(models.Model):
#     user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
#     description = models.TextField()
#     timestamp = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Activity: {self.description}"

# class Router(models.Model):
#     name = models.CharField(max_length=100)
#     status = models.CharField(max_length=20, default="Offline")
#     latency = models.FloatField(null=True, blank=True)
#     bandwidth_usage = models.FloatField(null=True, blank=True)
#     color = models.CharField(max_length=20, default="red")

#     def save(self, *args, **kwargs):
#         if self.status == "Online":
#             self.color = "green"
#         elif self.status == "Offline":
#             self.color = "red"
#         else:
#             self.color = "yellow"
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return self.name



# from django.db import models
# from django.contrib.auth import get_user_model
# from phonenumber_field.modelfields import PhoneNumberField

# User = get_user_model()

# class Client(models.Model):
#     full_name = models.CharField(max_length=255)
#     phonenumber = PhoneNumberField(unique=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.full_name} ({self.phonenumber})"

# class Subscription(models.Model):
#     client = models.ForeignKey(Client, on_delete=models.CASCADE)
#     is_active = models.BooleanField(default=True)
#     start_date = models.DateTimeField(auto_now_add=True)
#     end_date = models.DateTimeField()

#     def __str__(self):
#         return f"Subscription for {self.client.phonenumber}"

# class Payment(models.Model):
#     client = models.ForeignKey(Client, on_delete=models.CASCADE)
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     timestamp = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Payment of {self.amount} by {self.client.phonenumber}"

# class ActivityLog(models.Model):
#     user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
#     description = models.TextField()
#     timestamp = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Activity: {self.description}"

# class Router(models.Model):
#     name = models.CharField(max_length=100)
#     status = models.CharField(max_length=20, default="Offline")
#     latency = models.FloatField(null=True, blank=True)
#     bandwidth_usage = models.FloatField(null=True, blank=True)
#     color = models.CharField(max_length=20, default="red")

#     def save(self, *args, **kwargs):
#         if self.status == "Online":
#             self.color = "green"
#         elif self.status == "Offline":
#             self.color = "red"
#         else:
#             self.color = "yellow"
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return self.name




# from django.db import models
# from django.contrib.auth import get_user_model
# from phonenumber_field.modelfields import PhoneNumberField
# from internet_plans.models.create_plan_models import InternetPlan
# from payments.models.mpesa_config_model import Transaction

# User = get_user_model()

# class Client(models.Model):
#     full_name = models.CharField(max_length=255)
#     phonenumber = PhoneNumberField(unique=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.full_name} ({self.phonenumber})"

#     class Meta:
#         verbose_name = 'Client'
#         verbose_name_plural = 'Clients'
#         indexes = [
#             models.Index(fields=['phonenumber']),
#         ]

# class Subscription(models.Model):
#     client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='subscriptions')
#     internet_plan = models.ForeignKey(
#         InternetPlan, 
#         on_delete=models.SET_NULL, 
#         null=True, 
#         blank=True, 
#         related_name='subscriptions'
#     )
#     is_active = models.BooleanField(default=True)
#     start_date = models.DateTimeField(auto_now_add=True)
#     end_date = models.DateTimeField()

#     def __str__(self):
#         return f"Subscription for {self.client.phonenumber} ({self.internet_plan.name if self.internet_plan else 'No Plan'})"

#     class Meta:
#         verbose_name = 'Subscription'
#         verbose_name_plural = 'Subscriptions'
#         ordering = ['-start_date']

# class Payment(models.Model):
#     client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='payments')
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     timestamp = models.DateTimeField(auto_now_add=True)
#     transaction = models.ForeignKey(
#         Transaction, 
#         on_delete=models.SET_NULL, 
#         null=True, 
#         blank=True, 
#         related_name='payments'
#     )
#     subscription = models.ForeignKey(
#         Subscription, 
#         on_delete=models.SET_NULL, 
#         null=True, 
#         blank=True, 
#         related_name='payments'
#     )

#     def __str__(self):
#         return f"Payment of {self.amount} by {self.client.phonenumber}"

#     class Meta:
#         verbose_name = 'Payment'
#         verbose_name_plural = 'Payments'
#         ordering = ['-timestamp']

# class ActivityLog(models.Model):
#     user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
#     description = models.TextField()
#     timestamp = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Activity: {self.description}"

#     class Meta:
#         verbose_name = 'Activity Log'
#         verbose_name_plural = 'Activity Logs'
#         ordering = ['-timestamp']

# class Router(models.Model):
#     name = models.CharField(max_length=100)
#     status = models.CharField(max_length=20, default="Offline")
#     latency = models.FloatField(null=True, blank=True)
#     bandwidth_usage = models.FloatField(null=True, blank=True)
#     color = models.CharField(max_length=20, default="red")

#     def save(self, *args, **kwargs):
#         if self.status == "Online":
#             self.color = "green"
#         elif self.status == "Offline":
#             self.color = "red"
#         else:
#             self.color = "yellow"
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return self.name

#     class Meta:
#         verbose_name = 'Router'
#         verbose_name_plural = 'Routers'
#         ordering = ['name']





from django.db import models
from django.contrib.auth import get_user_model
from phonenumber_field.modelfields import PhoneNumberField

User = get_user_model()

class Client(models.Model):
    full_name = models.CharField(max_length=255)
    phonenumber = PhoneNumberField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} ({self.phonenumber})"

    class Meta:
        verbose_name = 'Client'
        verbose_name_plural = 'Clients'
        indexes = [
            models.Index(fields=['phonenumber']),
        ]

class Subscription(models.Model):
    client = models.ForeignKey('Client', on_delete=models.CASCADE, related_name='subscriptions')
    internet_plan = models.ForeignKey(
        'internet_plans.InternetPlan',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subscriptions'
    )
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()

    def __str__(self):
        return f"Subscription for {self.client.phonenumber} ({self.internet_plan.name if self.internet_plan else 'No Plan'})"

    class Meta:
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'
        ordering = ['-start_date']

class Payment(models.Model):
    client = models.ForeignKey('Client', on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)
    transaction = models.ForeignKey(
        'payments.Transaction',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )
    subscription = models.ForeignKey(
        'Subscription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )

    def __str__(self):
        return f"Payment of {self.amount} by {self.client.phonenumber}"

    class Meta:
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-timestamp']

class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Activity: {self.description}"

    class Meta:
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'
        ordering = ['-timestamp']

class Router(models.Model):
    name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default="Offline")
    latency = models.FloatField(null=True, blank=True)
    bandwidth_usage = models.FloatField(null=True, blank=True)
    color = models.CharField(max_length=20, default="red")

    def save(self, *args, **kwargs):
        if self.status == "Online":
            self.color = "green"
        elif self.status == "Offline":
            self.color = "red"
        else:
            self.color = "yellow"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Router'
        verbose_name_plural = 'Routers'
        ordering = ['name']