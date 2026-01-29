# Manually Update the Site Domain

# python3 manage.py shell


from django.contrib.sites.models import Site

# Get the site with ID 1
site = Site.objects.get(id=1)

# Update the domain and name
site.domain = "localhost:5173"
site.name = "Dinconden ISP Software"
site.save()

# Confirm the update
print(Site.objects.all())  # Should now show localhost:8000




# How to Generate encryption key:
# python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"



Create empty initial migration for payments
python manage.py makemigrations payments --empty

Create internet_plans migration (it will depend on payments)
python manage.py makemigrations internet_plans

Now create the actual payments migration
python manage.py makemigrations payments

Migrate
python manage.py migrate

pip freeze | grep -E "channels|msgpack|asgiref" >> requirements.txt



sudo service redis-server start