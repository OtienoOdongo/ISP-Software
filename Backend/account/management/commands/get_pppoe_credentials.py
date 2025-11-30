# management/commands/get_pppoe_credentials.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from authentication.models import UserAccount  
import sys

class Command(BaseCommand):
    help = 'Get PPPoE usernames and passwords for admin purposes'

    def add_arguments(self, parser):
        parser.add_argument(
            '--client-id',
            type=str,
            help='Filter by specific client ID'
        )
        parser.add_argument(
            '--phone',
            type=str, 
            help='Filter by phone number'
        )
        parser.add_argument(
            '--email',
            type=str,
            help='Filter by admin email (to show admin info)'
        )
        parser.add_argument(
            '--export',
            type=str,
            choices=['csv', 'json'],
            help='Export to CSV or JSON file'
        )
        parser.add_argument(
            '--show-admin',
            action='store_true',
            help='Show admin user information'
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Show all users with their types'
        )

    def handle(self, *args, **options):
        # Show all users if requested
        if options['all']:
            self.show_all_users()
            return

        # Show admin info if requested
        if options['show_admin'] or options['email']:
            self.show_admin_info(options)
            return

        # Get PPPoE clients (these are the ones with credentials)
        clients = UserAccount.objects.filter(
            connection_type='pppoe', 
            is_active=True
        )
        
        # Apply filters
        if options['client_id']:
            clients = clients.filter(client_id=options['client_id'])
        if options['phone']:
            clients = clients.filter(phone_number__contains=options['phone'])

        if not clients.exists():
            self.stdout.write(
                self.style.WARNING("❌ No PPPoE clients found matching your criteria.")
            )
            self.stdout.write(
                self.style.NOTICE("💡 Try: python manage.py get_pppoe_credentials --all to see all users")
            )
            return

        credentials = []
        for client in clients:
            password = client.get_pppoe_password_decrypted()
            credential_data = {
                'client_id': client.client_id,
                'phone_number': str(client.phone_number),
                'pppoe_username': client.pppoe_username,
                'pppoe_password': password,
                'user_type': client.user_type,
                'connection_type': client.connection_type,
                'status': 'Active' if client.is_active else 'Inactive',
                'last_pppoe_login': client.last_pppoe_login,
            }
            credentials.append(credential_data)
            
            # Print to console
            self.stdout.write(
                self.style.SUCCESS(
                    f"📱 Client ID: {client.client_id}\n"
                    f"📞 Phone: {client.phone_number}\n" 
                    f"👤 PPPoE Username: {client.pppoe_username}\n"
                    f"🔑 PPPoE Password: {password}\n"
                    f"🎯 User Type: {client.get_user_type_display()}\n"
                    f"🔗 Connection: {client.get_connection_type_display()}\n"
                    f"📊 Active: {'✅' if client.is_active else '❌'}\n"
                    f"⏰ Last PPPoE Login: {client.last_pppoe_login or 'Never'}\n"
                    f"{'='*50}"
                )
            )

        self.stdout.write(
            self.style.SUCCESS(f"✅ Found {len(credentials)} PPPoE client(s)")
        )

        # Export if requested
        if options['export'] == 'csv':
            self.export_to_csv(credentials)
        elif options['export'] == 'json':
            self.export_to_json(credentials)

    def show_admin_info(self, options):
        """Show admin user information"""
        if options['email']:
            admins = UserAccount.objects.filter(
                email=options['email'],
                user_type__in=['admin', 'superadmin']
            )
        else:
            admins = UserAccount.objects.filter(
                user_type__in=['admin', 'superadmin'],
                is_active=True
            )

        if not admins.exists():
            self.stdout.write(
                self.style.WARNING("❌ No admin users found matching your criteria.")
            )
            return

        for admin in admins:
            self.stdout.write(
                self.style.SUCCESS(
                    f"👨‍💼 Admin User:\n"
                    f"📛 Name: {admin.name}\n"
                    f"📧 Email: {admin.email}\n"
                    f"🎯 User Type: {admin.get_user_type_display()}\n"
                    f"🔗 Connection Type: {admin.get_connection_type_display()}\n"
                    f"📅 Joined: {admin.date_joined}\n"
                    f"🔄 Last Updated: {admin.last_updated}\n"
                    f"ℹ️  Note: Admin users don't have PPPoE credentials\n"
                    f"{'='*50}"
                )
            )

    def show_all_users(self):
        """Show all users with their types for debugging"""
        users = UserAccount.objects.all().order_by('user_type', 'connection_type')
        
        user_counts = {
            'total': users.count(),
            'admin': users.filter(user_type__in=['admin', 'superadmin']).count(),
            'pppoe_clients': users.filter(connection_type='pppoe').count(),
            'hotspot_clients': users.filter(connection_type='hotspot').count(),
        }

        self.stdout.write(
            self.style.SUCCESS(f"📊 User Statistics:")
        )
        self.stdout.write(
            self.style.SUCCESS(f"   Total Users: {user_counts['total']}")
        )
        self.stdout.write(
            self.style.SUCCESS(f"   Admin Users: {user_counts['admin']}")
        )
        self.stdout.write(
            self.style.SUCCESS(f"   PPPoE Clients: {user_counts['pppoe_clients']}")
        )
        self.stdout.write(
            self.style.SUCCESS(f"   Hotspot Clients: {user_counts['hotspot_clients']}")
        )
        self.stdout.write(f"\n{'='*60}\n")

        for user in users:
            user_type_icon = "👨‍💼" if user.user_type in ['admin', 'superadmin'] else "👤"
            connection_icon = "🔗" if user.connection_type == 'pppoe' else "📶" if user.connection_type == 'hotspot' else "💻"
            
            self.stdout.write(
                f"{user_type_icon} {user.name or user.username} "
                f"({user.get_user_type_display()}) "
                f"{connection_icon} {user.get_connection_type_display()}\n"
                f"   📧 {user.email or 'N/A'} | "
                f"📞 {user.phone_number or 'N/A'} | "
                f"👤 PPPoE: {user.pppoe_username or 'N/A'}\n"
                f"   🆔 {user.client_id or 'N/A'} | "
                f"📊 Active: {'✅' if user.is_active else '❌'}\n"
                f"{'-'*40}"
            )

    def export_to_csv(self, credentials):
        import csv
        import os
        from django.conf import settings
        
        filename = f"pppoe_credentials_{timezone.now().strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = os.path.join(settings.BASE_DIR, filename)
        
        with open(filepath, 'w', newline='') as csvfile:
            fieldnames = ['client_id', 'phone_number', 'pppoe_username', 'pppoe_password', 'user_type', 'connection_type', 'status', 'last_pppoe_login']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for cred in credentials:
                writer.writerow(cred)
        
        self.stdout.write(self.style.SUCCESS(f"✅ Exported {len(credentials)} credentials to: {filepath}"))

    def export_to_json(self, credentials):
        import json
        import os
        from django.conf import settings
        
        filename = f"pppoe_credentials_{timezone.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = os.path.join(settings.BASE_DIR, filename)
        
        with open(filepath, 'w') as jsonfile:
            json.dump(credentials, jsonfile, indent=2, default=str)
        
        self.stdout.write(self.style.SUCCESS(f"✅ Exported {len(credentials)} credentials to: {filepath}"))