from django.core.management.base import BaseCommand
from dashboard.models import GridItem, SalesData, RevenueData, FinancialData, VisitorAnalytics

class Command(BaseCommand):
    help = 'Load initial data into the database'

    def handle(self, *args, **options):
        """
        Load initial data for all models.
        """
        # GridItem data
        grid_data = [
            {'label': 'Active Users', 'value': '12', 'rate': -12.7, 'icon': 'ActiveUsers.png', 'signal_icon': 'WifiSignal.png'},
            {'label': 'Total Clients', 'value': '78', 'rate': 34, 'icon': 'customers.png', 'signal_icon': 'customersGroup.png'},
            {'label': "Today's Income", 'value': 'KES 10,000', 'rate': 45.6, 'icon': 'income.png', 'signal_icon': 'networth.png'},
            {'label': 'Connectivity Hubs', 'value': '3', 'rate': -3.4, 'icon': 'networking.png', 'signal_icon': 'wifiRouter.png'},
        ]
        for item in grid_data:
            GridItem.objects.create(**item)

        # SalesData - Example data, adjust as needed
        sales_data = [
            {'month': 'Jan', 'basic_plan': 150, 'plus_plan': 100, 'premium_plan': 50},
            # ... more data ...
        ]
        for sale in sales_data:
            SalesData.objects.create(**sale)

        # RevenueData - Example data, adjust as needed
        revenue_data = [
            {'month': 'Jan', 'targeted_revenue': 2000, 'projected_revenue': 1800},
            # ... more data ...
        ]
        for revenue in revenue_data:
            RevenueData.objects.create(**revenue)

        # FinancialData - Example data, adjust as needed
        financial_data = [
            {'month': 'Jan', 'income': 20000, 'profit': 5000, 'expenses': 3000},
            # ... more data ...
        ]
        for finance in financial_data:
            FinancialData.objects.create(**finance)

        # VisitorAnalytics - Example data, adjust as needed
        visitor_data = [
            {'plan': 'Basic Plan', 'percentage': 35.0},
            {'plan': 'Plus Plan', 'percentage': 45.0},
            {'plan': 'Premium Plan', 'percentage': 20.0},
        ]
        for visitor in visitor_data:
            VisitorAnalytics.objects.create(**visitor)

        self.stdout.write(self.style.SUCCESS('Successfully loaded all initial data'))