from django.db import models

class Router(models.Model):
    name = models.CharField(max_length=100)
    host = models.CharField(max_length=100)
    user = models.CharField(max_length=50)
    ssh_key = models.TextField(blank=True)  # Stores private key; auto-generated
    ssh_pub_key = models.TextField(blank=True)  # Stores public key for reference
    port = models.PositiveIntegerField(default=22)
    status = models.CharField(max_length=20, default='Disconnected', choices=[('Connected', 'Connected'), ('Disconnected', 'Disconnected')])
    uptime = models.CharField(max_length=50, default='N/A')
    version = models.CharField(max_length=20, default='Unknown')
    bandwidth = models.CharField(max_length=50, default='N/A')
    cpu_usage = models.IntegerField(default=0)
    active_clients = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Router"
        verbose_name_plural = "Routers"