"""
Internet Plans Signals
Exports all signals for easy import
"""

from internet_plans.signals.plan_signals import (
    plan_created,
    plan_updated,
    plan_deactivated,
    plan_purchased,
    plan_price_changed,
    template_created,
    template_updated,
    setup_signal_receivers
)

__all__ = [
    'plan_created',
    'plan_updated',
    'plan_deactivated',
    'plan_purchased',
    'plan_price_changed',
    'template_created',
    'template_updated',
    'setup_signal_receivers'
]