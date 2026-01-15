# """
# SMS Automation Admin Configuration
# """
# from django.contrib import admin
# from django.utils.html import format_html
# from django.db.models import Count, Avg, Sum
# from django.utils import timezone
# from datetime import timedelta
# import json

# from .models import (
#     SMSGatewayConfig, SMSTemplate, SMSMessage,
#     SMSDeliveryLog, SMSAutomationRule, SMSQueue, SMSAnalytics
# )


# @admin.register(SMSGatewayConfig)
# class SMSGatewayConfigAdmin(admin.ModelAdmin):
#     """Admin configuration for SMS Gateway"""
#     list_display = [
#         'name', 'gateway_type', 'is_default', 'is_active', 
#         'is_online', 'balance_display', 'success_rate_display',
#         'messages_today', 'health_status'
#     ]
#     list_filter = ['gateway_type', 'is_active', 'is_default', 'is_online']
#     search_fields = ['name', 'sender_id', 'api_url']
#     readonly_fields = [
#         'last_used', 'last_online_check', 'last_balance_check',
#         'total_messages_sent', 'total_messages_failed', 'success_rate',
#         'avg_delivery_time', 'created_at', 'updated_at'
#     ]
#     fieldsets = (
#         ('Basic Information', {
#             'fields': ('name', 'gateway_type', 'is_default', 'is_active', 'weight')
#         }),
#         ('API Configuration', {
#             'fields': ('api_key', 'api_secret', 'api_url', 'sender_id', 'shortcode')
#         }),
#         ('SMPP Configuration', {
#             'fields': ('smpp_host', 'smpp_port', 'smpp_system_id', 'smpp_password', 'smpp_system_type'),
#             'classes': ('collapse',)
#         }),
#         ('Rate Limiting', {
#             'fields': ('max_messages_per_minute', 'max_messages_per_hour', 'max_messages_per_day')
#         }),
#         ('Cost & Billing', {
#             'fields': ('cost_per_message', 'currency', 'balance')
#         }),
#         ('Status Tracking', {
#             'fields': ('is_online', 'last_online_check', 'last_balance_check', 'last_used')
#         }),
#         ('Performance Metrics', {
#             'fields': ('total_messages_sent', 'total_messages_failed', 'success_rate', 'avg_delivery_time')
#         }),
#         ('Configuration', {
#             'fields': ('config', 'health_check_url', 'delivery_report_url')
#         }),
#         ('Timestamps', {
#             'fields': ('created_at', 'updated_at')
#         })
#     )
#     actions = ['test_connection', 'toggle_active', 'set_as_default']
    
#     def balance_display(self, obj):
#         return f"{obj.currency} {obj.balance:,.2f}"
#     balance_display.short_description = 'Balance'
    
#     def success_rate_display(self, obj):
#         return f"{obj.success_rate:.1f}%"
#     success_rate_display.short_description = 'Success Rate'
    
#     def messages_today(self, obj):
#         today = timezone.now().date()
#         return obj.messages.filter(created_at__date=today).count()
#     messages_today.short_description = 'Today'
    
#     def health_status(self, obj):
#         status = obj.get_health_status()
#         colors = {
#             'healthy': 'green',
#             'inactive': 'gray',
#             'offline': 'orange',
#             'no_balance': 'red',
#             'poor_performance': 'yellow'
#         }
#         color = colors.get(status, 'gray')
#         return format_html(
#             '<span style="color: {}; font-weight: bold;">{}</span>',
#             color, status.upper()
#         )
#     health_status.short_description = 'Health Status'
    
#     def test_connection(self, request, queryset):
#         """Test connection for selected gateways"""
#         from .services import SMSService
#         sms_service = SMSService()
        
#         for gateway in queryset:
#             try:
#                 result = sms_service.test_gateway_connection(gateway)
#                 if result['success']:
#                     self.message_user(
#                         request,
#                         f"Gateway {gateway.name}: Connection successful. Balance: {result.get('balance', 0)}"
#                     )
#                 else:
#                     self.message_user(
#                         request,
#                         f"Gateway {gateway.name}: Connection failed. Error: {result.get('error', 'Unknown')}",
#                         level='ERROR'
#                     )
#             except Exception as e:
#                 self.message_user(
#                     request,
#                     f"Gateway {gateway.name}: Error: {str(e)}",
#                     level='ERROR'
#                 )
#     test_connection.short_description = "Test Connection"
    
#     def toggle_active(self, request, queryset):
#         """Toggle active status for selected gateways"""
#         for gateway in queryset:
#             gateway.is_active = not gateway.is_active
#             gateway.save()
#             self.message_user(
#                 request,
#                 f"Gateway {gateway.name} is now {'active' if gateway.is_active else 'inactive'}"
#             )
#     toggle_active.short_description = "Toggle Active Status"
    
#     def set_as_default(self, request, queryset):
#         """Set selected gateway as default"""
#         if queryset.count() != 1:
#             self.message_user(request, "Please select exactly one gateway", level='ERROR')
#             return
        
#         gateway = queryset.first()
#         gateway.is_default = True
#         gateway.save()
#         self.message_user(request, f"Gateway {gateway.name} set as default")
#     set_as_default.short_description = "Set as Default Gateway"


# @admin.register(SMSTemplate)
# class SMSTemplateAdmin(admin.ModelAdmin):
#     """Admin configuration for SMS Templates"""
#     list_display = [
#         'name', 'template_type', 'language', 'is_active',
#         'usage_count', 'character_count_display', 'last_used_display'
#     ]
#     list_filter = ['template_type', 'is_active', 'is_system', 'language']
#     search_fields = ['name', 'subject', 'message_template', 'description']
#     readonly_fields = ['usage_count', 'last_used', 'character_count', 'created_at', 'updated_at']
#     fieldsets = (
#         ('Basic Information', {
#             'fields': ('name', 'template_type', 'language', 'subject', 'description', 'category')
#         }),
#         ('Template Content', {
#             'fields': ('message_template', 'max_length', 'allow_unicode')
#         }),
#         ('Variables', {
#             'fields': ('variables', 'required_variables'),
#             'classes': ('collapse',)
#         }),
#         ('Configuration', {
#             'fields': ('is_active', 'is_system', 'tags')
#         }),
#         ('Usage Statistics', {
#             'fields': ('usage_count', 'last_used', 'character_count'),
#             'classes': ('collapse',)
#         }),
#         ('Metadata', {
#             'fields': ('created_by', 'created_at', 'updated_at')
#         })
#     )
#     actions = ['duplicate_template', 'toggle_active']
    
#     def character_count_display(self, obj):
#         return f"{obj.character_count}/{obj.max_length}"
#     character_count_display.short_description = 'Characters'
    
#     def last_used_display(self, obj):
#         if obj.last_used:
#             return obj.last_used.strftime('%Y-%m-%d %H:%M')
#         return 'Never'
#     last_used_display.short_description = 'Last Used'
    
#     def duplicate_template(self, request, queryset):
#         """Duplicate selected templates"""
#         for template in queryset:
#             duplicate = SMSTemplate.objects.create(
#                 name=f"{template.name} (Copy)",
#                 template_type=template.template_type,
#                 language=template.language,
#                 subject=template.subject,
#                 message_template=template.message_template,
#                 variables=template.variables,
#                 required_variables=template.required_variables,
#                 is_active=template.is_active,
#                 max_length=template.max_length,
#                 allow_unicode=template.allow_unicode,
#                 description=template.description,
#                 category=template.category,
#                 tags=template.tags,
#                 created_by=request.user
#             )
#             self.message_user(request, f"Template '{template.name}' duplicated as '{duplicate.name}'")
#     duplicate_template.short_description = "Duplicate Templates"
    
#     def toggle_active(self, request, queryset):
#         """Toggle active status for selected templates"""
#         for template in queryset:
#             if template.is_system:
#                 self.message_user(
#                     request,
#                     f"Cannot deactivate system template: {template.name}",
#                     level='WARNING'
#                 )
#                 continue
            
#             template.is_active = not template.is_active
#             template.save()
#             self.message_user(
#                 request,
#                 f"Template {template.name} is now {'active' if template.is_active else 'inactive'}"
#             )
#     toggle_active.short_description = "Toggle Active Status"


# @admin.register(SMSMessage)
# class SMSMessageAdmin(admin.ModelAdmin):
#     """Admin configuration for SMS Messages"""
#     list_display = [
#         'phone_display', 'recipient_name', 'status_display',
#         'priority_display', 'gateway_name', 'created_at_display',
#         'sent_at_display', 'cost_display'
#     ]
#     list_filter = [
#         'status', 'priority', 'gateway', 'template', 'source',
#         'created_at'
#     ]
#     search_fields = [
#         'phone_number', 'recipient_name', 'message',
#         'reference_id', 'gateway_message_id'
#     ]
#     readonly_fields = [
#         'character_count', 'message_parts', 'status_history',
#         'sent_at', 'delivered_at', 'delivery_latency',
#         'retry_count', 'created_at', 'updated_at'
#     ]
#     fieldsets = (
#         ('Recipient Information', {
#             'fields': ('phone_number', 'recipient_name', 'client')
#         }),
#         ('Message Content', {
#             'fields': ('template', 'message', 'original_template')
#         }),
#         ('Sending Configuration', {
#             'fields': ('gateway', 'priority', 'scheduled_for', 'expires_at')
#         }),
#         ('Status Tracking', {
#             'fields': ('status', 'status_message', 'status_history')
#         }),
#         ('Delivery Tracking', {
#             'fields': ('sent_at', 'delivered_at', 'delivery_latency',
#                       'gateway_message_id', 'gateway_response',
#                       'delivery_attempts', 'delivery_confirmations')
#         }),
#         ('Cost & Retry', {
#             'fields': ('cost', 'currency', 'retry_count', 'max_retries',
#                       'next_retry_at', 'retry_strategy')
#         }),
#         ('Metadata', {
#             'fields': ('source', 'source_module', 'reference_id', 'correlation_id',
#                       'context_data', 'metadata', 'created_by', 'sent_by')
#         }),
#         ('Message Information', {
#             'fields': ('character_count', 'message_parts'),
#             'classes': ('collapse',)
#         }),
#         ('Timestamps', {
#             'fields': ('created_at', 'updated_at')
#         })
#     )
#     actions = ['retry_failed', 'cancel_selected', 'export_selected']
    
#     def phone_display(self, obj):
#         return format_html(
#             '<span title="{}">{}</span>',
#             obj.phone_number,
#             obj.phone_formatted or obj.phone_number
#         )
#     phone_display.short_description = 'Phone'
    
#     def status_display(self, obj):
#         status_colors = {
#             'pending': 'blue',
#             'queued': 'cyan',
#             'sending': 'orange',
#             'sent': 'green',
#             'delivered': 'darkgreen',
#             'failed': 'red',
#             'cancelled': 'gray',
#             'expired': 'brown',
#             'rejected': 'darkred'
#         }
#         color = status_colors.get(obj.status, 'gray')
#         return format_html(
#             '<span style="color: {}; font-weight: bold;">{}</span>',
#             color, obj.get_status_display()
#         )
#     status_display.short_description = 'Status'
    
#     def priority_display(self, obj):
#         priority_colors = {
#             'low': 'gray',
#             'normal': 'blue',
#             'high': 'orange',
#             'urgent': 'red'
#         }
#         color = priority_colors.get(obj.priority, 'gray')
#         return format_html(
#             '<span style="color: {};">{}</span>',
#             color, obj.get_priority_display()
#         )
#     priority_display.short_description = 'Priority'
    
#     def gateway_name(self, obj):
#         return obj.gateway.name if obj.gateway else '-'
#     gateway_name.short_description = 'Gateway'
    
#     def created_at_display(self, obj):
#         return obj.created_at.strftime('%Y-%m-%d %H:%M')
#     created_at_display.short_description = 'Created'
    
#     def sent_at_display(self, obj):
#         return obj.sent_at.strftime('%Y-%m-%d %H:%M') if obj.sent_at else '-'
#     sent_at_display.short_description = 'Sent'
    
#     def cost_display(self, obj):
#         if obj.cost:
#             return f"{obj.currency} {obj.cost:.4f}"
#         return '-'
#     cost_display.short_description = 'Cost'
    
#     def retry_failed(self, request, queryset):
#         """Retry failed messages"""
#         from .services import SMSService
#         sms_service = SMSService()
        
#         retried = 0
#         for message in queryset.filter(status='failed'):
#             try:
#                 if sms_service.retry_message(message):
#                     retried += 1
#             except Exception as e:
#                 self.message_user(
#                     request,
#                     f"Failed to retry message {message.id}: {str(e)}",
#                     level='ERROR'
#                 )
        
#         self.message_user(
#             request,
#             f"Retried {retried} failed messages"
#         )
#     retry_failed.short_description = "Retry Failed Messages"
    
#     def cancel_selected(self, request, queryset):
#         """Cancel selected messages"""
#         from .services import SMSService
#         sms_service = SMSService()
        
#         cancelled = 0
#         for message in queryset.filter(status__in=['pending', 'scheduled']):
#             try:
#                 if sms_service.cancel_message(message):
#                     cancelled += 1
#             except Exception as e:
#                 self.message_user(
#                     request,
#                     f"Failed to cancel message {message.id}: {str(e)}",
#                     level='ERROR'
#                 )
        
#         self.message_user(
#             request,
#             f"Cancelled {cancelled} messages"
#         )
#     cancel_selected.short_description = "Cancel Selected Messages"
    
#     def export_selected(self, request, queryset):
#         """Export selected messages to CSV"""
#         import csv
#         from django.http import HttpResponse
#         from io import StringIO
        
#         response = HttpResponse(content_type='text/csv')
#         response['Content-Disposition'] = 'attachment; filename="sms_messages_export.csv"'
        
#         writer = csv.writer(response)
#         writer.writerow([
#             'ID', 'Phone Number', 'Recipient Name', 'Message',
#             'Status', 'Priority', 'Gateway', 'Template',
#             'Created At', 'Sent At', 'Delivered At',
#             'Cost', 'Source', 'Client'
#         ])
        
#         for message in queryset:
#             writer.writerow([
#                 str(message.id),
#                 message.phone_number,
#                 message.recipient_name,
#                 message.message[:100],
#                 message.get_status_display(),
#                 message.get_priority_display(),
#                 message.gateway.name if message.gateway else '',
#                 message.template.name if message.template else '',
#                 message.created_at.strftime('%Y-%m-%d %H:%M:%S'),
#                 message.sent_at.strftime('%Y-%m-%d %H:%M:%S') if message.sent_at else '',
#                 message.delivered_at.strftime('%Y-%m-%d %H:%M:%S') if message.delivered_at else '',
#                 f"{message.currency} {message.cost:.4f}" if message.cost else '',
#                 message.source,
#                 message.client.username if message.client else ''
#             ])
        
#         return response
#     export_selected.short_description = "Export to CSV"


# @admin.register(SMSDeliveryLog)
# class SMSDeliveryLogAdmin(admin.ModelAdmin):
#     """Admin configuration for SMS Delivery Logs"""
#     list_display = [
#         'message_phone', 'gateway_name', 'status_change',
#         'response_time_display', 'cost_display', 'event_time_display'
#     ]
#     list_filter = ['new_status', 'error_type', 'gateway', 'event_time']
#     search_fields = ['message__phone_number', 'gateway_status_message', 'error_message']
#     readonly_fields = ['event_time', 'created_at']
#     fieldsets = (
#         ('Message Information', {
#             'fields': ('message', 'gateway', 'gateway_transaction_id')
#         }),
#         ('Status Change', {
#             'fields': ('old_status', 'new_status')
#         }),
#         ('Gateway Response', {
#             'fields': ('gateway_response', 'gateway_status_code', 'gateway_status_message')
#         }),
#         ('Error Tracking', {
#             'fields': ('error_type', 'error_code', 'error_message', 'error_details')
#         }),
#         ('Network Metrics', {
#             'fields': ('response_time_ms', 'network_latency_ms')
#         }),
#         ('Cost & Location', {
#             'fields': ('cost', 'currency', 'operator', 'country_code')
#         }),
#         ('Timestamps', {
#             'fields': ('event_time', 'created_at')
#         })
#     )
    
#     def message_phone(self, obj):
#         return obj.message.phone_number if obj.message else '-'
#     message_phone.short_description = 'Phone'
    
#     def gateway_name(self, obj):
#         return obj.gateway.name if obj.gateway else '-'
#     gateway_name.short_description = 'Gateway'
    
#     def status_change(self, obj):
#         return f"{obj.old_status} → {obj.new_status}"
#     status_change.short_description = 'Status Change'
    
#     def response_time_display(self, obj):
#         if obj.response_time_ms:
#             return f"{obj.response_time_ms}ms"
#         return '-'
#     response_time_display.short_description = 'Response Time'
    
#     def cost_display(self, obj):
#         if obj.cost:
#             return f"{obj.currency} {obj.cost:.4f}"
#         return '-'
#     cost_display.short_description = 'Cost'
    
#     def event_time_display(self, obj):
#         return obj.event_time.strftime('%Y-%m-%d %H:%M:%S')
#     event_time_display.short_description = 'Event Time'


# @admin.register(SMSAutomationRule)
# class SMSAutomationRuleAdmin(admin.ModelAdmin):
#     """Admin configuration for SMS Automation Rules"""
#     list_display = [
#         'name', 'rule_type_display', 'is_active',
#         'template_name', 'execution_count', 'success_rate_display',
#         'last_executed_display'
#     ]
#     list_filter = ['rule_type', 'is_active']
#     search_fields = ['name', 'description']
#     readonly_fields = [
#         'execution_count', 'last_executed', 'success_count',
#         'failure_count', 'created_at', 'updated_at'
#     ]
#     fieldsets = (
#         ('Basic Information', {
#             'fields': ('name', 'rule_type', 'description')
#         }),
#         ('Activation', {
#             'fields': ('is_active', 'enabled_from', 'enabled_until')
#         }),
#         ('Template & Message', {
#             'fields': ('template', 'fallback_message')
#         }),
#         ('Conditions & Filters', {
#             'fields': ('conditions', 'filters'),
#             'classes': ('collapse',)
#         }),
#         ('Scheduling', {
#             'fields': ('delay_minutes', 'schedule_cron',
#                       'time_window_start', 'time_window_end')
#         }),
#         ('Rate Limiting', {
#             'fields': ('max_messages_per_day', 'max_messages_per_client',
#                       'cool_down_hours')
#         }),
#         ('Configuration', {
#             'fields': ('priority', 'gateway_override')
#         }),
#         ('Metadata', {
#             'fields': ('tags', 'metadata', 'created_by')
#         }),
#         ('Execution Tracking', {
#             'fields': ('execution_count', 'last_executed',
#                       'success_count', 'failure_count'),
#             'classes': ('collapse',)
#         }),
#         ('Timestamps', {
#             'fields': ('created_at', 'updated_at')
#         })
#     )
#     actions = ['toggle_active', 'execute_selected']
    
#     def rule_type_display(self, obj):
#         return obj.get_rule_type_display()
#     rule_type_display.short_description = 'Rule Type'
    
#     def template_name(self, obj):
#         return obj.template.name if obj.template else '-'
#     template_name.short_description = 'Template'
    
#     def success_rate_display(self, obj):
#         if obj.execution_count > 0:
#             rate = (obj.success_count / obj.execution_count) * 100
#             return f"{rate:.1f}%"
#         return '0%'
#     success_rate_display.short_description = 'Success Rate'
    
#     def last_executed_display(self, obj):
#         if obj.last_executed:
#             return obj.last_executed.strftime('%Y-%m-%d %H:%M')
#         return 'Never'
#     last_executed_display.short_description = 'Last Executed'
    
#     def toggle_active(self, request, queryset):
#         """Toggle active status for selected rules"""
#         for rule in queryset:
#             rule.is_active = not rule.is_active
#             rule.save()
#             self.message_user(
#                 request,
#                 f"Rule {rule.name} is now {'active' if rule.is_active else 'inactive'}"
#             )
#     toggle_active.short_description = "Toggle Active Status"
    
#     def execute_selected(self, request, queryset):
#         """Execute selected rules"""
#         from .services import SMSService
#         sms_service = SMSService()
        
#         executed = 0
#         for rule in queryset:
#             if not rule.is_active:
#                 self.message_user(
#                     request,
#                     f"Rule {rule.name} is not active",
#                     level='WARNING'
#                 )
#                 continue
            
#             try:
#                 # Execute with default context
#                 context = {
#                     'client_name': 'Test Client',
#                     'phone_number': '0712345678',
#                     'test_execution': True
#                 }
                
#                 sms = rule.execute(context, trigger_event='admin_execution')
#                 if sms:
#                     executed += 1
#                     self.message_user(
#                         request,
#                         f"Rule {rule.name} executed successfully. SMS ID: {sms.id}"
#                     )
#                 else:
#                     self.message_user(
#                         request,
#                         f"Rule {rule.name} execution failed",
#                         level='ERROR'
#                     )
                    
#             except Exception as e:
#                 self.message_user(
#                     request,
#                     f"Failed to execute rule {rule.name}: {str(e)}",
#                     level='ERROR'
#                 )
        
#         self.message_user(
#             request,
#             f"Executed {executed} rules"
#         )
#     execute_selected.short_description = "Execute Selected Rules"


# @admin.register(SMSQueue)
# class SMSQueueAdmin(admin.ModelAdmin):
#     """Admin configuration for SMS Queue"""
#     list_display = [
#         'message_phone', 'priority', 'status_display',
#         'queue_position', 'queued_at_display',
#         'processing_time_display'
#     ]
#     list_filter = ['status', 'priority']
#     search_fields = ['message__phone_number', 'error_message']
#     readonly_fields = [
#         'queued_at', 'processing_started', 'processing_ended',
#         'last_error_at', 'queue_position', 'processing_attempts'
#     ]
#     actions = ['process_selected', 'clear_failed']
    
#     def message_phone(self, obj):
#         return obj.message.phone_number if obj.message else '-'
#     message_phone.short_description = 'Phone'
    
#     def status_display(self, obj):
#         status_colors = {
#             'pending': 'blue',
#             'processing': 'orange',
#             'completed': 'green',
#             'failed': 'red'
#         }
#         color = status_colors.get(obj.status, 'gray')
#         return format_html(
#             '<span style="color: {}; font-weight: bold;">{}</span>',
#             color, obj.get_status_display()
#         )
#     status_display.short_description = 'Status'
    
#     def queued_at_display(self, obj):
#         return obj.queued_at.strftime('%Y-%m-%d %H:%M')
#     queued_at_display.short_description = 'Queued'
    
#     def processing_time_display(self, obj):
#         if obj.processing_started:
#             end_time = obj.processing_ended or timezone.now()
#             seconds = (end_time - obj.processing_started).total_seconds()
#             if seconds < 60:
#                 return f"{seconds:.0f}s"
#             else:
#                 return f"{seconds/60:.1f}m"
#         return '-'
#     processing_time_display.short_description = 'Processing Time'
    
#     def process_selected(self, request, queryset):
#         """Process selected queue entries"""
#         from .services import SMSService
#         sms_service = SMSService()
        
#         processed = 0
#         for queue_entry in queryset.filter(status='pending'):
#             try:
#                 # Process the message
#                 success = sms_service.send_sms(queue_entry.message)
#                 if success:
#                     queue_entry.mark_as_completed()
#                     processed += 1
#                 else:
#                     queue_entry.mark_as_failed("Manual processing failed")
#             except Exception as e:
#                 self.message_user(
#                     request,
#                     f"Failed to process queue entry {queue_entry.id}: {str(e)}",
#                     level='ERROR'
#                 )
        
#         self.message_user(
#             request,
#             f"Processed {processed} queue entries"
#         )
#     process_selected.short_description = "Process Selected"
    
#     def clear_failed(self, request, queryset):
#         """Clear failed queue entries"""
#         failed = queryset.filter(status='failed').count()
#         queryset.filter(status='failed').delete()
#         self.message_user(
#             request,
#             f"Cleared {failed} failed queue entries"
#         )
#     clear_failed.short_description = "Clear Failed Entries"


# @admin.register(SMSAnalytics)
# class SMSAnalyticsAdmin(admin.ModelAdmin):
#     """Admin configuration for SMS Analytics"""
#     list_display = [
#         'date_display', 'total_messages', 'delivered_messages',
#         'delivery_rate_display', 'success_rate_display',
#         'total_cost_display'
#     ]
#     list_filter = ['date']
#     search_fields = []
#     readonly_fields = [
#         'date', 'created_at', 'updated_at'
#     ]
#     actions = ['update_analytics']
    
#     def date_display(self, obj):
#         return obj.date.strftime('%Y-%m-%d')
#     date_display.short_description = 'Date'
    
#     def delivery_rate_display(self, obj):
#         return f"{obj.delivery_rate:.1f}%"
#     delivery_rate_display.short_description = 'Delivery Rate'
    
#     def success_rate_display(self, obj):
#         return f"{obj.success_rate:.1f}%"
#     success_rate_display.short_description = 'Success Rate'
    
#     def total_cost_display(self, obj):
#         return f"KES {obj.total_cost:,.2f}"
#     total_cost_display.short_description = 'Total Cost'
    
#     def update_analytics(self, request, queryset):
#         """Update analytics for selected dates"""
#         updated = 0
#         for analytics in queryset:
#             SMSAnalytics.update_daily_analytics(analytics.date)
#             updated += 1
        
#         self.message_user(
#             request,
#             f"Updated analytics for {updated} dates"
#         )
#     update_analytics.short_description = "Update Analytics"


# # Custom admin site configuration
# class SMSAutomationAdminSite(admin.AdminSite):
#     """Custom admin site for SMS Automation"""
#     site_header = "SMS Automation Administration"
#     site_title = "SMS Automation Admin"
#     index_title = "Welcome to SMS Automation Admin"


# # Register admin site
# sms_admin_site = SMSAutomationAdminSite(name='sms_automation_admin')
# sms_admin_site.register(SMSGatewayConfig, SMSGatewayConfigAdmin)
# sms_admin_site.register(SMSTemplate, SMSTemplateAdmin)
# sms_admin_site.register(SMSMessage, SMSMessageAdmin)
# sms_admin_site.register(SMSDeliveryLog, SMSDeliveryLogAdmin)
# sms_admin_site.register(SMSAutomationRule, SMSAutomationRuleAdmin)
# sms_admin_site.register(SMSQueue, SMSQueueAdmin)
# sms_admin_site.register(SMSAnalytics, SMSAnalyticsAdmin)