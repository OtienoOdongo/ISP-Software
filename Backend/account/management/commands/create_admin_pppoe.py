
# account/management/commands/create_admin_pppoe
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Create or update PPPoE credentials for admin users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            required=True,
            help='Admin email to create PPPoE credentials for'
        )
        parser.add_argument(
            '--username',
            type=str,
            help='Custom PPPoE username (optional)'
        )
        parser.add_argument(
            '--password',
            type=str,
            help='Custom PPPoE password (optional)'
        )
        parser.add_argument(
            '--bandwidth',
            type=str,
            default='100M',
            help='Bandwidth limit for admin PPPoE (default: 100M)'
        )
        parser.add_argument(
            '--priority',
            type=str,
            choices=['low', 'medium', 'high', 'critical'],
            default='high',
            help='QoS priority for admin PPPoE (default: high)'
        )
        parser.add_argument(
            '--update',
            action='store_true',
            help='Update existing admin PPPoE credentials'
        )
        parser.add_argument(
            '--list',
            action='store_true',
            help='List all admin users with PPPoE credentials'
        )

    def handle(self, *args, **options):
        
        if options['list']:
            self.list_admin_pppoe_users()
            return
            
        email = options['email']
        
        try:
            # Get admin user
            admin_user = User.objects.get(
                email=email,
                user_type__in=['admin', 'superadmin'],
                is_active=True
            )
            
            # Check if user already has PPPoE credentials
            if admin_user.pppoe_username and not options['update']:
                self.stdout.write(
                    self.style.WARNING(
                        f"⚠️  Admin {email} already has PPPoE credentials:\n"
                        f"   Username: {admin_user.pppoe_username}\n"
                        f"   Use --update to change credentials"
                    )
                )
                return
            
            # Generate PPPoE credentials
            pppoe_username = options.get('username') or f"admin_{admin_user.id}"
            pppoe_password = options.get('password')
            
            # Setup admin PPPoE
            result = admin_user.setup_admin_pppoe(
                username=pppoe_username,
                password=pppoe_password
            )
            
            # Update admin-specific settings
            admin_user.admin_pppoe_bandwidth = options['bandwidth']
            admin_user.admin_pppoe_priority = options['priority']
            admin_user.save()
            
            # Get the actual password for display
            actual_password = pppoe_password or admin_user.get_pppoe_password_decrypted()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ PPPoE credentials {'updated' if options['update'] else 'created'} for admin: {admin_user.email}\n"
                    f"👤 PPPoE Username: {result['username']}\n"
                    f"🔑 PPPoE Password: {actual_password}\n"
                    f"📊 Bandwidth Limit: {options['bandwidth']}\n"
                    f"🎯 QoS Priority: {options['priority']}\n"
                    f"🔄 Auto-generated: {result['auto_generated']}\n"
                    f"💡 Note: Admin can now use PPPoE while maintaining admin dashboard access"
                )
            )
            
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f"❌ Admin user with email {email} not found")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Error creating PPPoE credentials: {str(e)}")
            )

    def list_admin_pppoe_users(self):
        """List all admin users with PPPoE credentials"""
        admin_pppoe_users = User.get_admin_pppoe_users()
        
        if not admin_pppoe_users.exists():
            self.stdout.write(
                self.style.WARNING("❌ No admin users with PPPoE credentials found")
            )
            return
        
        self.stdout.write(
            self.style.SUCCESS(f"📋 Admin Users with PPPoE Credentials ({admin_pppoe_users.count()} total):")
        )
        
        for user in admin_pppoe_users:
            password = user.get_pppoe_password_decrypted()
            self.stdout.write(
                f"\n👨‍💼 {user.name} ({user.email})\n"
                f"   👤 PPPoE Username: {user.pppoe_username}\n"
                f"   🔑 PPPoE Password: {password}\n"
                f"   📊 Bandwidth: {user.admin_pppoe_bandwidth}\n"
                f"   🎯 Priority: {user.admin_pppoe_priority}\n"
                f"   🔗 Connection Type: {user.get_connection_type_display()}\n"
                f"   📅 Last PPPoE Login: {user.last_pppoe_login or 'Never'}\n"
                f"   {'='*40}"
            )





# Create PPPoE credentials for your admin account:

# bash
# python manage.py create_admin_pppoe --email=your_admin@email.com --username=admin_pppoe --password=your_secure_password