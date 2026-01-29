# """
# Authentication Middleware
# Handles request/response logging and authentication-specific middleware functionality
# """

# import json
# import logging
# from django.http import JsonResponse

# logger = logging.getLogger(__name__)

# class RequestResponseLoggingMiddleware:
#     """
#     Middleware for logging request and response details
#     Useful for debugging and monitoring
#     """
#     def __init__(self, get_response):
#         self.get_response = get_response
    
#     def __call__(self, request):
#         # Skip for static files and admin
#         if request.path.startswith('/static/') or request.path.startswith('/admin/'):
#             return self.get_response(request)
        
#         # Log request details for debugging
#         self._log_request(request)
        
#         response = self.get_response(request)
        
#         # Log response details for errors
#         self._log_response(request, response)
        
#         return response
    
#     def _log_request(self, request):
#         """Log request details"""
#         try:
#             if request.path.startswith('/api/auth/'):
#                 logger.debug(f"🔍 API Request: {request.method} {request.path}")
#                 logger.debug(f"   Content-Type: {request.content_type}")
#                 logger.debug(f"   IP: {request.META.get('REMOTE_ADDR', 'unknown')}")
                
#                 if request.method in ['POST', 'PUT', 'PATCH']:
#                     if request.content_type == 'application/json':
#                         try:
#                             body = request.body.decode('utf-8')
#                             if body:
#                                 # Parse and hide sensitive data
#                                 parsed = json.loads(body)
#                                 # Create safe copy for logging
#                                 safe_parsed = parsed.copy()
#                                 # Hide passwords in logs
#                                 if 'password' in safe_parsed:
#                                     safe_parsed['password'] = '[REDACTED]'
#                                 if 'confirm_password' in safe_parsed:
#                                     safe_parsed['confirm_password'] = '[REDACTED]'
#                                 logger.debug(f"   Request Body: {json.dumps(safe_parsed, indent=2)}")
#                         except json.JSONDecodeError:
#                             logger.debug(f"   Request Body (raw): {request.body.decode('utf-8')[:500]}")
#                         except Exception as e:
#                             logger.debug(f"   Could not parse request body: {e}")
#         except Exception as e:
#             logger.debug(f"⚠️ Error logging request: {e}")
    
#     def _log_response(self, request, response):
#         """Log response details"""
#         status_code = response.status_code
        
#         if request.path.startswith('/api/auth/'):
#             if status_code == 400:
#                 logger.warning(f"⚠️ 400 Bad Request: {request.method} {request.path}")
                
#                 try:
#                     # Try to get detailed error information
#                     if hasattr(response, 'data'):
#                         logger.warning(f"❌ Validation errors: {json.dumps(response.data, indent=2)}")
#                     elif hasattr(response, 'content'):
#                         try:
#                             content = response.content.decode('utf-8')
#                             if content:
#                                 parsed = json.loads(content)
#                                 logger.warning(f"❌ Error response: {json.dumps(parsed, indent=2)}")
#                             else:
#                                 logger.warning("❌ Empty response content")
#                         except json.JSONDecodeError:
#                             logger.warning(f"❌ Response content: {content}")
#                         except Exception:
#                             logger.warning(f"❌ Raw response: {response.content[:500]}")
#                 except Exception as e:
#                     logger.warning(f"⚠️ Could not log response details: {e}")
            
#             elif status_code >= 200 and status_code < 300:
#                 logger.debug(f"✅ Response {status_code}: {request.method} {request.path}")
#             elif status_code >= 400:
#                 logger.warning(f"⚠️ Response {status_code}: {request.method} {request.path}")


# class DebugHeadersMiddleware:
#     """
#     Middleware to add debug headers to responses
#     Useful for API debugging
#     """
#     def __init__(self, get_response):
#         self.get_response = get_response
    
#     def __call__(self, request):
#         response = self.get_response(request)
        
#         # Add debug headers in development
#         from django.conf import settings
#         if settings.DEBUG:
#             response['X-API-Version'] = '1.0'
#             response['X-Environment'] = settings.ENVIRONMENT
#             response['X-Processing-Time'] = 'N/A'  # Would need timing middleware
        
#         return response


# class SignalTestMiddleware:
#     """
#     Middleware to test signal connectivity
#     Runs signal tests on first request in development
#     """
#     def __init__(self, get_response):
#         self.get_response = get_response
#         self._signals_tested = False
    
#     def __call__(self, request):
#         # Test signals on first request in development
#         from django.conf import settings
#         if settings.DEBUG and not self._signals_tested:
#             try:
#                 from authentication.signals import test_signal_connection, health_check_signals
                
#                 logger.info("🧪 Testing signal connectivity...")
#                 results = test_signal_connection()
#                 successful = sum(1 for r in results if r.get('status') == 'connected')
#                 total = len(results)
                
#                 if successful == total:
#                     logger.info(f"✅ All {total} signal tests passed")
#                 else:
#                     logger.warning(f"⚠️ {successful}/{total} signal tests passed")
                
#                 self._signals_tested = True
#             except Exception as e:
#                 logger.warning(f"⚠️ Signal test failed: {e}")
        
#         return self.get_response(request)





"""
Simple Authentication Middleware
Avoids circular imports by not importing models at module level
"""

import json
import logging

logger = logging.getLogger(__name__)

class RequestResponseLoggingMiddleware:
    """
    Simple middleware for logging request and response details
    """
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Skip logging for static/admin files
        if request.path.startswith('/static/') or request.path.startswith('/admin/'):
            return self.get_response(request)
        
        # Log request
        self._log_request(request)
        
        # Get response
        response = self.get_response(request)
        
        # Log response for errors
        self._log_response(request, response)
        
        return response
    
    def _log_request(self, request):
        """Log request details without heavy imports"""
        try:
            if request.path.startswith('/api/auth/'):
                logger.debug(f"[AUTH] {request.method} {request.path}")
        except Exception as e:
            pass  # Don't crash on logging errors
    
    def _log_response(self, request, response):
        """Log response details without heavy imports"""
        try:
            if request.path.startswith('/api/auth/') and response.status_code >= 400:
                logger.warning(f"[AUTH] {response.status_code} {request.method} {request.path}")
        except Exception as e:
            pass  # Don't crash on logging errors


class SimpleAuthMiddleware:
    """
    Simple authentication middleware without complex imports
    """
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Just pass through for now
        return self.get_response(request)