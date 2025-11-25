# from django.http import JsonResponse
# from django.shortcuts import render

# def bad_request(request, exception=None):
#     if request.headers.get('Content-Type') == 'application/json':
#         return JsonResponse({
#             'error': 'Bad Request',
#             'message': 'The request could not be understood by the server',
#             'status_code': 400
#         }, status=400)
#     return render(request, '400.html', status=400)

# def permission_denied(request, exception=None):
#     if request.headers.get('Content-Type') == 'application/json':
#         return JsonResponse({
#             'error': 'Permission Denied',
#             'message': 'You do not have permission to access this resource',
#             'status_code': 403
#         }, status=403)
#     return render(request, '403.html', status=403)

# def page_not_found(request, exception=None):
#     if request.headers.get('Content-Type') == 'application/json':
#         return JsonResponse({
#             'error': 'Not Found',
#             'message': 'The requested resource was not found',
#             'status_code': 404
#         }, status=404)
#     return render(request, '404.html', status=404)

# def server_error(request):
#     if request.headers.get('Content-Type') == 'application/json':
#         return JsonResponse({
#             'error': 'Server Error',
#             'message': 'An internal server error occurred',
#             'status_code': 500
#         }, status=500)
#     return render(request, '500.html', status=500)





"""
Enhanced Error Handlers for Interlink Logic

Provides JSON and HTML error responses for different HTTP status codes.
"""

from django.http import JsonResponse
from django.shortcuts import render
import logging

logger = logging.getLogger(__name__)

def bad_request(request, exception=None):
    """
    Handle 400 Bad Request errors.
    """
    error_data = {
        'error': 'Bad Request',
        'message': 'The request could not be understood by the server',
        'status_code': 400,
        'path': request.path
    }
    
    logger.warning(f"400 Bad Request: {request.path} - {exception}")
    
    if request.headers.get('Content-Type') == 'application/json' or request.path.startswith('/api/'):
        return JsonResponse(error_data, status=400)
    
    # For HTML responses, you can create templates later
    return render(request, '400.html', context=error_data, status=400)

def permission_denied(request, exception=None):
    """
    Handle 403 Permission Denied errors.
    """
    error_data = {
        'error': 'Permission Denied',
        'message': 'You do not have permission to access this resource',
        'status_code': 403,
        'path': request.path
    }
    
    logger.warning(f"403 Permission Denied: {request.path} - User: {request.user} - {exception}")
    
    if request.headers.get('Content-Type') == 'application/json' or request.path.startswith('/api/'):
        return JsonResponse(error_data, status=403)
    
    return render(request, '403.html', context=error_data, status=403)

def page_not_found(request, exception=None):
    """
    Handle 404 Not Found errors.
    """
    error_data = {
        'error': 'Not Found',
        'message': 'The requested resource was not found',
        'status_code': 404,
        'path': request.path
    }
    
    logger.warning(f"404 Not Found: {request.path} - {exception}")
    
    if request.headers.get('Content-Type') == 'application/json' or request.path.startswith('/api/'):
        return JsonResponse(error_data, status=404)
    
    # For development, provide more helpful information
    if hasattr(request, 'is_development') and request.is_development:
        error_data['available_endpoints'] = [
            '/admin/',
            '/api/docs/',
            '/api/auth/',
            '/dashboard/'
        ]
    
    return render(request, '404.html', context=error_data, status=404)

def server_error(request):
    """
    Handle 500 Internal Server Error.
    """
    error_data = {
        'error': 'Server Error',
        'message': 'An internal server error occurred',
        'status_code': 500,
        'path': request.path
    }
    
    logger.error(f"500 Server Error: {request.path}")
    
    if request.headers.get('Content-Type') == 'application/json' or request.path.startswith('/api/'):
        return JsonResponse(error_data, status=500)
    
    return render(request, '500.html', context=error_data, status=500)

def method_not_allowed(request, exception=None):
    """
    Handle 405 Method Not Allowed errors.
    """
    error_data = {
        'error': 'Method Not Allowed',
        'message': 'This method is not allowed for the requested resource',
        'status_code': 405,
        'path': request.path,
        'method': request.method
    }
    
    logger.warning(f"405 Method Not Allowed: {request.method} {request.path}")
    
    if request.headers.get('Content-Type') == 'application/json' or request.path.startswith('/api/'):
        return JsonResponse(error_data, status=405)
    
    return render(request, '405.html', context=error_data, status=405)