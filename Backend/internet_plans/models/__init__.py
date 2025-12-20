"""
Internet Plans Models
Exports all models for easy import
"""

from internet_plans.models.plan_models import PlanTemplate, InternetPlan
from internet_plans.models.pricing_models import PriceMatrix, DiscountRule

__all__ = [
    'PlanTemplate',
    'InternetPlan',
    'PriceMatrix',
    'DiscountRule'
]