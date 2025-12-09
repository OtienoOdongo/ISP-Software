





# """
# User Management Models - Business Logic Extension
# Extends Authentication app's UserAccount without duplication
# Production-ready with advanced analytics
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

# logger = logging.getLogger(__name__)

# # Import from Authentication app - NO DUPLICATION
# try:
#     from authentication.models import UserAccount, PhoneValidation
# except ImportError:
#     logger.error("Authentication app not found. Please ensure it's installed.")
#     raise


# class ClientProfile(models.Model):
#     """
#     Comprehensive client profile EXTENDING UserAccount
#     Contains ONLY business logic, no authentication
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
#         UserAccount,
#         on_delete=models.CASCADE,
#         related_name='business_profile',
#         help_text="Linked user from authentication system"
#     )
    
    
#     client_type = models.CharField(
#         max_length=20,
#         choices=[
#             ('residential', 'Residential'),
#             ('business', 'Business'),
#             ('student', 'Student'),
#             ('tourist', 'Tourist'),
#             ('freelancer', 'Freelancer'),
#             ('corporate', 'Corporate')
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
    
#     # Referral & Marketing System (Business Logic)
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
    
#     # Financial Analytics (Business Logic)
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
    
#     # Commission Tracking (Business Logic)
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
    
#     # Usage Analytics (Business Logic)
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
    
#     # Behavioral Metrics (Business Logic)
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
    
#     # Hotspot Specific Metrics (Business Logic)
#     hotspot_sessions = models.IntegerField(default=0)
    
#     hotspot_conversion_rate = models.DecimalField(
#         max_digits=5,
#         decimal_places=2,
#         default=0.00
#     )
    
#     payment_abandonment_rate = models.DecimalField(
#         max_digits=5,
#         decimal_places=2,
#         default=0.00
#     )
    
#     # Retention Metrics (Business Logic)
#     days_active = models.IntegerField(default=0)
    
#     renewal_rate = models.DecimalField(
#         max_digits=5,
#         decimal_places=2,
#         default=0.00
#     )
    
#     days_since_last_payment = models.IntegerField(default=0)
    
#     # Device & Platform Data
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
    
#     # Location & Preferences (Business Logic)
#     location = models.JSONField(
#         default=dict,
#         help_text="Location data including coordinates, area, etc."
#     )
    
#     preferred_payment_method = models.CharField(
#         max_length=20,
#         default='mpesa',
#         choices=[
#             ('mpesa', 'M-Pesa'),
#             ("paypal", "PayPal"),
#             ('bank', 'Bank Transfer')
#         ]
#     )
    
#     notification_preferences = models.JSONField(
#         default=dict,
#         help_text="Notification settings"
#     )
    
#     communication_preferences = models.JSONField(
#         default=dict,
#         help_text="Preferred communication channels"
#     )
    
#     # Intelligent Tags & Classification (Business Logic)
#     behavior_tags = models.JSONField(
#         default=list,
#         help_text="Automated behavior classification tags"
#     )
    
#     revenue_segment = models.CharField(
#         max_length=20,
#         default='low',
#         choices=[
#             ('low', 'Low Value'),
#             ('medium', 'Medium Value'),
#             ('high', 'High Value'),
#             ('premium', 'Premium')
#         ]
#     )
    
#     usage_pattern = models.CharField(
#         max_length=20,
#         default='casual',
#         choices=[
#             ('casual', 'Casual'),
#             ('regular', 'Regular'),
#             ('heavy', 'Heavy'),
#             ('extreme', 'Extreme')
#         ]
#     )
    
#     # Insights & Recommendations (Business Logic)
#     insights = models.JSONField(
#         default=list,
#         help_text="Automated insights about client behavior"
#     )
    
#     recommendations = models.JSONField(
#         default=list,
#         help_text="Recommended actions for this client"
#     )
    
#     next_best_offer = models.JSONField(
#         default=dict,
#         help_text="Recommended next offer for this client"
#     )
    
#     # Audit & Metadata
#     metadata = models.JSONField(
#         default=dict,
#         help_text="Additional metadata"
#     )
    
#     flags = models.JSONField(
#         default=list,
#         help_text="System flags and alerts"
#     )
    
#     # Timestamps
#     customer_since = models.DateTimeField(default=timezone.now)
#     last_payment_date = models.DateTimeField(null=True, blank=True)
#     last_usage_date = models.DateTimeField(null=True, blank=True)
#     last_login_date = models.DateTimeField(null=True, blank=True)
#     next_payment_due = models.DateTimeField(null=True, blank=True)
#     tier_upgraded_at = models.DateTimeField(null=True, blank=True)
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
#         return f"{self.user.username} - {self.get_tier_display()} ({self.get_status_display()})"
    
#     def save(self, *args, **kwargs):
#         """Generate referral code and update metrics"""
#         if not self.referral_code:
#             self.referral_code = self._generate_referral_code()
        
#         # Update calculated fields before saving
#         self._update_calculated_fields()
        
#         super().save(*args, **kwargs)
    
#     def _generate_referral_code(self):
#         """Generate unique referral code"""
#         import secrets
#         import string
        
#         # Use username + random characters
#         base = self.user.username[:4].upper().replace(' ', '')
#         if len(base) < 4:
#             base = base.ljust(4, 'X')
        
#         random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) 
#                             for _ in range(4))
#         code = f"{base}{random_part}"
        
#         # Ensure uniqueness
#         while ClientProfile.objects.filter(referral_code=code).exists():
#             random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) 
#                                 for _ in range(4))
#             code = f"{base}{random_part}"
        
#         return code
    
#     def _update_calculated_fields(self):
#         """Update all calculated fields"""
#         from user_management.utils.client_utils import ClientMetricsCalculator
        
#         calculator = ClientMetricsCalculator(self)
#         self.churn_risk_score = calculator.calculate_churn_risk()
#         self.engagement_score = calculator.calculate_engagement_score()
#         self.satisfaction_score = calculator.calculate_satisfaction_score()
#         self.revenue_segment = calculator.determine_revenue_segment()
#         self.usage_pattern = calculator.determine_usage_pattern()
#         self.behavior_tags = calculator.generate_behavior_tags()
#         self.insights = calculator.generate_insights()
#         self.recommendations = calculator.generate_recommendations()
#         self.next_best_offer = calculator.suggest_next_best_offer()
    
#     # Property-based classifications
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
    
#     @property
#     def phone_number(self):
#         """Get phone from UserAccount in Authentication app"""
#         return self.user.phone_number
    
#     @property
#     def username(self):
#         """Get username from UserAccount in Authentication app"""
#         return self.user.username
    
#     @property
#     def connection_type(self):
#         """Get connection_type from UserAccount in Authentication app"""
#         return self.user.connection_type
    
#     @property
#     def is_pppoe_client(self):
#         """Check if user is PPPoE client"""
#         return self.user.is_pppoe_client
    
#     @property
#     def is_hotspot_client(self):
#         """Check if user is hotspot client"""
#         return self.user.is_hotspot_client
    
#     def calculate_commission(self, amount):
#         """Calculate commission based on marketer tier"""
#         commission_rates = {
#             'novice': Decimal('0.05'),      # 5%
#             'intermediate': Decimal('0.075'), # 7.5%
#             'expert': Decimal('0.10'),       # 10%
#             'master': Decimal('0.15'),       # 15%
#         }
#         rate = commission_rates.get(self.marketer_tier, Decimal('0.05'))
#         return amount * rate


# class ClientAnalyticsSnapshot(models.Model):
#     """
#     Daily analytics snapshot for comprehensive insights
#     """
#     client = models.ForeignKey(
#         ClientProfile,
#         on_delete=models.CASCADE,
#         related_name='analytics_snapshots'
#     )
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
    
#     created_at = models.DateTimeField(default=timezone.now)
    
#     class Meta:
#         verbose_name = 'Client Analytics Snapshot'
#         verbose_name_plural = 'Client Analytics Snapshots'
#         unique_together = ['client', 'date']
#         indexes = [
#             models.Index(fields=['date', 'churn_risk_score']),
#             models.Index(fields=['client', 'date']),
#         ]
    
#     def __str__(self):
#         return f"Analytics for {self.client.user.username} on {self.date}"


# class CommissionTransaction(models.Model):
#     """
#     Advanced commission tracking with approval workflow
#     """
#     class TransactionType(models.TextChoices):
#         REFERRAL = 'referral', 'Referral Commission'
#         BONUS = 'bonus', 'Performance Bonus'
#         PAYOUT = 'payout', 'Commission Payout'
#         ADJUSTMENT = 'adjustment', 'Adjustment'
#         PROMOTIONAL = 'promotional', 'Promotional Commission'
    
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
#     transaction_type = models.CharField(
#         max_length=20,
#         choices=TransactionType.choices,
#         default=TransactionType.REFERRAL
#     )
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     description = models.TextField()
    
#     # Reference Tracking
#     reference_id = models.CharField(max_length=100, db_index=True)
#     referred_client = models.ForeignKey(
#         ClientProfile,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='referred_transactions'
#     )
#     purchase_amount = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         null=True,
#         blank=True
#     )
    
#     # Commission Calculation
#     commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
#     tier_bonus = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
#     total_commission = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
#     # Status & Approval
#     status = models.CharField(
#         max_length=20,
#         choices=Status.choices,
#         default=Status.PENDING
#     )
#     approved_by = models.ForeignKey(
#         UserAccount,
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
#                                     self.TransactionType.PROMOTIONAL]:
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
#     """
#     Track all client interactions for behavioral analysis
#     """
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
    
#     class Outcome(models.TextChoices):
#         SUCCESS = 'success', 'Success'
#         FAILURE = 'failure', 'Failure'
#         PENDING = 'pending', 'Pending'
#         CANCELLED = 'cancelled', 'Cancelled'
#         ABANDONED = 'abandoned', 'Abandoned'
#         TIMEOUT = 'timeout', 'Timeout'
    
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     client = models.ForeignKey(
#         ClientProfile,
#         on_delete=models.CASCADE,
#         related_name='interactions'
#     )
    
#     # Interaction Details
#     interaction_type = models.CharField(max_length=30, choices=InteractionType.choices)
#     action = models.CharField(max_length=100)
#     description = models.TextField()
#     outcome = models.CharField(max_length=20, choices=Outcome.choices, default=Outcome.PENDING)
    
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
    
#     # Flow Tracking (for multi-step processes)
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
#         ]
    
#     def __str__(self):
#         return f"{self.client.user.username} - {self.get_interaction_type_display()}"







"""
User Management Models - Business Logic Extension
Extends Authentication app's UserAccount without duplication
Production-ready with advanced analytics
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

# Import from Authentication app - NO DUPLICATION
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
    
    user = models.OneToOneField(
        UserAccount if AUTH_APP_AVAILABLE else 'authentication.UserAccount',
        on_delete=models.CASCADE,
        related_name='business_profile',
        help_text="Linked user from authentication system"
    )
    
    client_type = models.CharField(
        max_length=20,
        choices=[
            ('residential', 'Residential'),
            ('business', 'Business'),
            ('student', 'Student'),
            ('tourist', 'Tourist'),
            ('freelancer', 'Freelancer'),
            ('corporate', 'Corporate')
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
        """Queue metrics update for async processing"""
        try:
            from user_management.tasks import update_client_metrics_task
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
                'user': approved_by_user.email,
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