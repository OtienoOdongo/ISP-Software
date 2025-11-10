from django.http import JsonResponse
from django.shortcuts import render

def bad_request(request, exception=None):
    if request.headers.get('Content-Type') == 'application/json':
        return JsonResponse({
            'error': 'Bad Request',
            'message': 'The request could not be understood by the server',
            'status_code': 400
        }, status=400)
    return render(request, '400.html', status=400)

def permission_denied(request, exception=None):
    if request.headers.get('Content-Type') == 'application/json':
        return JsonResponse({
            'error': 'Permission Denied',
            'message': 'You do not have permission to access this resource',
            'status_code': 403
        }, status=403)
    return render(request, '403.html', status=403)

def page_not_found(request, exception=None):
    if request.headers.get('Content-Type') == 'application/json':
        return JsonResponse({
            'error': 'Not Found',
            'message': 'The requested resource was not found',
            'status_code': 404
        }, status=404)
    return render(request, '404.html', status=404)

def server_error(request):
    if request.headers.get('Content-Type') == 'application/json':
        return JsonResponse({
            'error': 'Server Error',
            'message': 'An internal server error occurred',
            'status_code': 500
        }, status=500)
    return render(request, '500.html', status=500)