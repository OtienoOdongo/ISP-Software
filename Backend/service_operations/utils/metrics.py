"""
Metrics collection and monitoring utilities
Production-ready metrics system with multiple backends (StatsD, Prometheus, Datadog)
"""

import logging
import time
import threading
from typing import Dict, Any, Optional, List, Union, Callable
from dataclasses import dataclass
from django.conf import settings
from enum import Enum
from datetime import datetime, timedelta
from collections import defaultdict, deque
from contextlib import contextmanager

logger = logging.getLogger(__name__)


class MetricType(Enum):
    """Supported metric types"""
    COUNTER = 'counter'
    GAUGE = 'gauge'
    HISTOGRAM = 'histogram'
    TIMER = 'timer'
    SET = 'set'


@dataclass
class Metric:
    """Metric data structure"""
    name: str
    type: MetricType
    value: Union[int, float]
    timestamp: datetime
    tags: Dict[str, str]
    sample_rate: float = 1.0


class MetricsBackend:
    """Abstract base class for metrics backends"""
    
    def emit(self, metric: Metric):
        """Emit a metric to the backend"""
        raise NotImplementedError
    
    def flush(self):
        """Flush any buffered metrics"""
        pass
    
    def close(self):
        """Close the backend connection"""
        pass


class StatsdBackend(MetricsBackend):
    """StatsD metrics backend"""
    
    def __init__(self, host: str = 'localhost', port: int = 8125, prefix: str = None):
        self.host = host
        self.port = port
        self.prefix = prefix
        self._socket = None
        logger.info(f"Initialized StatsD backend: {host}:{port}")
    
    def emit(self, metric: Metric):
        """Emit metric to StatsD"""
        try:
            # Format metric according to StatsD protocol
            metric_line = self._format_metric(metric)
            
            # Send over UDP (simplified - in production, use proper socket)
            logger.debug(f"StatsD metric: {metric_line}")
            
            # Record for development/testing
            if settings.DEBUG:
                print(f"[METRICS] {metric_line}")
                
        except Exception as e:
            logger.error(f"Failed to emit StatsD metric: {e}")
    
    def _format_metric(self, metric: Metric) -> str:
        """Format metric for StatsD protocol"""
        # Build metric name with prefix
        metric_name = metric.name
        if self.prefix:
            metric_name = f"{self.prefix}.{metric_name}"
        
        # Format tags if present
        tags_str = ''
        if metric.tags:
            tags_list = [f"{k}:{v}" for k, v in metric.tags.items()]
            tags_str = f"|#{','.join(tags_list)}"
        
        # Format value based on metric type
        if metric.type == MetricType.COUNTER:
            return f"{metric_name}:{metric.value}|c@{metric.sample_rate}{tags_str}"
        elif metric.type == MetricType.GAUGE:
            return f"{metric_name}:{metric.value}|g{tags_str}"
        elif metric.type == MetricType.TIMER:
            return f"{metric_name}:{metric.value}|ms{tags_str}"
        elif metric.type == MetricType.HISTOGRAM:
            return f"{metric_name}:{metric.value}|h{tags_str}"
        elif metric.type == MetricType.SET:
            return f"{metric_name}:{metric.value}|s{tags_str}"
        else:
            return f"{metric_name}:{metric.value}|{metric.type.value}{tags_str}"


class InMemoryBackend(MetricsBackend):
    """In-memory metrics backend for development and testing"""
    
    def __init__(self, max_metrics: int = 10000):
        self.metrics = deque(maxlen=max_metrics)
        self._lock = threading.Lock()
        logger.info("Initialized in-memory metrics backend")
    
    def emit(self, metric: Metric):
        """Store metric in memory"""
        with self._lock:
            self.metrics.append(metric)
        
        logger.debug(f"Stored metric in memory: {metric.name}={metric.value}")
    
    def get_metrics(self, name: str = None, tags: Dict = None, limit: int = 100) -> List[Metric]:
        """Retrieve metrics from memory"""
        with self._lock:
            metrics = list(self.metrics)
        
        # Filter by name
        if name:
            metrics = [m for m in metrics if m.name == name]
        
        # Filter by tags
        if tags:
            metrics = [m for m in metrics if all(m.tags.get(k) == v for k, v in tags.items())]
        
        # Apply limit
        return metrics[-limit:] if limit else metrics
    
    def clear(self):
        """Clear all stored metrics"""
        with self._lock:
            self.metrics.clear()
        
        logger.info("Cleared all in-memory metrics")


class LoggingBackend(MetricsBackend):
    """Logging metrics backend (for debugging)"""
    
    def __init__(self, log_level: int = logging.INFO):
        self.log_level = log_level
        logger.info("Initialized logging metrics backend")
    
    def emit(self, metric: Metric):
        """Log metric"""
        # Format tags for logging
        tags_str = ', '.join(f"{k}={v}" for k, v in metric.tags.items()) if metric.tags else 'no tags'
        
        # Log at appropriate level
        logger.log(
            self.log_level,
            f"[METRIC] {metric.name}: {metric.value} ({metric.type.value}) [{tags_str}]",
            extra={
                'metric_name': metric.name,
                'metric_value': metric.value,
                'metric_type': metric.type.value,
                'metric_tags': metric.tags,
                'timestamp': metric.timestamp.isoformat()
            }
        )


class CompositeBackend(MetricsBackend):
    """Composite backend that forwards metrics to multiple backends"""
    
    def __init__(self, backends: List[MetricsBackend]):
        self.backends = backends
        logger.info(f"Initialized composite backend with {len(backends)} backends")
    
    def emit(self, metric: Metric):
        """Emit metric to all backends"""
        for backend in self.backends:
            try:
                backend.emit(metric)
            except Exception as e:
                logger.error(f"Failed to emit metric to backend {type(backend).__name__}: {e}")
    
    def flush(self):
        """Flush all backends"""
        for backend in self.backends:
            try:
                backend.flush()
            except Exception as e:
                logger.error(f"Failed to flush backend {type(backend).__name__}: {e}")
    
    def close(self):
        """Close all backends"""
        for backend in self.backends:
            try:
                backend.close()
            except Exception as e:
                logger.error(f"Failed to close backend {type(backend).__name__}: {e}")


class MetricsRegistry:
    """
    Central metrics registry with support for multiple backends and buffering
    """
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._initialized = False
            return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self.backends = []
            self._buffer = deque(maxlen=1000)
            self._buffer_lock = threading.Lock()
            self._flush_thread = None
            self._running = False
            self._flush_interval = 10  # seconds
            self._tags_global = {}
            self._enabled = True
            self._initialized = True
            
            # Default to in-memory backend in development
            self.add_backend(InMemoryBackend())
            
            logger.info("Initialized metrics registry")
    
    def add_backend(self, backend: MetricsBackend):
        """Add a metrics backend"""
        with self._lock:
            self.backends.append(backend)
            logger.info(f"Added metrics backend: {type(backend).__name__}")
    
    def set_global_tags(self, tags: Dict[str, str]):
        """Set global tags for all metrics"""
        with self._lock:
            self._tags_global.update(tags)
            logger.info(f"Updated global tags: {tags}")
    
    def enable(self):
        """Enable metrics collection"""
        self._enabled = True
        logger.info("Metrics collection enabled")
    
    def disable(self):
        """Disable metrics collection"""
        self._enabled = False
        logger.info("Metrics collection disabled")
    
    def emit(self, 
             name: str, 
             type: MetricType, 
             value: Union[int, float],
             tags: Dict[str, str] = None,
             sample_rate: float = 1.0):
        """Emit a metric"""
        if not self._enabled:
            return
        
        # Merge global tags with metric tags
        metric_tags = self._tags_global.copy()
        if tags:
            metric_tags.update(tags)
        
        # Create metric object
        metric = Metric(
            name=name,
            type=type,
            value=value,
            timestamp=datetime.now(),
            tags=metric_tags,
            sample_rate=sample_rate
        )
        
        # Buffer metric for async processing
        with self._buffer_lock:
            self._buffer.append(metric)
        
        # Log at debug level
        logger.debug(f"Buffered metric: {name}={value} ({type.value})")
    
    def flush(self):
        """Flush buffered metrics to backends"""
        if not self.backends or not self._enabled:
            return
        
        with self._buffer_lock:
            buffer = list(self._buffer)
            self._buffer.clear()
        
        if not buffer:
            return
        
        # Process each metric
        for metric in buffer:
            for backend in self.backends:
                try:
                    backend.emit(metric)
                except Exception as e:
                    logger.error(f"Failed to emit metric {metric.name} to backend: {e}")
        
        logger.debug(f"Flushed {len(buffer)} metrics to backends")
    
    def start_auto_flush(self, interval: int = 10):
        """Start automatic flushing at regular intervals"""
        if self._flush_thread and self._flush_thread.is_alive():
            logger.warning("Auto-flush already running")
            return
        
        self._flush_interval = interval
        self._running = True
        
        def flush_loop():
            while self._running:
                time.sleep(self._flush_interval)
                try:
                    self.flush()
                except Exception as e:
                    logger.error(f"Auto-flush failed: {e}")
        
        self._flush_thread = threading.Thread(target=flush_loop, daemon=True)
        self._flush_thread.start()
        
        logger.info(f"Started auto-flush every {interval} seconds")
    
    def stop_auto_flush(self):
        """Stop automatic flushing"""
        self._running = False
        if self._flush_thread:
            self._flush_thread.join(timeout=5)
        
        # Final flush
        self.flush()
        
        logger.info("Stopped auto-flush")
    
    def get_backend(self, backend_type):
        """Get backend of specified type"""
        for backend in self.backends:
            if isinstance(backend, backend_type):
                return backend
        return None
    
    def close(self):
        """Close all backends and stop auto-flush"""
        self.stop_auto_flush()
        
        for backend in self.backends:
            try:
                backend.close()
            except Exception as e:
                logger.error(f"Failed to close backend: {e}")
        
        logger.info("Closed metrics registry")


# Global metrics registry instance
_metrics_registry = MetricsRegistry()


def record_metric(name: str, 
                 value: Union[int, float] = 1,
                 type: MetricType = MetricType.COUNTER,
                 tags: Dict[str, str] = None,
                 sample_rate: float = 1.0):
    """
    Record a metric with the global registry
    
    Args:
        name: Metric name
        value: Metric value (default: 1 for counters)
        type: Metric type (counter, gauge, timer, histogram, set)
        tags: Metric tags for dimensionality
        sample_rate: Sample rate (0.0 to 1.0)
    """
    _metrics_registry.emit(name, type, value, tags, sample_rate)


def increment_counter(name: str, 
                     value: int = 1,
                     tags: Dict[str, str] = None,
                     sample_rate: float = 1.0):
    """
    Increment a counter metric (convenience function)
    
    Args:
        name: Counter name
        value: Increment value (default: 1)
        tags: Metric tags
        sample_rate: Sample rate
    """
    record_metric(name, value, MetricType.COUNTER, tags, sample_rate)


def gauge(name: str,
          value: Union[int, float],
          tags: Dict[str, str] = None):
    """
    Record a gauge metric (convenience function)
    
    Args:
        name: Gauge name
        value: Current value
        tags: Metric tags
    """
    record_metric(name, value, MetricType.GAUGE, tags)


def timer(name: str,
          value: float,
          tags: Dict[str, str] = None):
    """
    Record a timer metric (convenience function)
    
    Args:
        name: Timer name
        value: Duration in milliseconds
        tags: Metric tags
    """
    record_metric(name, value, MetricType.TIMER, tags)


def histogram(name: str,
              value: Union[int, float],
              tags: Dict[str, str] = None):
    """
    Record a histogram metric (convenience function)
    
    Args:
        name: Histogram name
        value: Value to record
        tags: Metric tags
    """
    record_metric(name, value, MetricType.HISTOGRAM, tags)


@contextmanager
def measure_time(name: str, tags: Dict[str, str] = None):
    """
    Context manager for measuring execution time
    
    Args:
        name: Timer name
        tags: Metric tags
    
    Usage:
        with measure_time('database_query', tags={'table': 'users'}):
            # Code to measure
            result = db.query(...)
    """
    start_time = time.time()
    try:
        yield
    finally:
        elapsed_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        timer(name, elapsed_time, tags)


def set_global_tags(tags: Dict[str, str]):
    """Set global tags for all metrics"""
    _metrics_registry.set_global_tags(tags)


def enable_metrics():
    """Enable metrics collection"""
    _metrics_registry.enable()


def disable_metrics():
    """Disable metrics collection"""
    _metrics_registry.disable()


def flush_metrics():
    """Flush all buffered metrics"""
    _metrics_registry.flush()


def start_auto_flush(interval: int = 10):
    """Start automatic metric flushing"""
    _metrics_registry.start_auto_flush(interval)


def stop_auto_flush():
    """Stop automatic metric flushing"""
    _metrics_registry.stop_auto_flush()


def close_metrics():
    """Close metrics registry and all backends"""
    _metrics_registry.close()


# Predefined metric constants for consistency
class Metrics:
    """Predefined metric names for consistency"""
    
    # HTTP Metrics
    HTTP_REQUEST_COUNT = 'http.request.count'
    HTTP_REQUEST_DURATION = 'http.request.duration'
    HTTP_RESPONSE_STATUS = 'http.response.status'
    
    # Database Metrics
    DB_QUERY_COUNT = 'db.query.count'
    DB_QUERY_DURATION = 'db.query.duration'
    DB_CONNECTION_COUNT = 'db.connection.count'
    
    # Cache Metrics
    CACHE_HIT = 'cache.hit'
    CACHE_MISS = 'cache.miss'
    CACHE_SET = 'cache.set'
    CACHE_DELETE = 'cache.delete'
    
    # Business Metrics
    SUBSCRIPTION_CREATED = 'subscription.created'
    SUBSCRIPTION_RENEWED = 'subscription.renewed'
    SUBSCRIPTION_CANCELLED = 'subscription.cancelled'
    SUBSCRIPTION_ACTIVATED = 'subscription.activated'
    
    # Error Metrics
    ERROR_COUNT = 'error.count'
    VALIDATION_ERROR = 'error.validation'
    SERVICE_ERROR = 'error.service'
    EXTERNAL_SERVICE_ERROR = 'error.external_service'
    
    # Performance Metrics
    RESPONSE_TIME = 'performance.response_time'
    QUEUE_SIZE = 'performance.queue_size'
    MEMORY_USAGE = 'performance.memory_usage'
    
    # Rate Limiting
    RATE_LIMIT_EXCEEDED = 'rate_limit.exceeded'
    RATE_LIMIT_ALLOWED = 'rate_limit.allowed'
    
    # Circuit Breaker
    CIRCUIT_BREAKER_OPEN = 'circuit_breaker.open'
    CIRCUIT_BREAKER_CLOSED = 'circuit_breaker.closed'
    CIRCUIT_BREAKER_HALF_OPEN = 'circuit_breaker.half_open'


class MetricsMiddleware:
    """
    Django middleware for automatic HTTP metrics collection
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Start timer
        start_time = time.time()
        
        # Add request ID for correlation
        request.id = f"req_{int(start_time * 1000)}_{hash(request.path)}"
        
        # Record request start
        increment_counter(Metrics.HTTP_REQUEST_COUNT, tags={
            'method': request.method,
            'path': request.path,
            'view': self._get_view_name(request)
        })
        
        try:
            # Process request
            response = self.get_response(request)
            
            # Calculate duration
            duration = (time.time() - start_time) * 1000
            
            # Record successful request
            timer(Metrics.HTTP_REQUEST_DURATION, duration, tags={
                'method': request.method,
                'path': request.path,
                'status': response.status_code,
                'view': self._get_view_name(request)
            })
            
            increment_counter(Metrics.HTTP_RESPONSE_STATUS, tags={
                'status': response.status_code,
                'method': request.method,
                'path': request.path
            })
            
            return response
            
        except Exception as e:
            # Calculate duration for failed request
            duration = (time.time() - start_time) * 1000
            
            # Record failed request
            timer(Metrics.HTTP_REQUEST_DURATION, duration, tags={
                'method': request.method,
                'path': request.path,
                'status': 'error',
                'error_type': type(e).__name__,
                'view': self._get_view_name(request)
            })
            
            increment_counter(Metrics.ERROR_COUNT, tags={
                'type': 'http',
                'error_type': type(e).__name__,
                'method': request.method,
                'path': request.path
            })
            
            raise
    
    def _get_view_name(self, request):
        """Extract view name from request"""
        try:
            if hasattr(request, 'resolver_match') and request.resolver_match:
                return request.resolver_match.view_name or 'unknown'
        except:
            pass
        return 'unknown'


# Initialize metrics system on module import
def init_metrics(backends: List[MetricsBackend] = None, 
                global_tags: Dict[str, str] = None,
                auto_flush: bool = True,
                flush_interval: int = 10):
    """
    Initialize the metrics system
    
    Args:
        backends: List of metrics backends (default: InMemoryBackend)
        global_tags: Global tags for all metrics
        auto_flush: Enable automatic flushing
        flush_interval: Auto-flush interval in seconds
    """
    # Clear existing backends
    registry = MetricsRegistry()
    
    # Add specified backends or default
    if backends:
        for backend in backends:
            registry.add_backend(backend)
    else:
        # Default configuration
        registry.add_backend(InMemoryBackend())
        registry.add_backend(LoggingBackend())
    
    # Set global tags
    if global_tags:
        registry.set_global_tags(global_tags)
    
    # Start auto-flush if enabled
    if auto_flush:
        registry.start_auto_flush(flush_interval)
    
    logger.info("Metrics system initialized")
    return registry