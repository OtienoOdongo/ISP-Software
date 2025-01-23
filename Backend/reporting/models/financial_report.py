from django.db import models

class MonthlyFinancial(models.Model):
    """
    Model for storing monthly financial data.

    Attributes:
        month (CharField): The name of the month.
        targeted_revenue (DecimalField): The targeted revenue for the month.
        projected_revenue (DecimalField): The projected revenue for the month.
        income (DecimalField): Total income for the month.
        profit (DecimalField): Total profit for the month.
        expenses (DecimalField): Total expenses for the month.
    """
    MONTH_CHOICES = [
        ('Jan', 'January'), ('Feb', 'February'), ('Mar', 'March'), ('Apr', 'April'),
        ('May', 'May'), ('Jun', 'June'), ('Jul', 'July'), ('Aug', 'August'),
        ('Sept', 'September'), ('Oct', 'October'), ('Nov', 'November'), ('Dec', 'December')
    ]

    month = models.CharField(max_length=4, choices=MONTH_CHOICES)
    targeted_revenue = models.DecimalField(max_digits=10, decimal_places=2)
    projected_revenue = models.DecimalField(max_digits=10, decimal_places=2)
    income = models.DecimalField(max_digits=10, decimal_places=2)
    profit = models.DecimalField(max_digits=10, decimal_places=2)
    expenses = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Financial Report for {self.get_month_display()}"