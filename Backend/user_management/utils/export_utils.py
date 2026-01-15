"""
Export Utilities for Data Export Functionality
"""
import csv
import json
import io
import logging
from django.http import HttpResponse
from django.utils import timezone
from decimal import Decimal
from datetime import datetime

logger = logging.getLogger(__name__)


class DataExporter:
    """Base class for data exporters"""
    
    @staticmethod
    def export_to_csv(data, filename=None, headers=None):
        """Export data to CSV format"""
        try:
            if not data:
                return None
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write headers
            if headers:
                writer.writerow(headers)
            elif data and isinstance(data[0], dict):
                writer.writerow(data[0].keys())
            
            # Write data
            for row in data:
                if isinstance(row, dict):
                    writer.writerow([
                        DataExporter._format_value(value)
                        for value in row.values()
                    ])
                elif isinstance(row, (list, tuple)):
                    writer.writerow([
                        DataExporter._format_value(value)
                        for value in row
                    ])
            
            content = output.getvalue()
            output.close()
            
            return content
            
        except Exception as e:
            logger.error(f"Error exporting to CSV: {str(e)}")
            raise
    
    @staticmethod
    def export_to_json(data, filename=None):
        """Export data to JSON format"""
        try:
            # Convert Decimal to float for JSON serialization
            def decimal_default(obj):
                if isinstance(obj, Decimal):
                    return float(obj)
                elif isinstance(obj, datetime):
                    return obj.isoformat()
                raise TypeError
            
            return json.dumps(data, default=decimal_default, indent=2)
            
        except Exception as e:
            logger.error(f"Error exporting to JSON: {str(e)}")
            raise
    
    @staticmethod
    def export_to_excel(data_dict, filename=None):
        """Export multiple datasets to Excel with multiple sheets"""
        try:
            import pandas as pd
            from io import BytesIO
            
            output = BytesIO()
            
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                for sheet_name, data in data_dict.items():
                    if isinstance(data, list) and data:
                        # Convert list of dicts to DataFrame
                        df = pd.DataFrame(data)
                        df.to_excel(writer, sheet_name=sheet_name[:31], index=False)
                    elif isinstance(data, pd.DataFrame):
                        data.to_excel(writer, sheet_name=sheet_name[:31], index=False)
            
            return output.getvalue()
            
        except ImportError:
            logger.error("Pandas/Openpyxl not installed for Excel export")
            raise
    
    @staticmethod
    def create_multi_sheet_export(data_sheets, filename="export.xlsx"):
        """Create multi-sheet Excel export"""
        try:
            import pandas as pd
            from io import BytesIO
            
            output = BytesIO()
            
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                for sheet_name, sheet_data in data_sheets.items():
                    if isinstance(sheet_data, list):
                        df = pd.DataFrame(sheet_data)
                    elif isinstance(sheet_data, pd.DataFrame):
                        df = sheet_data
                    else:
                        continue
                    
                    # Truncate sheet name to Excel's 31-character limit
                    safe_sheet_name = str(sheet_name)[:31]
                    df.to_excel(writer, sheet_name=safe_sheet_name, index=False)
            
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"Error creating multi-sheet export: {str(e)}")
            raise
    
    @staticmethod
    def create_download_response(content, format, filename=None):
        """Create HTTP response for download"""
        if not filename:
            filename = f"export_{timezone.now().date()}.{format}"
        
        content_types = {
            'csv': 'text/csv',
            'json': 'application/json',
            'txt': 'text/plain',
            'excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
        
        response = HttpResponse(
            content,
            content_type=content_types.get(format, 'text/plain')
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
    
    @staticmethod
    def _format_value(value):
        """Format value for CSV export"""
        if value is None:
            return ''
        elif isinstance(value, datetime):
            return value.strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(value, Decimal):
            return str(float(value))
        elif isinstance(value, (dict, list)):
            return json.dumps(value)
        else:
            return str(value)


class ClientExporter(DataExporter):
    """Client data exporter"""
    
    @staticmethod
    def export_clients(clients_queryset, format='csv', include_columns=None):
        """Export clients data"""
        # Default columns to include
        default_columns = [
            'id', 'username', 'phone_number', 'connection_type',
            'client_type', 'tier', 'status', 'lifetime_value',
            'monthly_recurring_revenue', 'churn_risk_score',
            'engagement_score', 'customer_since', 'last_login_date',
            'last_payment_date', 'days_active', 'revenue_segment',
            'usage_pattern', 'primary_device', 'is_marketer'
        ]
        
        columns = include_columns or default_columns
        
        # Prepare data
        data = []
        for client in clients_queryset:
            row = {}
            for column in columns:
                value = getattr(client, column, None)
                if column == 'username':
                    value = client.username
                elif column == 'phone_number':
                    value = client.phone_number
                elif column == 'connection_type':
                    value = client.connection_type
                row[column] = value
            data.append(row)
        
        # Export based on format
        if format == 'csv':
            headers = [
                col.replace('_', ' ').title()
                for col in columns
            ]
            return DataExporter.export_to_csv(data, headers=headers)
        elif format == 'json':
            return DataExporter.export_to_json(data)
        elif format in ['excel', 'xlsx']:
            return DataExporter.export_to_excel({'Clients': data})
        else:
            raise ValueError(f"Unsupported format: {format}")


class ReportExporter:
    """Advanced report exporter with formatting"""
    
    @staticmethod
    def export_client_report(clients, format='csv', report_type='detailed'):
        """Export client report with advanced formatting"""
        if report_type == 'detailed':
            return ReportExporter._export_detailed_client_report(clients, format)
        elif report_type == 'summary':
            return ReportExporter._export_summary_client_report(clients, format)
        elif report_type == 'financial':
            return ReportExporter._export_financial_client_report(clients, format)
        else:
            return ClientExporter.export_clients(clients, format)
    
    @staticmethod
    def _export_detailed_client_report(clients, format):
        """Export detailed client report"""
        detailed_data = []
        
        for client in clients:
            client_info = {
                'Client ID': str(client.id),
                'Username': client.username,
                'Phone Number': client.phone_number,
                'Email': client.user.email if hasattr(client.user, 'email') else '',
                'Connection Type': client.connection_type,
                'Client Type': client.client_type,
                'Tier': client.tier,
                'Status': client.status,
                'Customer Since': client.customer_since.strftime('%Y-%m-%d') if client.customer_since else '',
                'Last Login': client.last_login_date.strftime('%Y-%m-%d %H:%M') if client.last_login_date else '',
                'Last Payment': client.last_payment_date.strftime('%Y-%m-%d') if client.last_payment_date else '',
                'Days Active': client.days_active,
                'Lifetime Value': float(client.lifetime_value),
                'Monthly Revenue': float(client.monthly_recurring_revenue),
                'Avg Monthly Spend': float(client.avg_monthly_spend),
                'Churn Risk Score': float(client.churn_risk_score),
                'Engagement Score': float(client.engagement_score),
                'Satisfaction Score': float(client.satisfaction_score),
                'Revenue Segment': client.revenue_segment,
                'Usage Pattern': client.usage_pattern,
                'Primary Device': client.primary_device,
                'Devices Count': client.devices_count,
                'Is Marketer': 'Yes' if client.is_marketer else 'No',
                'Marketer Tier': client.marketer_tier if client.is_marketer else '',
                'Commission Balance': float(client.commission_balance) if client.is_marketer else 0,
                'Referral Code': client.referral_code,
                'Referred By': client.referred_by.username if client.referred_by else '',
                'Hotspot Sessions': client.hotspot_sessions,
                'Hotspot Conversion Rate': float(client.hotspot_conversion_rate),
                'Payment Abandonment Rate': float(client.payment_abandonment_rate),
                'Total Data Used (GB)': float(client.total_data_used_gb),
                'Avg Monthly Data (GB)': float(client.avg_monthly_data_gb),
                'Peak Usage Hour': client.peak_usage_hour if client.peak_usage_hour else '',
                'Renewal Rate': float(client.renewal_rate),
                'Days Since Last Payment': client.days_since_last_payment,
                'Preferred Payment Method': client.preferred_payment_method,
                'Behavior Tags': ', '.join(client.behavior_tags) if client.behavior_tags else '',
                'Created At': client.created_at.strftime('%Y-%m-%d %H:%M'),
                'Updated At': client.updated_at.strftime('%Y-%m-%d %H:%M')
            }
            detailed_data.append(client_info)
        
        if format == 'csv':
            return DataExporter.export_to_csv(detailed_data)
        elif format in ['excel', 'xlsx']:
            return DataExporter.export_to_excel({'Client Report': detailed_data})
        elif format == 'json':
            return DataExporter.export_to_json(detailed_data)
        else:
            raise ValueError(f"Unsupported format: {format}")
    
    @staticmethod
    def _export_summary_client_report(clients, format):
        """Export summary client report"""
        summary_data = []
        
        for client in clients:
            summary_data.append({
                'Client ID': str(client.id),
                'Username': client.username,
                'Phone': client.phone_number,
                'Type': client.client_type,
                'Tier': client.tier,
                'Status': client.status,
                'Lifetime Value': float(client.lifetime_value),
                'Monthly Revenue': float(client.monthly_recurring_revenue),
                'Churn Risk': float(client.churn_risk_score),
                'Last Activity': client.last_login_date.strftime('%Y-%m-%d') if client.last_login_date else 'Never',
                'Customer Since': client.customer_since.strftime('%Y-%m-%d') if client.customer_since else ''
            })
        
        if format == 'csv':
            return DataExporter.export_to_csv(summary_data)
        elif format in ['excel', 'xlsx']:
            return DataExporter.export_to_excel({'Client Summary': summary_data})
        else:
            return DataExporter.export_to_json(summary_data)
    
    @staticmethod
    def _export_financial_client_report(clients, format):
        """Export financial-focused client report"""
        financial_data = []
        
        for client in clients:
            financial_data.append({
                'Client ID': str(client.id),
                'Username': client.username,
                'Lifetime Value': float(client.lifetime_value),
                'Monthly Revenue': float(client.monthly_recurring_revenue),
                'Avg Monthly Spend': float(client.avg_monthly_spend),
                'Revenue Segment': client.revenue_segment,
                'Customer Since': client.customer_since.strftime('%Y-%m-%d') if client.customer_since else '',
                'Days Active': client.days_active,
                'Value Per Day': float(client.lifetime_value / client.days_active) if client.days_active > 0 else 0,
                'Churn Risk': float(client.churn_risk_score),
                'Engagement Score': float(client.engagement_score),
                'Renewal Rate': float(client.renewal_rate),
                'Last Payment': client.last_payment_date.strftime('%Y-%m-%d') if client.last_payment_date else 'Never',
                'Days Since Payment': client.days_since_last_payment,
                'Payment Risk': 'High' if client.days_since_last_payment > 30 else 'Medium' if client.days_since_last_payment > 14 else 'Low'
            })
        
        if format == 'csv':
            return DataExporter.export_to_csv(financial_data)
        elif format in ['excel', 'xlsx']:
            return DataExporter.export_to_excel({'Financial Report': financial_data})
        else:
            return DataExporter.export_to_json(financial_data)


class AnalyticsExporter(DataExporter):
    """Analytics data exporter"""
    
    @staticmethod
    def export_analytics(analytics_data, format='csv', report_type='summary'):
        """Export analytics data"""
        if report_type == 'summary':
            return AnalyticsExporter._export_summary(analytics_data, format)
        elif report_type == 'detailed':
            return AnalyticsExporter._export_detailed(analytics_data, format)
        else:
            raise ValueError(f"Unsupported report type: {report_type}")
    
    @staticmethod
    def _export_summary(data, format):
        """Export summary analytics"""
        summary_data = []
        
        # Add financial summary
        if 'financial' in data:
            financial = data['financial']
            summary_data.append({'category': 'Financial', 'metric': 'Total Revenue', 'value': financial.get('total_revenue', 0)})
            summary_data.append({'category': 'Financial', 'metric': 'Monthly Revenue', 'value': financial.get('monthly_revenue', 0)})
            summary_data.append({'category': 'Financial', 'metric': 'Growth Rate', 'value': financial.get('growth_rate', 0)})
        
        # Add client summary
        if 'clients' in data:
            clients = data['clients']
            summary_data.append({'category': 'Clients', 'metric': 'Total Clients', 'value': clients.get('total', 0)})
            summary_data.append({'category': 'Clients', 'metric': 'Active Clients', 'value': clients.get('active', 0)})
            summary_data.append({'category': 'Clients', 'metric': 'New Today', 'value': clients.get('new_today', 0)})
        
        if format == 'csv':
            headers = ['Category', 'Metric', 'Value']
            return DataExporter.export_to_csv(summary_data, headers=headers)
        elif format == 'json':
            return DataExporter.export_to_json(summary_data)
        elif format in ['excel', 'xlsx']:
            return DataExporter.export_to_excel({'Analytics Summary': summary_data})
    
    @staticmethod
    def _export_detailed(data, format):
        """Export detailed analytics"""
        # This would include more detailed breakdowns
        return DataExporter.export_to_json(data)


class CommissionExporter(DataExporter):
    """Commission data exporter"""
    
    @staticmethod
    def export_commissions(transactions_queryset, format='csv'):
        """Export commission transactions"""
        data = []
        for transaction in transactions_queryset:
            row = {
                'id': str(transaction.id),
                'marketer': transaction.marketer.username,
                'transaction_type': transaction.transaction_type,
                'amount': float(transaction.amount),
                'description': transaction.description,
                'status': transaction.status,
                'transaction_date': transaction.transaction_date,
                'approved_at': transaction.approved_at,
                'paid_at': transaction.paid_at,
                'payment_method': transaction.payment_method,
                'payment_reference': transaction.payment_reference
            }
            data.append(row)
        
        if format == 'csv':
            headers = [
                'ID', 'Marketer', 'Type', 'Amount', 'Description',
                'Status', 'Transaction Date', 'Approved At',
                'Paid At', 'Payment Method', 'Payment Reference'
            ]
            return DataExporter.export_to_csv(data, headers=headers)
        elif format == 'json':
            return DataExporter.export_to_json(data)
        elif format in ['excel', 'xlsx']:
            return DataExporter.export_to_excel({'Commission Transactions': data})