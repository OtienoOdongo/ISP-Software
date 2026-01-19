

# """
# Integrated User Management Models with Internet Plan Integration
# Production-ready with complete plan management
# """
# from django.db import models
# from django.utils import timezone
# from django.core.validators import MinValueValidator, MaxValueValidator
# from django.db.models import Avg, Sum, Count, Q
# from django.core.cache import cache
# import logging
# import uuid
# from decimal import Decimal
# import json
# import re
# from cryptography.fernet import Fernet
# from django.conf import settings

# logger = logging.getLogger(__name__)

# try:
#     from authentication.models import UserAccount, PhoneValidation
#     AUTH_APP_AVAILABLE = True
# except ImportError:
#     logger.error("Authentication app not found. Please ensure it's installed.")
#     AUTH_APP_AVAILABLE = False
#     # Create dummy class for development
#     class UserAccount:
#         pass


# class ClientProfile(models.Model):
#     """
#     Comprehensive client profile EXTENDING UserAccount
#     Integrated with Internet Plans
#     """
#     class ClientTier(models.TextChoices):
#         NEW = 'new', 'New Client'
#         BRONZE = 'bronze', 'Bronze'
#         SILVER = 'silver', 'Silver'
#         GOLD = 'gold', 'Gold'
#         PLATINUM = 'platinum', 'Platinum'
#         DIAMOND = 'diamond', 'Diamond'
#         VIP = 'vip', 'VIP'
    
#     class ClientStatus(models.TextChoices):
#         ACTIVE = 'active', 'Active'
#         INACTIVE = 'inactive', 'Inactive'
#         SUSPENDED = 'suspended', 'Suspended'
#         TRIAL = 'trial', 'Trial'
#         AT_RISK = 'at_risk', 'At Risk'
#         CHURNED = 'churned', 'Churned'
    
#     user = models.OneToOneField(
#         UserAccount if AUTH_APP_AVAILABLE else 'authentication.UserAccount',
#         on_delete=models.CASCADE,
#         related_name='business_profile',
#         help_text="Linked user from authentication system"
#     )
    
#     # Basic Information
#     client_type = models.CharField(
#         max_length=20,
#         choices=[
#             ('residential', 'Residential'),
#             ('business', 'Business'),
#             ('corporate', 'Corporate'),
#             ('student', 'Student')
#         ],
#         default='residential'
#     )
    
#     tier = models.CharField(
#         max_length=20,
#         choices=ClientTier.choices,
#         default=ClientTier.NEW
#     )
    
#     status = models.CharField(
#         max_length=20,
#         choices=ClientStatus.choices,
#         default=ClientStatus.ACTIVE
#     )
    
#     # Referral & Marketing System
#     referral_code = models.CharField(
#         max_length=12,
#         unique=True,
#         db_index=True,
#         blank=True,
#         help_text="Unique referral code"
#     )
    
#     referred_by = models.ForeignKey(
#         'self',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='referrals',
#         help_text="Client who referred this client"
#     )
    
#     is_marketer = models.BooleanField(default=False)
#     marketer_tier = models.CharField(
#         max_length=20,
#         choices=[
#             ('novice', 'Novice'),
#             ('intermediate', 'Intermediate'),
#             ('expert', 'Expert'),
#             ('master', 'Master')
#         ],
#         default='novice'
#     )
    
#     # Financial Analytics
#     lifetime_value = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         default=0.00,
#         validators=[MinValueValidator(0)]
#     )
    
#     monthly_recurring_revenue = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         default=0.00
#     )
    
#     total_revenue = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         default=0.00
#     )
    
#     avg_monthly_spend = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         default=0.00
#     )
    
#     # Commission Tracking
#     commission_balance = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         default=0.00
#     )
    
#     total_commission_earned = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         default=0.00
#     )
    
#     commission_rate = models.DecimalField(
#         max_digits=5,
#         decimal_places=2,
#         default=10.00
#     )
    
#     # Usage Analytics
#     total_data_used_gb = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         default=0.00
#     )
    
#     avg_monthly_data_gb = models.DecimalField(
#         max_digits=8,
#         decimal_places=2,
#         default=0.00
#     )
    
#     peak_usage_hour = models.IntegerField(
#         null=True,
#         blank=True,
#         help_text="Hour (0-23) of peak usage"
#     )
    
#     # Behavioral Metrics
#     churn_risk_score = models.DecimalField(
#         max_digits=4,
#         decimal_places=2,
#         default=0.00,
#         validators=[MinValueValidator(0), MaxValueValidator(10)]
#     )
    
#     engagement_score = models.DecimalField(
#         max_digits=4,
#         decimal_places=2,
#         default=5.00,
#         validators=[MinValueValidator(0), MaxValueValidator(10)]
#     )
    
#     satisfaction_score = models.DecimalField(
#         max_digits=4,
#         decimal_places=2,
#         default=0.00,
#         validators=[MinValueValidator(0), MaxValueValidator(10)]
#     )
    
#     # Hotspot Specific Metrics
#     hotspot_sessions = models.IntegerField(default=0)
#     hotspot_conversion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
#     payment_abandonment_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
#     # Retention Metrics
#     days_active = models.IntegerField(default=0)
#     renewal_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
#     days_since_last_payment = models.IntegerField(default=0)
    
#     # Device & Platform
#     primary_device = models.CharField(
#         max_length=20,
#         choices=[
#             ('android', 'Android'),
#             ('ios', 'iOS'),
#             ('windows', 'Windows'),
#             ('mac', 'Mac'),
#             ('linux', 'Linux'),
#             ('other', 'Other')
#         ],
#         default='android'
#     )
    
#     devices_count = models.IntegerField(default=1)
    
#     # Location & Preferences
#     location = models.JSONField(default=dict, help_text="Location data")
#     preferred_payment_method = models.CharField(
#         max_length=20,
#         default='mpesa',
#         choices=[('mpesa', 'M-Pesa'), ("paypal", "PayPal"), ('bank', 'Bank Transfer'), ('card', 'Credit Card')]
#     )
    
#     notification_preferences = models.JSONField(default=dict, help_text="Notification settings")
#     communication_preferences = models.JSONField(default=dict, help_text="Preferred communication channels")
    
#     # Intelligent Tags & Classification
#     behavior_tags = models.JSONField(default=list, help_text="Automated behavior classification tags")
#     revenue_segment = models.CharField(
#         max_length=20,
#         default='low',
#         choices=[('low', 'Low Value'), ('medium', 'Medium Value'), ('high', 'High Value'), ('premium', 'Premium')]
#     )
    
#     usage_pattern = models.CharField(
#         max_length=20,
#         default='casual',
#         choices=[('casual', 'Casual'), ('regular', 'Regular'), ('heavy', 'Heavy'), ('extreme', 'Extreme')]
#     )
    
#     # Insights & Recommendations
#     insights = models.JSONField(default=list, help_text="Automated insights about client behavior")
#     recommendations = models.JSONField(default=list, help_text="Recommended actions for this client")
#     next_best_offer = models.JSONField(default=dict, help_text="Recommended next offer for this client")
    
#     # Current Plan Information (Cache for quick access)
#     current_plan_info = models.JSONField(default=dict, help_text="Cached current plan information")
    
#     # Plan Management
#     plan_auto_renew = models.BooleanField(default=True)
#     plan_notification_sent = models.BooleanField(default=False)
    
#     # Audit & Metadata
#     metadata = models.JSONField(default=dict, help_text="Additional metadata")
#     flags = models.JSONField(default=list, help_text="System flags and alerts")
    
#     # Timestamps
#     customer_since = models.DateTimeField(default=timezone.now)
#     last_payment_date = models.DateTimeField(null=True, blank=True)
#     last_usage_date = models.DateTimeField(null=True, blank=True)
#     last_login_date = models.DateTimeField(null=True, blank=True)
#     next_payment_due = models.DateTimeField(null=True, blank=True)
#     tier_upgraded_at = models.DateTimeField(null=True, blank=True)
#     plan_updated_at = models.DateTimeField(null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         verbose_name = 'Client Business Profile'
#         verbose_name_plural = 'Client Business Profiles'
#         indexes = [
#             models.Index(fields=['referral_code']),
#             models.Index(fields=['status', 'tier']),
#             models.Index(fields=['client_type']),
#             models.Index(fields=['churn_risk_score']),
#             models.Index(fields=['lifetime_value']),
#             models.Index(fields=['revenue_segment']),
#             models.Index(fields=['created_at', 'updated_at']),
#             models.Index(fields=['days_since_last_payment']),
#         ]
    
#     def __str__(self):
#         try:
#             return f"{self.user.username} - {self.get_tier_display()} ({self.get_status_display()})"
#         except:
#             return f"Client {self.id} - {self.get_tier_display()}"
    
#     def save(self, *args, **kwargs):
#         """Generate referral code and update metrics"""
#         if not self.referral_code:
#             self.referral_code = self._generate_referral_code()
        
#         # Update current plan info from subscription
#         self._update_current_plan_info()
        
#         super().save(*args, **kwargs)
        
#         # Queue metrics update for async processing
#         self._queue_metrics_update()
    
#     def _update_current_plan_info(self):
#         """Update cached current plan information"""
#         try:
#             subscription = self.active_plan_subscription()
#             if subscription:
#                 from internet_plans.serializers.plan_serializers import InternetPlanSerializer
#                 self.current_plan_info = {
#                     'plan': InternetPlanSerializer(subscription.internet_plan).data,
#                     'subscription': {
#                         'id': str(subscription.id),
#                         'status': subscription.status,
#                         'start_date': subscription.start_date.isoformat(),
#                         'end_date': subscription.end_date.isoformat(),
#                         'data_used': float(subscription.data_used_gb),
#                         'data_limit': float(subscription.data_limit_gb),
#                         'auto_renew': subscription.auto_renew,
#                         'remaining_days': (subscription.end_date - timezone.now()).days,
#                         'percentage_used': float((subscription.data_used_gb / subscription.data_limit_gb) * 100) if subscription.data_limit_gb > 0 else 0
#                     }
#                 }
#             else:
#                 self.current_plan_info = {}
#         except Exception as e:
#             logger.error(f"Error updating plan info: {str(e)}")
#             self.current_plan_info = {}
    
#     def _generate_referral_code(self):
#         """Generate unique referral code"""
#         import secrets
#         import string
        
#         username = self.user.username if hasattr(self.user, 'username') else ''
#         base = (username[:4] if username else 'CLNT').upper().replace(' ', '')
#         if len(base) < 4:
#             base = base.ljust(4, 'X')
        
#         random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(4))
#         code = f"{base}{random_part}"
        
#         # Ensure uniqueness
#         while ClientProfile.objects.filter(referral_code=code).exists():
#             random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(4))
#             code = f"{base}{random_part}"
        
#         return code
    
#     def _queue_metrics_update(self):
#         """Queue metrics update for async processing"""
#         try:
#             from user_management.tasks import update_client_metrics_task
#             update_client_metrics_task.delay(self.id)
#         except ImportError:
#             # Fallback to synchronous update
#             logger.warning("Celery not available, updating metrics synchronously")
#             self._update_calculated_fields_sync()
    
#     def _update_calculated_fields_sync(self):
#         """Synchronous metrics update (fallback)"""
#         try:
#             from user_management.utils.client_utils import ClientMetricsCalculator
#             calculator = ClientMetricsCalculator(self)
            
#             self.churn_risk_score = calculator.calculate_churn_risk()
#             self.engagement_score = calculator.calculate_engagement_score()
#             self.satisfaction_score = calculator.calculate_satisfaction_score()
#             self.revenue_segment = calculator.determine_revenue_segment()
#             self.usage_pattern = calculator.determine_usage_pattern()
#             self.behavior_tags = calculator.generate_behavior_tags()
#             self.insights = calculator.generate_insights()
#             self.recommendations = calculator.generate_recommendations()
#             self.next_best_offer = calculator.suggest_next_best_offer()
            
#             # Save without triggering save() again
#             fields_to_update = [
#                 'churn_risk_score', 'engagement_score', 'satisfaction_score',
#                 'revenue_segment', 'usage_pattern', 'behavior_tags',
#                 'insights', 'recommendations', 'next_best_offer'
#             ]
            
#             update_dict = {field: getattr(self, field) for field in fields_to_update}
#             ClientProfile.objects.filter(id=self.id).update(**update_dict)
            
#         except Exception as e:
#             logger.error(f"Error updating client metrics: {str(e)}")
    
#     # Property-based classifications
#     @property
#     def phone_number(self):
#         """Get phone from UserAccount in Authentication app"""
#         return self.user.phone_number if hasattr(self.user, 'phone_number') else ''
    
#     @property
#     def username(self):
#         """Get username from UserAccount in Authentication app"""
#         return self.user.username if hasattr(self.user, 'username') else ''
    
#     @property
#     def connection_type(self):
#         """Get connection_type from UserAccount in Authentication app"""
#         return self.user.connection_type if hasattr(self.user, 'connection_type') else ''
    
#     @property
#     def email(self):
#         """Get email from UserAccount in Authentication app"""
#         return self.user.email if hasattr(self.user, 'email') else ''
    
#     @property
#     def is_pppoe_client(self):
#         """Check if user is PPPoE client"""
#         return self.connection_type == 'pppoe'
    
#     @property
#     def is_hotspot_client(self):
#         """Check if user is hotspot client"""
#         return self.connection_type == 'hotspot'
    
#     @property
#     def is_high_value(self):
#         return self.revenue_segment in ['high', 'premium']
    
#     @property
#     def is_frequent_user(self):
#         return self.usage_pattern in ['heavy', 'extreme']
    
#     @property
#     def is_at_risk(self):
#         return self.churn_risk_score >= Decimal('7.0')
    
#     @property
#     def is_hotspot_abandoner(self):
#         return self.payment_abandonment_rate >= Decimal('50.0')
    
#     @property
#     def needs_attention(self):
#         return (self.is_at_risk or 
#                 self.days_since_last_payment > 7 or 
#                 'payment_failed' in self.flags)
    
#     @property
#     def referral_link(self):
#         return f"https://yourapp.com/register?ref={self.referral_code}"
    
#     # Plan Management Methods
#     def active_plan_subscription(self):
#         """Get active plan subscription"""
#         try:
#             from internet_plans.models import ClientPlanSubscription
#             return ClientPlanSubscription.objects.filter(
#                 client=self,
#                 status='active'
#             ).select_related('internet_plan').first()
#         except ImportError:
#             return None
    
#     def plan_history(self, limit=10):
#         """Get plan history"""
#         try:
#             from internet_plans.models import ClientPlanSubscription
#             return ClientPlanSubscription.objects.filter(
#                 client=self
#             ).select_related('internet_plan').order_by('-start_date')[:limit]
#         except ImportError:
#             return []
    
#     def available_plans(self):
#         """Get available plans for this client type"""
#         try:
#             from internet_plans.models import InternetPlan
#             if self.is_pppoe_client:
#                 return InternetPlan.objects.filter(
#                     active=True,
#                     available_for_pppoe=True
#                 ).order_by('price')
#             elif self.is_hotspot_client:
#                 return InternetPlan.objects.filter(
#                     active=True,
#                     available_for_hotspot=True
#                 ).order_by('price')
#             else:
#                 return InternetPlan.objects.filter(active=True).order_by('price')
#         except ImportError:
#             return []
    
#     def get_technical_details(self):
#         """Get technical details for connection"""
#         details = {}
#         subscription = self.active_plan_subscription()
        
#         if not subscription:
#             return details
        
#         if self.is_pppoe_client:
#             details['pppoe'] = {
#                 'username': subscription.pppoe_username,
#                 'password': '••••••••',
#                 'ip_address': subscription.ip_address if hasattr(subscription, 'ip_address') else '',
#                 'mac_address': subscription.mac_address if hasattr(subscription, 'mac_address') else '',
#                 'plan_details': {
#                     'speed': f"{subscription.internet_plan.download_speed}Mbps/{subscription.internet_plan.upload_speed}Mbps",
#                     'data_limit': subscription.data_limit_gb,
#                     'data_used': subscription.data_used_gb,
#                     'remaining': subscription.data_limit_gb - subscription.data_used_gb
#                 }
#             }
        
#         if self.is_hotspot_client:
#             details['hotspot'] = {
#                 'plan_id': subscription.hotspot_plan_id,
#                 'session_details': subscription.session_details if hasattr(subscription, 'session_details') else {},
#                 'plan_details': {
#                     'name': subscription.internet_plan.name,
#                     'duration': subscription.internet_plan.duration_hours,
#                     'price': subscription.internet_plan.price,
#                     'max_devices': subscription.internet_plan.max_devices
#                 }
#             }
        
#         return details
    
#     def calculate_commission(self, amount):
#         """Calculate commission based on marketer tier"""
#         commission_rates = {
#             'novice': Decimal('0.05'),
#             'intermediate': Decimal('0.075'),
#             'expert': Decimal('0.10'),
#             'master': Decimal('0.15'),
#         }
#         rate = commission_rates.get(self.marketer_tier, Decimal('0.05'))
#         return amount * rate


# class ClientAnalyticsSnapshot(models.Model):
#     """Daily analytics snapshot for comprehensive insights"""
#     client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE, related_name='analytics_snapshots')
#     date = models.DateField(db_index=True)
    
#     # Financial Metrics
#     daily_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
#     monthly_revenue_ytd = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
#     revenue_growth_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
#     # Usage Metrics
#     daily_data_gb = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
#     session_count = models.IntegerField(default=0)
#     avg_session_duration_minutes = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
#     peak_usage_hour = models.IntegerField(null=True, blank=True)
    
#     # Plan-specific Metrics
#     plan_utilization_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
#     data_capacity_used = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
#     speed_utilization = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
#     # Behavioral Metrics
#     churn_risk_score = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)
#     engagement_score = models.DecimalField(max_digits=4, decimal_places=2, default=5.00)
    
#     # Hotspot Specific
#     hotspot_sessions = models.IntegerField(default=0)
#     hotspot_conversions = models.IntegerField(default=0)
#     payment_attempts = models.IntegerField(default=0)
#     payment_abandonments = models.IntegerField(default=0)
    
#     # Top Categories
#     top_categories = models.JSONField(default=list)
#     top_domains = models.JSONField(default=list)
#     device_distribution = models.JSONField(default=dict)
    
#     # Comparison Metrics
#     percentile_rank = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
#     segment_average = models.JSONField(default=dict)
    
#     # Predictions
#     predicted_next_payment = models.DateField(null=True, blank=True)
#     predicted_churn_date = models.DateField(null=True, blank=True)
#     predicted_ltv = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
#     recommended_plan_upgrade = models.JSONField(default=dict)
    
#     created_at = models.DateTimeField(default=timezone.now)
    
#     class Meta:
#         verbose_name = 'Client Analytics Snapshot'
#         verbose_name_plural = 'Client Analytics Snapshots'
#         unique_together = ['client', 'date']
#         indexes = [
#             models.Index(fields=['date', 'churn_risk_score']),
#             models.Index(fields=['client', 'date']),
#             models.Index(fields=['plan_utilization_rate']),
#         ]
    
#     def __str__(self):
#         return f"Analytics for {self.client.username} on {self.date}"


# class CommissionTransaction(models.Model):
#     """Advanced commission tracking with approval workflow"""
#     class TransactionType(models.TextChoices):
#         REFERRAL = 'referral', 'Referral Commission'
#         BONUS = 'bonus', 'Performance Bonus'
#         PAYOUT = 'payout', 'Commission Payout'
#         ADJUSTMENT = 'adjustment', 'Adjustment'
#         PROMOTIONAL = 'promotional', 'Promotional Commission'
#         PLAN_SALE = 'plan_sale', 'Plan Sale Commission'
    
#     class Status(models.TextChoices):
#         PENDING = 'pending', 'Pending Approval'
#         APPROVED = 'approved', 'Approved'
#         PAID = 'paid', 'Paid'
#         REJECTED = 'rejected', 'Rejected'
#         CANCELLED = 'cancelled', 'Cancelled'
#         HOLD = 'hold', 'On Hold'
    
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     marketer = models.ForeignKey(
#         ClientProfile,
#         on_delete=models.CASCADE,
#         related_name='commission_transactions',
#         limit_choices_to={'is_marketer': True}
#     )
    
#     # Transaction Details
#     transaction_type = models.CharField(max_length=20, choices=TransactionType.choices, default=TransactionType.REFERRAL)
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     description = models.TextField()
    
#     # Plan Reference (if related to plan sale)
#     plan_reference = models.ForeignKey(
#         'internet_plans.InternetPlan',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='commission_transactions'
#     )
    
#     # Reference Tracking
#     reference_id = models.CharField(max_length=100, db_index=True)
#     referred_client = models.ForeignKey(
#         ClientProfile,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='referred_transactions'
#     )
#     purchase_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
#     # Commission Calculation
#     commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
#     tier_bonus = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
#     total_commission = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
#     # Status & Approval
#     status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
#     approved_by = models.ForeignKey(
#         UserAccount if AUTH_APP_AVAILABLE else 'authentication.UserAccount',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='approved_commissions'
#     )
#     notes = models.JSONField(default=list)
    
#     # Payment Details
#     payment_method = models.CharField(max_length=20, blank=True)
#     payment_reference = models.CharField(max_length=100, blank=True)
    
#     # Timestamps
#     transaction_date = models.DateTimeField(default=timezone.now, db_index=True)
#     approved_at = models.DateTimeField(null=True, blank=True)
#     paid_at = models.DateTimeField(null=True, blank=True)
#     due_date = models.DateField(null=True, blank=True)
#     created_at = models.DateTimeField(default=timezone.now)
    
#     class Meta:
#         verbose_name = 'Commission Transaction'
#         verbose_name_plural = 'Commission Transactions'
#         indexes = [
#             models.Index(fields=['marketer', 'transaction_date']),
#             models.Index(fields=['status', 'transaction_type']),
#             models.Index(fields=['reference_id']),
#             models.Index(fields=['due_date', 'status']),
#             models.Index(fields=['plan_reference']),
#         ]
#         ordering = ['-transaction_date']
    
#     def __str__(self):
#         return f"{self.get_transaction_type_display()} - {self.amount} KES"
    
#     def approve(self, approved_by_user, notes=""):
#         """Approve commission transaction"""
#         if self.status != self.Status.PENDING:
#             raise ValueError("Only pending transactions can be approved")
        
#         self.status = self.Status.APPROVED
#         self.approved_by = approved_by_user
#         self.approved_at = timezone.now()
        
#         if notes:
#             self.notes.append({
#                 'type': 'approval_note',
#                 'timestamp': timezone.now().isoformat(),
#                 'user': approved_by_user.email,
#                 'note': notes
#             })
        
#         # Update marketer's commission balance
#         if self.transaction_type in [self.TransactionType.REFERRAL, 
#                                     self.TransactionType.BONUS,
#                                     self.TransactionType.PROMOTIONAL,
#                                     self.TransactionType.PLAN_SALE]:
#             self.marketer.commission_balance += self.amount
#             self.marketer.total_commission_earned += self.amount
#             self.marketer.save()
        
#         self.save()
    
#     def mark_as_paid(self, payment_method, payment_reference):
#         """Mark commission as paid"""
#         if self.status != self.Status.APPROVED:
#             raise ValueError("Only approved transactions can be paid")
        
#         self.status = self.Status.PAID
#         self.paid_at = timezone.now()
#         self.payment_method = payment_method
#         self.payment_reference = payment_reference
        
#         # For payouts, deduct from balance
#         if self.transaction_type == self.TransactionType.PAYOUT:
#             if self.marketer.commission_balance >= self.amount:
#                 self.marketer.commission_balance -= self.amount
#                 self.marketer.save()
#             else:
#                 raise ValueError("Insufficient commission balance")
        
#         self.save()


# class ClientInteraction(models.Model):
#     """Track all client interactions for behavioral analysis"""
#     class InteractionType(models.TextChoices):
#         # Payment Related
#         PAYMENT_SUCCESS = 'payment_success', 'Payment Successful'
#         PAYMENT_FAILED = 'payment_failed', 'Payment Failed'
#         PAYMENT_PENDING = 'payment_pending', 'Payment Pending'
#         PAYMENT_ABANDONED = 'payment_abandoned', 'Payment Abandoned'
        
#         # Usage Related
#         DATA_USAGE = 'data_usage', 'Data Usage'
#         SESSION_START = 'session_start', 'Session Started'
#         SESSION_END = 'session_end', 'Session Ended'
        
#         # Support Related
#         SUPPORT_TICKET = 'support_ticket', 'Support Ticket'
#         SUPPORT_RESOLVED = 'support_resolved', 'Support Resolved'
        
#         # Communication
#         EMAIL_SENT = 'email_sent', 'Email Sent'
#         SMS_SENT = 'sms_sent', 'SMS Sent'
#         NOTIFICATION = 'notification', 'Notification'
        
#         # System
#         LOGIN = 'login', 'Login'
#         LOGOUT = 'logout', 'Logout'
#         PROFILE_UPDATE = 'profile_update', 'Profile Updated'
        
#         # Hotspot Specific
#         HOTSPOT_CONNECT = 'hotspot_connect', 'Hotspot Connected'
#         HOTSPOT_AUTH = 'hotspot_auth', 'Hotspot Authentication'
#         HOTSPOT_PAYMENT_PAGE = 'hotspot_payment_page', 'Hotspot Payment Page'
#         HOTSPOT_PLAN_SELECTION = 'hotspot_plan_selection', 'Hotspot Plan Selection'
        
#         # Plan Related
#         PLAN_PURCHASE = 'plan_purchase', 'Plan Purchased'
#         PLAN_RENEWAL = 'plan_renewal', 'Plan Renewed'
#         PLAN_UPGRADE = 'plan_upgrade', 'Plan Upgraded'
#         PLAN_DOWNGRADE = 'plan_downgrade', 'Plan Downgraded'
#         PLAN_CANCELLATION = 'plan_cancellation', 'Plan Cancelled'
#         PLAN_EXPIRY = 'plan_expiry', 'Plan Expired'
#         PLAN_SUSPENSION = 'plan_suspension', 'Plan Suspended'
    
#     class Outcome(models.TextChoices):
#         SUCCESS = 'success', 'Success'
#         FAILURE = 'failure', 'Failure'
#         PENDING = 'pending', 'Pending'
#         CANCELLED = 'cancelled', 'Cancelled'
#         ABANDONED = 'abandoned', 'Abandoned'
#         TIMEOUT = 'timeout', 'Timeout'
    
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE, related_name='interactions')
    
#     # Interaction Details
#     interaction_type = models.CharField(max_length=30, choices=InteractionType.choices)
#     action = models.CharField(max_length=100)
#     description = models.TextField()
#     outcome = models.CharField(max_length=20, choices=Outcome.choices, default=Outcome.PENDING)
    
#     # Plan Reference
#     plan_reference = models.ForeignKey(
#         'internet_plans.InternetPlan',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='interactions'
#     )
    
#     # Hotspot Specific
#     is_hotspot = models.BooleanField(default=False)
#     hotspot_session_id = models.CharField(max_length=100, blank=True)
#     hotspot_plan_selected = models.CharField(max_length=50, blank=True)
    
#     # Payment Specific
#     payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     payment_method = models.CharField(max_length=20, blank=True)
#     payment_reference = models.CharField(max_length=100, blank=True)
    
#     # Data & Usage
#     data_used_bytes = models.BigIntegerField(default=0)
#     session_duration_seconds = models.IntegerField(default=0)
    
#     # Device & Location
#     device_type = models.CharField(max_length=20, blank=True)
#     user_agent = models.TextField(blank=True)
#     ip_address = models.GenericIPAddressField(null=True, blank=True)
    
#     # Timing
#     started_at = models.DateTimeField()
#     completed_at = models.DateTimeField(null=True, blank=True)
#     duration_seconds = models.IntegerField(default=0)
    
#     # Flow Tracking
#     flow_stage = models.CharField(max_length=50, blank=True)
#     next_stage = models.CharField(max_length=50, blank=True)
#     flow_abandoned_at = models.CharField(max_length=50, blank=True)
    
#     # Error Tracking
#     error_code = models.CharField(max_length=50, blank=True)
#     error_message = models.TextField(blank=True)
#     error_details = models.JSONField(default=dict)
    
#     # Conversion Tracking
#     converted_to_purchase = models.BooleanField(default=False)
#     purchase_reference = models.CharField(max_length=100, blank=True)
    
#     # Metadata
#     metadata = models.JSONField(default=dict)
#     created_at = models.DateTimeField(default=timezone.now)
    
#     class Meta:
#         verbose_name = 'Client Interaction'
#         verbose_name_plural = 'Client Interactions'
#         indexes = [
#             models.Index(fields=['client', 'started_at']),
#             models.Index(fields=['interaction_type', 'outcome']),
#             models.Index(fields=['is_hotspot', 'outcome']),
#             models.Index(fields=['converted_to_purchase']),
#             models.Index(fields=['flow_stage', 'flow_abandoned_at']),
#             models.Index(fields=['plan_reference']),
#         ]
    
#     def __str__(self):
#         return f"{self.client.username} - {self.get_interaction_type_display()}"








"""
User Management Models - Business Logic Extension
Extends Authentication app's UserAccount without duplication
Production-ready with advanced analytics
Integrated with Service Operations
"""
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Avg, Sum, Count, Q
from django.core.cache import cache
import logging
import uuid
from decimal import Decimal
import json
import re



logger = logging.getLogger(__name__)


try:
    from authentication.models import UserAccount, PhoneValidation
    AUTH_APP_AVAILABLE = True
except ImportError:
    logger.error("Authentication app not found. Please ensure it's installed.")
    AUTH_APP_AVAILABLE = False
    # Create dummy class for development
    class UserAccount:
        pass


class ClientProfile(models.Model):
    """
    Comprehensive client profile EXTENDING UserAccount
    Contains ONLY business logic, no authentication
    Integrated with Service Operations for subscriptions and plans
    """
    class ClientTier(models.TextChoices):
        NEW = 'new', 'New Client'
        BRONZE = 'bronze', 'Bronze'
        SILVER = 'silver', 'Silver'
        GOLD = 'gold', 'Gold'
        PLATINUM = 'platinum', 'Platinum'
        DIAMOND = 'diamond', 'Diamond'
        VIP = 'vip', 'VIP'
    
    class ClientStatus(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'
        SUSPENDED = 'suspended', 'Suspended'
        TRIAL = 'trial', 'Trial'
        AT_RISK = 'at_risk', 'At Risk'
        CHURNED = 'churned', 'Churned'
    
    # Link to Authentication app
    user = models.OneToOneField(
        UserAccount if AUTH_APP_AVAILABLE else 'authentication.UserAccount',
        on_delete=models.CASCADE,
        related_name='business_profile',
        help_text="Linked user from authentication system"
    )
    
    # Business Identification
    client_id = models.UUIDField(
        unique=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique business identifier for Service Operations"
    )
    
    client_type = models.CharField(
        max_length=20,
        choices=[
            ('residential', 'Residential'),
            ('business', 'Business'),
        ],
        default='residential'
    )
    
    tier = models.CharField(
        max_length=20,
        choices=ClientTier.choices,
        default=ClientTier.NEW
    )
    
    status = models.CharField(
        max_length=20,
        choices=ClientStatus.choices,
        default=ClientStatus.ACTIVE
    )
    
    # Referral & Marketing System
    referral_code = models.CharField(
        max_length=12,
        unique=True,
        db_index=True,
        blank=True,
        help_text="Unique referral code"
    )
    
    referred_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='referrals',
        help_text="Client who referred this client"
    )
    
    is_marketer = models.BooleanField(default=False)
    marketer_tier = models.CharField(
        max_length=20,
        choices=[
            ('novice', 'Novice'),
            ('intermediate', 'Intermediate'),
            ('expert', 'Expert'),
            ('master', 'Master')
        ],
        default='novice'
    )
    
    # Financial Analytics
    lifetime_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)]
    )
    
    monthly_recurring_revenue = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )
    
    total_revenue = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00
    )
    
    avg_monthly_spend = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )
    
    # Commission Tracking
    commission_balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )
    
    total_commission_earned = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00
    )
    
    commission_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10.00
    )
    
    # Usage Analytics
    total_data_used_gb = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )
    
    avg_monthly_data_gb = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00
    )
    
    peak_usage_hour = models.IntegerField(
        null=True,
        blank=True,
        help_text="Hour (0-23) of peak usage"
    )
    
    # Behavioral Metrics
    churn_risk_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    
    engagement_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=5.00,
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    
    satisfaction_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    
    # Hotspot Specific Metrics
    hotspot_sessions = models.IntegerField(default=0)
    hotspot_conversion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    payment_abandonment_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    # Retention Metrics
    days_active = models.IntegerField(default=0)
    renewal_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    days_since_last_payment = models.IntegerField(default=0)
    
    # Device & Platform
    primary_device = models.CharField(
        max_length=20,
        choices=[
            ('android', 'Android'),
            ('ios', 'iOS'),
            ('windows', 'Windows'),
            ('mac', 'Mac'),
            ('linux', 'Linux'),
            ('other', 'Other')
        ],
        default='android'
    )
    
    devices_count = models.IntegerField(default=1)
    
    # Location & Preferences
    location = models.JSONField(default=dict, help_text="Location data")
    preferred_payment_method = models.CharField(
        max_length=20,
        default='mpesa',
        choices=[('mpesa', 'M-Pesa'), ("paypal", "PayPal"), ('bank', 'Bank Transfer')]
    )
    
    notification_preferences = models.JSONField(default=dict, help_text="Notification settings")
    communication_preferences = models.JSONField(default=dict, help_text="Preferred communication channels")
    
    # Service Operations Integration
    router_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="Router ID for PPPoE clients (from Service Operations)"
    )
    
    hotspot_mac_address = models.CharField(
        max_length=100,
        blank=True,
        help_text="MAC address for hotspot clients"
    )
    
    # Intelligent Tags & Classification
    behavior_tags = models.JSONField(default=list, help_text="Automated behavior classification tags")
    revenue_segment = models.CharField(
        max_length=20,
        default='low',
        choices=[('low', 'Low Value'), ('medium', 'Medium Value'), ('high', 'High Value'), ('premium', 'Premium')]
    )
    
    usage_pattern = models.CharField(
        max_length=20,
        default='casual',
        choices=[('casual', 'Casual'), ('regular', 'Regular'), ('heavy', 'Heavy'), ('extreme', 'Extreme')]
    )
    
    # Insights & Recommendations
    insights = models.JSONField(default=list, help_text="Automated insights about client behavior")
    recommendations = models.JSONField(default=list, help_text="Recommended actions for this client")
    next_best_offer = models.JSONField(default=dict, help_text="Recommended next offer for this client")
    
    # Audit & Metadata
    metadata = models.JSONField(default=dict, help_text="Additional metadata")
    flags = models.JSONField(default=list, help_text="System flags and alerts")
    
    # Timestamps
    customer_since = models.DateTimeField(default=timezone.now)
    last_payment_date = models.DateTimeField(null=True, blank=True)
    last_usage_date = models.DateTimeField(null=True, blank=True)
    last_login_date = models.DateTimeField(null=True, blank=True)
    next_payment_due = models.DateTimeField(null=True, blank=True)
    tier_upgraded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Client Business Profile'
        verbose_name_plural = 'Client Business Profiles'
        indexes = [
            models.Index(fields=['client_id']),
            models.Index(fields=['referral_code']),
            models.Index(fields=['status', 'tier']),
            models.Index(fields=['client_type']),
            models.Index(fields=['churn_risk_score']),
            models.Index(fields=['lifetime_value']),
            models.Index(fields=['revenue_segment']),
            models.Index(fields=['created_at', 'updated_at']),
            models.Index(fields=['days_since_last_payment']),
        ]
    
    def __str__(self):
        try:
            return f"{self.user.username} - {self.get_tier_display()} ({self.get_status_display()})"
        except:
            return f"Client {self.id} - {self.get_tier_display()}"
    
    def save(self, *args, **kwargs):
        """Generate referral code and update metrics"""
        if not self.referral_code:
            self.referral_code = self._generate_referral_code()
        
        if not self.client_id:
            self.client_id = uuid.uuid4()
        
        super().save(*args, **kwargs)
        
        # Queue metrics update for async processing
        self._queue_metrics_update()
    
    def _generate_referral_code(self):
        """Generate unique referral code"""
        import secrets
        import string
        
        username = self.user.username if hasattr(self.user, 'username') else ''
        base = (username[:4] if username else 'CLNT').upper().replace(' ', '')
        if len(base) < 4:
            base = base.ljust(4, 'X')
        
        random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(4))
        code = f"{base}{random_part}"
        
        # Ensure uniqueness
        while ClientProfile.objects.filter(referral_code=code).exists():
            random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(4))
            code = f"{base}{random_part}"
        
        return code
    
    def _queue_metrics_update(self):
        from user_management.tasks import update_client_metrics_task
        """Queue metrics update for async processing"""
        try:
            update_client_metrics_task.delay(self.id)
        except ImportError:
            # Fallback to synchronous update
            logger.warning("Celery not available, updating metrics synchronously")
            self._update_calculated_fields_sync()
    
    def _update_calculated_fields_sync(self):
        """Synchronous metrics update (fallback)"""
        try:
            from user_management.utils.client_utils import ClientMetricsCalculator
            calculator = ClientMetricsCalculator(self)
            
            self.churn_risk_score = calculator.calculate_churn_risk()
            self.engagement_score = calculator.calculate_engagement_score()
            self.satisfaction_score = calculator.calculate_satisfaction_score()
            self.revenue_segment = calculator.determine_revenue_segment()
            self.usage_pattern = calculator.determine_usage_pattern()
            self.behavior_tags = calculator.generate_behavior_tags()
            self.insights = calculator.generate_insights()
            self.recommendations = calculator.generate_recommendations()
            self.next_best_offer = calculator.suggest_next_best_offer()
            
            # Save without triggering save() again
            fields_to_update = [
                'churn_risk_score', 'engagement_score', 'satisfaction_score',
                'revenue_segment', 'usage_pattern', 'behavior_tags',
                'insights', 'recommendations', 'next_best_offer'
            ]
            
            update_dict = {field: getattr(self, field) for field in fields_to_update}
            ClientProfile.objects.filter(id=self.id).update(**update_dict)
            
        except Exception as e:
            logger.error(f"Error updating client metrics: {str(e)}")
    
    # Property-based classifications
    @property
    def phone_number(self):
        """Get phone from UserAccount in Authentication app"""
        return self.user.phone_number if hasattr(self.user, 'phone_number') else ''
    
    @property
    def username(self):
        """Get username from UserAccount in Authentication app"""
        return self.user.username if hasattr(self.user, 'username') else ''
    
    @property
    def connection_type(self):
        """Get connection_type from UserAccount in Authentication app"""
        return self.user.connection_type if hasattr(self.user, 'connection_type') else ''
    
    # REMOVED: email property - No longer part of business logic
    
    @property
    def is_pppoe_client(self):
        """Check if user is PPPoE client"""
        return self.connection_type == 'pppoe'
    
    @property
    def is_hotspot_client(self):
        """Check if user is hotspot client"""
        return self.connection_type == 'hotspot'
    
    @property
    def is_high_value(self):
        return self.revenue_segment in ['high', 'premium']
    
    @property
    def is_frequent_user(self):
        return self.usage_pattern in ['heavy', 'extreme']
    
    @property
    def is_at_risk(self):
        return self.churn_risk_score >= Decimal('7.0')
    
    @property
    def is_hotspot_abandoner(self):
        return self.payment_abandonment_rate >= Decimal('50.0')
    
    @property
    def needs_attention(self):
        return (self.is_at_risk or 
                self.days_since_last_payment > 7 or 
                'payment_failed' in self.flags)
    
    @property
    def referral_link(self):
        return f"https://yourapp.com/register?ref={self.referral_code}"
    
    def calculate_commission(self, amount):
        """Calculate commission based on marketer tier"""
        commission_rates = {
            'novice': Decimal('0.05'),
            'intermediate': Decimal('0.075'),
            'expert': Decimal('0.10'),
            'master': Decimal('0.15'),
        }
        rate = commission_rates.get(self.marketer_tier, Decimal('0.05'))
        return amount * rate
    
    def get_current_plan_info(self):
        """Get current plan information via Service Operations adapter"""
        try:
            from service_operations.adapters.user_management_adapter import UserManagementAdapter
            return UserManagementAdapter.get_client_details(str(self.client_id))
        except ImportError:
            logger.error("Service Operations adapter not available")
            return None


class ClientAnalyticsSnapshot(models.Model):
    """Daily analytics snapshot for comprehensive insights"""
    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE, related_name='analytics_snapshots')
    date = models.DateField(db_index=True)
    
    # Financial Metrics
    daily_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    monthly_revenue_ytd = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    revenue_growth_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    # Usage Metrics
    daily_data_gb = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    session_count = models.IntegerField(default=0)
    avg_session_duration_minutes = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    peak_usage_hour = models.IntegerField(null=True, blank=True)
    
    # Behavioral Metrics
    churn_risk_score = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)
    engagement_score = models.DecimalField(max_digits=4, decimal_places=2, default=5.00)
    
    # Hotspot Specific
    hotspot_sessions = models.IntegerField(default=0)
    hotspot_conversions = models.IntegerField(default=0)
    payment_attempts = models.IntegerField(default=0)
    payment_abandonments = models.IntegerField(default=0)
    
    # Top Categories
    top_categories = models.JSONField(default=list)
    top_domains = models.JSONField(default=list)
    device_distribution = models.JSONField(default=dict)
    
    # Comparison Metrics
    percentile_rank = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    segment_average = models.JSONField(default=dict)
    
    # Predictions
    predicted_next_payment = models.DateField(null=True, blank=True)
    predicted_churn_date = models.DateField(null=True, blank=True)
    predicted_ltv = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        verbose_name = 'Client Analytics Snapshot'
        verbose_name_plural = 'Client Analytics Snapshots'
        unique_together = ['client', 'date']
        indexes = [
            models.Index(fields=['date', 'churn_risk_score']),
            models.Index(fields=['client', 'date']),
        ]
    
    def __str__(self):
        return f"Analytics for {self.client.username} on {self.date}"


class CommissionTransaction(models.Model):
    """Advanced commission tracking with approval workflow"""
    class TransactionType(models.TextChoices):
        REFERRAL = 'referral', 'Referral Commission'
        BONUS = 'bonus', 'Performance Bonus'
        PAYOUT = 'payout', 'Commission Payout'
        ADJUSTMENT = 'adjustment', 'Adjustment'
        PROMOTIONAL = 'promotional', 'Promotional Commission'
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Approval'
        APPROVED = 'approved', 'Approved'
        PAID = 'paid', 'Paid'
        REJECTED = 'rejected', 'Rejected'
        CANCELLED = 'cancelled', 'Cancelled'
        HOLD = 'hold', 'On Hold'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    marketer = models.ForeignKey(
        ClientProfile,
        on_delete=models.CASCADE,
        related_name='commission_transactions',
        limit_choices_to={'is_marketer': True}
    )
    
    # Transaction Details
    transaction_type = models.CharField(max_length=20, choices=TransactionType.choices, default=TransactionType.REFERRAL)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    
    # Reference Tracking
    reference_id = models.CharField(max_length=100, db_index=True)
    referred_client = models.ForeignKey(
        ClientProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='referred_transactions'
    )
    purchase_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Commission Calculation
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    tier_bonus = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    total_commission = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Status & Approval
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    approved_by = models.ForeignKey(
        UserAccount if AUTH_APP_AVAILABLE else 'authentication.UserAccount',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_commissions'
    )
    notes = models.JSONField(default=list)
    
    # Payment Details
    payment_method = models.CharField(max_length=20, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)
    
    # Timestamps
    transaction_date = models.DateTimeField(default=timezone.now, db_index=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        verbose_name = 'Commission Transaction'
        verbose_name_plural = 'Commission Transactions'
        indexes = [
            models.Index(fields=['marketer', 'transaction_date']),
            models.Index(fields=['status', 'transaction_type']),
            models.Index(fields=['reference_id']),
            models.Index(fields=['due_date', 'status']),
        ]
        ordering = ['-transaction_date']
    
    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.amount} KES"
    
    def approve(self, approved_by_user, notes=""):
        """Approve commission transaction"""
        if self.status != self.Status.PENDING:
            raise ValueError("Only pending transactions can be approved")
        
        self.status = self.Status.APPROVED
        self.approved_by = approved_by_user
        self.approved_at = timezone.now()
        
        if notes:
            self.notes.append({
                'type': 'approval_note',
                'timestamp': timezone.now().isoformat(),
                'user': approved_by_user.username,
                'note': notes
            })
        
        # Update marketer's commission balance
        if self.transaction_type in [self.TransactionType.REFERRAL, 
                                    self.TransactionType.BONUS,
                                    self.TransactionType.PROMOTIONAL]:
            self.marketer.commission_balance += self.amount
            self.marketer.total_commission_earned += self.amount
            self.marketer.save()
        
        self.save()
    
    def mark_as_paid(self, payment_method, payment_reference):
        """Mark commission as paid"""
        if self.status != self.Status.APPROVED:
            raise ValueError("Only approved transactions can be paid")
        
        self.status = self.Status.PAID
        self.paid_at = timezone.now()
        self.payment_method = payment_method
        self.payment_reference = payment_reference
        
        # For payouts, deduct from balance
        if self.transaction_type == self.TransactionType.PAYOUT:
            if self.marketer.commission_balance >= self.amount:
                self.marketer.commission_balance -= self.amount
                self.marketer.save()
            else:
                raise ValueError("Insufficient commission balance")
        
        self.save()


class ClientInteraction(models.Model):
    """Track all client interactions for behavioral analysis"""
    class InteractionType(models.TextChoices):
        # Payment Related
        PAYMENT_SUCCESS = 'payment_success', 'Payment Successful'
        PAYMENT_FAILED = 'payment_failed', 'Payment Failed'
        PAYMENT_PENDING = 'payment_pending', 'Payment Pending'
        PAYMENT_ABANDONED = 'payment_abandoned', 'Payment Abandoned'
        
        # Usage Related
        DATA_USAGE = 'data_usage', 'Data Usage'
        SESSION_START = 'session_start', 'Session Started'
        SESSION_END = 'session_end', 'Session Ended'
        
        # Support Related
        SUPPORT_TICKET = 'support_ticket', 'Support Ticket'
        SUPPORT_RESOLVED = 'support_resolved', 'Support Resolved'
        
        # Communication
        EMAIL_SENT = 'email_sent', 'Email Sent'
        SMS_SENT = 'sms_sent', 'SMS Sent'
        NOTIFICATION = 'notification', 'Notification'
        
        # System
        LOGIN = 'login', 'Login'
        LOGOUT = 'logout', 'Logout'
        PROFILE_UPDATE = 'profile_update', 'Profile Updated'
        
        # Hotspot Specific
        HOTSPOT_CONNECT = 'hotspot_connect', 'Hotspot Connected'
        HOTSPOT_AUTH = 'hotspot_auth', 'Hotspot Authentication'
        HOTSPOT_PAYMENT_PAGE = 'hotspot_payment_page', 'Hotspot Payment Page'
        HOTSPOT_PLAN_SELECTION = 'hotspot_plan_selection', 'Hotspot Plan Selection'
    
    class Outcome(models.TextChoices):
        SUCCESS = 'success', 'Success'
        FAILURE = 'failure', 'Failure'
        PENDING = 'pending', 'Pending'
        CANCELLED = 'cancelled', 'Cancelled'
        ABANDONED = 'abandoned', 'Abandoned'
        TIMEOUT = 'timeout', 'Timeout'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE, related_name='interactions')
    
    # Interaction Details
    interaction_type = models.CharField(max_length=30, choices=InteractionType.choices)
    action = models.CharField(max_length=100)
    description = models.TextField()
    outcome = models.CharField(max_length=20, choices=Outcome.choices, default=Outcome.PENDING)
    
    # Hotspot Specific
    is_hotspot = models.BooleanField(default=False)
    hotspot_session_id = models.CharField(max_length=100, blank=True)
    hotspot_plan_selected = models.CharField(max_length=50, blank=True)
    
    # Payment Specific
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_method = models.CharField(max_length=20, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)
    
    # Data & Usage
    data_used_bytes = models.BigIntegerField(default=0)
    session_duration_seconds = models.IntegerField(default=0)
    
    # Device & Location
    device_type = models.CharField(max_length=20, blank=True)
    user_agent = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    # Timing
    started_at = models.DateTimeField()
    completed_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.IntegerField(default=0)
    
    # Flow Tracking
    flow_stage = models.CharField(max_length=50, blank=True)
    next_stage = models.CharField(max_length=50, blank=True)
    flow_abandoned_at = models.CharField(max_length=50, blank=True)
    
    # Error Tracking
    error_code = models.CharField(max_length=50, blank=True)
    error_message = models.TextField(blank=True)
    error_details = models.JSONField(default=dict)
    
    # Conversion Tracking
    converted_to_purchase = models.BooleanField(default=False)
    purchase_reference = models.CharField(max_length=100, blank=True)
    
    # Metadata
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        verbose_name = 'Client Interaction'
        verbose_name_plural = 'Client Interactions'
        indexes = [
            models.Index(fields=['client', 'started_at']),
            models.Index(fields=['interaction_type', 'outcome']),
            models.Index(fields=['is_hotspot', 'outcome']),
            models.Index(fields=['converted_to_purchase']),
            models.Index(fields=['flow_stage', 'flow_abandoned_at']),
        ]
    
    def __str__(self):
        return f"{self.client.username} - {self.get_interaction_type_display()}"