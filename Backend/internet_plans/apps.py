# from django.apps import AppConfig


# class InternetPlansConfig(AppConfig):
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'internet_plans'



from django.apps import AppConfig

class InternetPlansConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'internet_plans'
    
    def ready(self):
        import internet_plans.signals