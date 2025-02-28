# Manually Update the Site Domain

# python3 manage.py shell


from django.contrib.sites.models import Site

# Get the site with ID 1
site = Site.objects.get(id=1)

# Update the domain and name
site.domain = "localhost:8000"
site.name = "Interlink ISP Software"
site.save()

# Confirm the update
print(Site.objects.all())  # Should now show localhost:8000
