# """
# Signal Testing Utilities
# Helper functions for testing signals
# """

# import logging
# from typing import Dict, Any, List, Callable
# from unittest.mock import Mock
# from django.dispatch import receiver
# from .core import (
#     pppoe_credentials_generated,
#     client_account_created,
#     pppoe_credentials_updated,
#     account_status_changed,
#     authentication_failed,
#     send_notification,
# )

# logger = logging.getLogger(__name__)

# # ==================== TESTING UTILITIES ====================

# class mock_signal_receiver:
#     """
#     Context manager for mocking signal receivers during tests
#     Captures all signal emissions for assertion
#     """
    
#     def __init__(self, signal, **kwargs):
#         self.signal = signal
#         self.kwargs = kwargs
#         self.received_signals = []
#         self.mock_receiver = None
    
#     def __enter__(self):
#         self.mock_receiver = Mock()
        
#         @receiver(self.signal, **self.kwargs)
#         def handle_signal(sender, **kwargs):
#             self.received_signals.append({
#                 'sender': sender,
#                 'kwargs': kwargs
#             })
#             self.mock_receiver(sender, **kwargs)
        
#         self.signal_handler = handle_signal
#         return self
    
#     def __exit__(self, exc_type, exc_val, exc_tb):
#         # Disconnect the receiver
#         self.signal.disconnect(self.signal_handler)
    
#     @property
#     def call_count(self):
#         return len(self.received_signals)
    
#     def get_received_data(self):
#         return self.received_signals
    
#     def assert_called(self, times=1):
#         assert self.call_count == times, f"Expected {times} calls, got {self.call_count}"
    
#     def assert_not_called(self):
#         assert self.call_count == 0, f"Expected no calls, got {self.call_count}"

# class capture_signals:
#     """
#     Capture all signals emitted within context
#     Useful for integration tests
#     """
    
#     def __init__(self, *signals):
#         self.signals = signals or [
#             pppoe_credentials_generated,
#             client_account_created,
#             pppoe_credentials_updated,
#             account_status_changed,
#             authentication_failed,
#             send_notification,
#         ]
#         self.captured = {}
#         self.handlers = {}
    
#     def __enter__(self):
#         for signal in self.signals:
#             self.captured[signal] = []
            
#             def create_handler(sig):
#                 def handler(sender, **kwargs):
#                     self.captured[sig].append({
#                         'sender': sender,
#                         'kwargs': kwargs,
#                         'timestamp': time.time()
#                     })
#                 return handler
            
#             handler = create_handler(signal)
#             self.handlers[signal] = handler
#             signal.connect(handler, weak=False)
        
#         return self
    
#     def __exit__(self, exc_type, exc_val, exc_tb):
#         for signal, handler in self.handlers.items():
#             signal.disconnect(handler)
    
#     def get_captured(self, signal=None):
#         if signal:
#             return self.captured.get(signal, [])
#         return self.captured
    
#     def count(self, signal=None):
#         if signal:
#             return len(self.captured.get(signal, []))
#         return sum(len(sigs) for sigs in self.captured.values())
    
#     def filter(self, signal, **kwargs):
#         """Filter captured signals by keyword arguments"""
#         filtered = []
#         for capture in self.captured.get(signal, []):
#             if all(capture['kwargs'].get(k) == v for k, v in kwargs.items()):
#                 filtered.append(capture)
#         return filtered

# # ==================== TEST DATA GENERATORS ====================

# def generate_test_pppoe_credentials_signal():
#     """Generate test data for PPPoE credentials signal"""
#     import uuid
#     import time
    
#     return {
#         'user_id': str(uuid.uuid4()),
#         'username': f"test_user_{int(time.time())}",
#         'pppoe_username': f"testpppoe_{int(time.time() % 10000)}",
#         'password': 'TestPass123!@#',
#         'phone_number': '+254711111111',
#         'client_name': 'Test Client',
#         'connection_type': 'pppoe',
#         'timestamp': time.time(),
#     }

# def generate_test_client_creation_signal():
#     """Generate test data for client creation signal"""
#     import uuid
#     import time
    
#     return {
#         'user_id': str(uuid.uuid4()),
#         'username': f"test_client_{int(time.time())}",
#         'phone_number': '+254722222222',
#         'connection_type': 'hotspot',
#         'client_name': 'Test Hotspot Client',
#         'created_by_admin': True,
#         'timestamp': time.time(),
#     }

# # ==================== SIGNAL TEST SUITE ====================

# class SignalTestSuite:
#     """
#     Comprehensive signal testing utility
#     """
    
#     def __init__(self):
#         self.results = {}
    
#     def test_signal_emission(self, emitter_function, test_data):
#         """Test signal emission with given data"""
#         with capture_signals() as captured:
#             try:
#                 result = emitter_function(**test_data)
#                 signals_emitted = captured.count()
                
#                 self.results[emitter_function.__name__] = {
#                     'status': 'success' if signals_emitted > 0 else 'no_signals',
#                     'result': result,
#                     'signals_emitted': signals_emitted,
#                     'captured_data': captured.get_captured(),
#                     'error': None
#                 }
                
#                 logger.info(f"Test {emitter_function.__name__}: {signals_emitted} signals emitted")
#                 return True
                
#             except Exception as e:
#                 self.results[emitter_function.__name__] = {
#                     'status': 'error',
#                     'result': None,
#                     'signals_emitted': 0,
#                     'captured_data': {},
#                     'error': str(e)
#                 }
                
#                 logger.error(f"Test {emitter_function.__name__} failed: {e}")
#                 return False
    
#     def run_all_tests(self):
#         """Run all signal emission tests"""
#         test_cases = [
#             (emit_pppoe_credentials_generated, generate_test_pppoe_credentials_signal()),
#             (emit_client_account_created, generate_test_client_creation_signal()),
#         ]
        
#         for emitter, test_data in test_cases:
#             self.test_signal_emission(emitter, test_data)
        
#         return self.results
    
#     def get_summary(self):
#         """Get test summary"""
#         total = len(self.results)
#         success = sum(1 for r in self.results.values() if r['status'] == 'success')
#         failed = sum(1 for r in self.results.values() if r['status'] == 'error')
#         no_signals = sum(1 for r in self.results.values() if r['status'] == 'no_signals')
        
#         return {
#             'total_tests': total,
#             'successful': success,
#             'failed': failed,
#             'no_signals': no_signals,
#             'success_rate': (success / total * 100) if total > 0 else 0
#         }

# # Import time module for test utilities
# import time









"""
Signal Testing Utilities
Helper functions for testing signals
"""

import logging
import time
from typing import Dict, Any, List
from unittest.mock import Mock
from django.dispatch import receiver

# Import signals from core module
from .core import (
    pppoe_credentials_generated,
    client_account_created,
    pppoe_credentials_updated,
    account_status_changed,
    authentication_failed,
    send_notification,
)

# Import emitters from emitters module
from .emitters import (
    emit_pppoe_credentials_generated,
    emit_client_account_created,
    emit_pppoe_credentials_updated,
    emit_account_status_changed,
    emit_authentication_failed,
    emit_custom_notification,
)

logger = logging.getLogger(__name__)

# ==================== TESTING UTILITIES ====================

class mock_signal_receiver:
    """
    Context manager for mocking signal receivers during tests
    Captures all signal emissions for assertion
    """
    
    def __init__(self, signal, **kwargs):
        self.signal = signal
        self.kwargs = kwargs
        self.received_signals = []
        self.mock_receiver = None
    
    def __enter__(self):
        self.mock_receiver = Mock()
        
        @receiver(self.signal, **self.kwargs)
        def handle_signal(sender, **kwargs):
            self.received_signals.append({
                'sender': sender,
                'kwargs': kwargs
            })
            self.mock_receiver(sender, **kwargs)
        
        self.signal_handler = handle_signal
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        # Disconnect the receiver
        self.signal.disconnect(self.signal_handler)
    
    @property
    def call_count(self):
        return len(self.received_signals)
    
    def get_received_data(self):
        return self.received_signals
    
    def assert_called(self, times=1):
        assert self.call_count == times, f"Expected {times} calls, got {self.call_count}"
    
    def assert_not_called(self):
        assert self.call_count == 0, f"Expected no calls, got {self.call_count}"

class capture_signals:
    """
    Capture all signals emitted within context
    Useful for integration tests
    """
    
    def __init__(self, *signals):
        self.signals = signals or [
            pppoe_credentials_generated,
            client_account_created,
            pppoe_credentials_updated,
            account_status_changed,
            authentication_failed,
            send_notification,
        ]
        self.captured = {}
        self.handlers = {}
    
    def __enter__(self):
        for signal in self.signals:
            self.captured[signal] = []
            
            def create_handler(sig):
                def handler(sender, **kwargs):
                    self.captured[sig].append({
                        'sender': sender,
                        'kwargs': kwargs,
                        'timestamp': time.time()
                    })
                return handler
            
            handler = create_handler(signal)
            self.handlers[signal] = handler
            signal.connect(handler, weak=False)
        
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        for signal, handler in self.handlers.items():
            signal.disconnect(handler)
    
    def get_captured(self, signal=None):
        if signal:
            return self.captured.get(signal, [])
        return self.captured
    
    def count(self, signal=None):
        if signal:
            return len(self.captured.get(signal, []))
        return sum(len(sigs) for sigs in self.captured.values())
    
    def filter(self, signal, **kwargs):
        """Filter captured signals by keyword arguments"""
        filtered = []
        for capture in self.captured.get(signal, []):
            if all(capture['kwargs'].get(k) == v for k, v in kwargs.items()):
                filtered.append(capture)
        return filtered

# ==================== TEST DATA GENERATORS ====================

def generate_test_pppoe_credentials_signal():
    """Generate test data for PPPoE credentials signal"""
    import uuid
    
    return {
        'user_id': str(uuid.uuid4()),
        'username': f"test_user_{int(time.time())}",
        'pppoe_username': f"testpppoe_{int(time.time() % 10000)}",
        'password': 'TestPass123!@#',
        'phone_number': '+254711111111',
        'client_name': 'Test Client',
        'connection_type': 'pppoe',
        'timestamp': time.time(),
    }

def generate_test_client_creation_signal():
    """Generate test data for client creation signal"""
    import uuid
    
    return {
        'user_id': str(uuid.uuid4()),
        'username': f"test_client_{int(time.time())}",
        'phone_number': '+254722222222',
        'connection_type': 'hotspot',
        'client_name': 'Test Hotspot Client',
        'created_by_admin': True,
        'timestamp': time.time(),
    }

# ==================== SIGNAL TEST SUITE ====================

class SignalTestSuite:
    """
    Comprehensive signal testing utility
    """
    
    def __init__(self):
        self.results = {}
    
    def test_signal_emission(self, emitter_function, test_data):
        """Test signal emission with given data"""
        with capture_signals() as captured:
            try:
                result = emitter_function(**test_data)
                signals_emitted = captured.count()
                
                self.results[emitter_function.__name__] = {
                    'status': 'success' if signals_emitted > 0 else 'no_signals',
                    'result': result,
                    'signals_emitted': signals_emitted,
                    'captured_data': captured.get_captured(),
                    'error': None
                }
                
                logger.info(f"Test {emitter_function.__name__}: {signals_emitted} signals emitted")
                return True
                
            except Exception as e:
                self.results[emitter_function.__name__] = {
                    'status': 'error',
                    'result': None,
                    'signals_emitted': 0,
                    'captured_data': {},
                    'error': str(e)
                }
                
                logger.error(f"Test {emitter_function.__name__} failed: {e}")
                return False
    
    def run_all_tests(self):
        """Run all signal emission tests"""
        test_cases = [
            (emit_pppoe_credentials_generated, generate_test_pppoe_credentials_signal()),
            (emit_client_account_created, generate_test_client_creation_signal()),
        ]
        
        for emitter, test_data in test_cases:
            self.test_signal_emission(emitter, test_data)
        
        return self.results
    
    def get_summary(self):
        """Get test summary"""
        total = len(self.results)
        success = sum(1 for r in self.results.values() if r['status'] == 'success')
        failed = sum(1 for r in self.results.values() if r['status'] == 'error')
        no_signals = sum(1 for r in self.results.values() if r['status'] == 'no_signals')
        
        return {
            'total_tests': total,
            'successful': success,
            'failed': failed,
            'no_signals': no_signals,
            'success_rate': (success / total * 100) if total > 0 else 0
        }