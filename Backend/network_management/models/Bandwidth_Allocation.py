from django.db import models
from user_management.models import UserProfile  

class Device(models.Model):
    """
    Represents a device associated with a user for bandwidth management.

    Attributes:
        user (ForeignKey): The user profile this device belongs to.
        device_id (IntegerField): A unique identifier for the device.
        mac (CharField): MAC address of the device.
        allocated (CharField): Bandwidth allocated to the device, where 'Unlimited' is a string for unlimited plans.
        used (IntegerField): Bandwidth used by the device.
        qos (CharField): Quality of Service setting for the device.
        quota (CharField): Total bandwidth quota, where 'Unlimited' indicates no limit.
        unlimited (BooleanField): Indicates if the device has unlimited bandwidth.
    """
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='devices')
    device_id = models.IntegerField(unique=True)
    mac = models.CharField(max_length=17)  # MAC addresses are typically 17 characters with colons
    allocated = models.CharField(max_length=20)  # 'Unlimited' or integer as string
    used = models.IntegerField(default=0)
    qos = models.CharField(max_length=10, choices=[('High', 'High'), 
                                                   ('Medium', 'Medium'), 
                                                   ('Low', 'Low')], 
                                                   default='Low')
    quota = models.CharField(max_length=20, default='100')  # 'Unlimited' or integer as string
    unlimited = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.name}'s Device - {self.mac}"