# Generated by Django 5.1.3 on 2025-05-31 10:08

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("account", "0001_initial"),
        ("internet_plans", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="PaymentMethodConfig",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "method_type",
                    models.CharField(
                        choices=[
                            ("mpesa_paybill", "M-Pesa Paybill"),
                            ("mpesa_till", "M-Pesa Till"),
                            ("paypal", "PayPal"),
                            ("bank", "Bank Transfer"),
                        ],
                        max_length=20,
                    ),
                ),
                ("is_active", models.BooleanField(default=True)),
                ("sandbox_mode", models.BooleanField(default=False)),
                ("auto_settle", models.BooleanField(default=True)),
                (
                    "callback_url",
                    models.URLField(blank=True, max_length=255, null=True),
                ),
                (
                    "webhook_secret",
                    models.CharField(blank=True, max_length=64, null=True),
                ),
                (
                    "transaction_limit",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=15, null=True
                    ),
                ),
                (
                    "security_level",
                    models.CharField(
                        choices=[
                            ("critical", "Critical"),
                            ("high", "High"),
                            ("medium", "Medium"),
                            ("low", "Low"),
                            ("secure", "Secure"),
                        ],
                        default="medium",
                        max_length=10,
                    ),
                ),
                ("api_key", models.CharField(blank=True, max_length=100, null=True)),
                ("secret_key", models.CharField(blank=True, max_length=100, null=True)),
                ("short_code", models.CharField(blank=True, max_length=20, null=True)),
                ("pass_key", models.CharField(blank=True, max_length=100, null=True)),
                ("till_number", models.CharField(blank=True, max_length=20, null=True)),
                (
                    "store_number",
                    models.CharField(blank=True, max_length=20, null=True),
                ),
                (
                    "paypal_client_id",
                    models.CharField(blank=True, max_length=100, null=True),
                ),
                ("secret", models.CharField(blank=True, max_length=100, null=True)),
                (
                    "merchant_id",
                    models.CharField(blank=True, max_length=100, null=True),
                ),
                ("bank_name", models.CharField(blank=True, max_length=100, null=True)),
                (
                    "account_number",
                    models.CharField(blank=True, max_length=50, null=True),
                ),
                (
                    "account_name",
                    models.CharField(blank=True, max_length=100, null=True),
                ),
                ("branch_code", models.CharField(blank=True, max_length=20, null=True)),
                ("swift_code", models.CharField(blank=True, max_length=20, null=True)),
                (
                    "configuration_version",
                    models.CharField(default="1.0.0", max_length=10),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "client",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="payment_configs",
                        to="account.client",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Transaction",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("amount", models.DecimalField(decimal_places=2, max_digits=10)),
                ("checkout_id", models.CharField(max_length=100, unique=True)),
                (
                    "mpesa_code",
                    models.CharField(
                        blank=True, max_length=100, null=True, unique=True
                    ),
                ),
                ("phone_number", models.CharField(max_length=15)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("Pending", "Pending"),
                            ("Success", "Success"),
                            ("Failed", "Failed"),
                        ],
                        default="Pending",
                        max_length=20,
                    ),
                ),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
                (
                    "security_level",
                    models.CharField(
                        choices=[
                            ("critical", "Critical"),
                            ("high", "High"),
                            ("medium", "Medium"),
                            ("low", "Low"),
                            ("secure", "Secure"),
                        ],
                        default="medium",
                        max_length=10,
                    ),
                ),
                (
                    "payment_method",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to="payments.paymentmethodconfig",
                    ),
                ),
                (
                    "plan",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to="internet_plans.internetplan",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="ConfigurationHistory",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "action",
                    models.CharField(
                        choices=[
                            ("created", "Created"),
                            ("updated", "Updated"),
                            ("deleted", "Deleted"),
                            ("tested", "Tested"),
                            ("enabled", "Enabled"),
                            ("disabled", "Disabled"),
                        ],
                        max_length=20,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("success", "Success"),
                            ("failed", "Failed"),
                            ("pending", "Pending"),
                        ],
                        default="success",
                        max_length=10,
                    ),
                ),
                ("changes", models.JSONField(default=list)),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
                ("user", models.CharField(blank=True, max_length=100, null=True)),
                (
                    "client",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="config_history",
                        to="account.client",
                    ),
                ),
            ],
            options={
                "verbose_name_plural": "Configuration histories",
                "ordering": ["-timestamp"],
                "indexes": [
                    models.Index(
                        fields=["client", "timestamp"],
                        name="payments_co_client__873d82_idx",
                    ),
                    models.Index(
                        fields=["action"], name="payments_co_action_811755_idx"
                    ),
                    models.Index(
                        fields=["status"], name="payments_co_status_a34f80_idx"
                    ),
                ],
            },
        ),
        migrations.AddIndex(
            model_name="paymentmethodconfig",
            index=models.Index(
                fields=["client", "method_type"], name="payments_pa_client__061290_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="paymentmethodconfig",
            index=models.Index(
                fields=["is_active"], name="payments_pa_is_acti_4950fe_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="paymentmethodconfig",
            index=models.Index(
                fields=["security_level"], name="payments_pa_securit_2ab470_idx"
            ),
        ),
        migrations.AlterUniqueTogether(
            name="paymentmethodconfig",
            unique_together={("client", "method_type")},
        ),
    ]
