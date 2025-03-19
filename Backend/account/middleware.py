# account/middleware.py
from django.middleware.csrf import CsrfViewMiddleware

class CustomCsrfMiddleware(CsrfViewMiddleware):
    def process_view(self, request, view_func, view_args, view_kwargs):
        # Skip CSRF checks for paths starting with /api/
        if request.path.startswith('/api/'):
            return None
        return super().process_view(request, view_func, view_args, view_kwargs)