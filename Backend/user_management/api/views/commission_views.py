"""
Enhanced Commission Management Views
Complete commission transaction workflow
"""
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Q, Sum, Avg, Count, Max, Min
from django.db import transaction
from decimal import Decimal
from datetime import timedelta
import json

from django.db.models.functions import TruncMonth
from django.conf import settings
from user_management.models.client_model import CommissionTransaction, ClientProfile
from user_management.serializers.client_serializer import (
    CommissionTransactionSerializer,
    SendMessageSerializer
)

logger = logging.getLogger(__name__)


class CommissionTransactionViewSet(viewsets.ModelViewSet):
    """Full commission transaction management"""
    queryset = CommissionTransaction.objects.all()
    serializer_class = CommissionTransactionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination
    
    def get_queryset(self):
        """Filter transactions based on query params"""
        queryset = super().get_queryset()
        params = self.request.query_params
        
        # Filter by marketer
        marketer_id = params.get('marketer_id')
        if marketer_id:
            queryset = queryset.filter(marketer_id=marketer_id)
        
        # Filter by status
        status_filter = params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by transaction type
        transaction_type = params.get('transaction_type')
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        
        # Date range filters
        date_from = params.get('date_from')
        date_to = params.get('date_to')
        if date_from:
            queryset = queryset.filter(transaction_date__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(transaction_date__date__lte=date_to)
        
        # Amount range filters
        min_amount = params.get('min_amount')
        max_amount = params.get('max_amount')
        if min_amount:
            queryset = queryset.filter(amount__gte=Decimal(min_amount))
        if max_amount:
            queryset = queryset.filter(amount__lte=Decimal(max_amount))
        
        # Search filter
        search_query = params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(reference_id__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(marketer__user__username__icontains=search_query)
            )
        
        # Sort by parameter
        sort_by = params.get('sort_by', '-transaction_date')
        sort_order = params.get('sort_order', 'desc')
        
        sort_map = {
            'amount': 'amount',
            'date': 'transaction_date',
            'marketer': 'marketer__user__username',
            'status': 'status',
            'type': 'transaction_type'
        }
        
        field = sort_map.get(sort_by, sort_by)
        if sort_order == 'desc' and not field.startswith('-'):
            field = f'-{field}'
        elif sort_order == 'asc' and field.startswith('-'):
            field = field[1:]
        
        return queryset.order_by(field)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve commission transaction"""
        try:
            transaction = self.get_object()
            
            if transaction.status != transaction.Status.PENDING:
                return Response({
                    'error': f'Transaction is already {transaction.status}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            notes = request.data.get('notes', '')
            
            with transaction.atomic():
                transaction.approve(request.user, notes)
                
                # Update marketer stats
                marketer = transaction.marketer
                marketer.commission_balance += transaction.amount
                marketer.total_commission_earned += transaction.amount
                marketer.save()
            
            return Response({
                'success': True,
                'message': 'Commission approved successfully',
                'transaction': CommissionTransactionSerializer(transaction).data
            })
            
        except Exception as e:
            logger.error(f"Error approving commission: {str(e)}")
            return Response({
                'error': 'Failed to approve commission',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark commission as paid"""
        try:
            transaction = self.get_object()
            
            if transaction.status != transaction.Status.APPROVED:
                return Response({
                    'error': f'Only approved transactions can be paid. Current status: {transaction.status}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            payment_method = request.data.get('payment_method')
            payment_reference = request.data.get('payment_reference')
            
            if not payment_method:
                return Response({
                    'error': 'Payment method is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not payment_reference:
                return Response({
                    'error': 'Payment reference is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                transaction.mark_as_paid(payment_method, payment_reference)
            
            return Response({
                'success': True,
                'message': 'Commission marked as paid',
                'transaction': CommissionTransactionSerializer(transaction).data
            })
            
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error marking commission as paid: {str(e)}")
            return Response({
                'error': 'Failed to mark commission as paid',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject commission transaction"""
        try:
            transaction = self.get_object()
            
            if transaction.status != transaction.Status.PENDING:
                return Response({
                    'error': f'Only pending transactions can be rejected. Current status: {transaction.status}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            reason = request.data.get('reason', '')
            
            if not reason:
                return Response({
                    'error': 'Rejection reason is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                transaction.status = transaction.Status.REJECTED
                transaction.notes.append({
                    'type': 'rejection',
                    'timestamp': timezone.now().isoformat(),
                    'user': request.user.email,
                    'reason': reason
                })
                transaction.save()
            
            return Response({
                'success': True,
                'message': 'Commission rejected successfully',
                'transaction': CommissionTransactionSerializer(transaction).data
            })
            
        except Exception as e:
            logger.error(f"Error rejecting commission: {str(e)}")
            return Response({
                'error': 'Failed to reject commission',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel commission transaction"""
        try:
            transaction = self.get_object()
            
            if transaction.status not in [transaction.Status.PENDING, transaction.Status.APPROVED]:
                return Response({
                    'error': f'Transaction cannot be cancelled in {transaction.status} status'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            reason = request.data.get('reason', '')
            
            with transaction.atomic():
                transaction.status = transaction.Status.CANCELLED
                
                # If already approved, reverse the commission balance
                if transaction.status == transaction.Status.APPROVED:
                    marketer = transaction.marketer
                    marketer.commission_balance -= transaction.amount
                    marketer.total_commission_earned -= transaction.amount
                    marketer.save()
                
                transaction.notes.append({
                    'type': 'cancellation',
                    'timestamp': timezone.now().isoformat(),
                    'user': request.user.email,
                    'reason': reason
                })
                transaction.save()
            
            return Response({
                'success': True,
                'message': 'Commission cancelled successfully',
                'transaction': CommissionTransactionSerializer(transaction).data
            })
            
        except Exception as e:
            logger.error(f"Error cancelling commission: {str(e)}")
            return Response({
                'error': 'Failed to cancel commission',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get commission summary"""
        try:
            period = request.query_params.get('period', 'month')
            
            # Calculate date range
            end_date = timezone.now().date()
            if period == 'week':
                start_date = end_date - timedelta(days=7)
            elif period == 'month':
                start_date = end_date - timedelta(days=30)
            elif period == 'quarter':
                start_date = end_date - timedelta(days=90)
            elif period == 'year':
                start_date = end_date - timedelta(days=365)
            else:
                start_date = end_date - timedelta(days=30)
            
            # Get summary statistics
            summary = CommissionTransaction.objects.filter(
                transaction_date__date__gte=start_date,
                transaction_date__date__lte=end_date
            ).aggregate(
                total_amount=Sum('amount'),
                total_transactions=Count('id'),
                avg_amount=Avg('amount'),
                pending_amount=Sum('amount', filter=Q(status='pending')),
                approved_amount=Sum('amount', filter=Q(status='approved')),
                paid_amount=Sum('amount', filter=Q(status='paid'))
            )
            
            # Get distribution by transaction type
            by_type = CommissionTransaction.objects.filter(
                transaction_date__date__gte=start_date,
                transaction_date__date__lte=end_date
            ).values('transaction_type').annotate(
                count=Count('id'),
                amount=Sum('amount'),
                avg_amount=Avg('amount')
            ).order_by('-amount')
            
            # Get distribution by status
            by_status = CommissionTransaction.objects.filter(
                transaction_date__date__gte=start_date,
                transaction_date__date__lte=end_date
            ).values('status').annotate(
                count=Count('id'),
                amount=Sum('amount'),
                avg_amount=Avg('amount')
            ).order_by('status')
            
            # Get top marketers
            top_marketers = CommissionTransaction.objects.filter(
                transaction_date__date__gte=start_date,
                transaction_date__date__lte=end_date,
                status__in=['approved', 'paid']
            ).values(
                'marketer__id',
                'marketer__user__username',
                'marketer__marketer_tier'
            ).annotate(
                total_earned=Sum('amount'),
                transaction_count=Count('id'),
                avg_commission=Avg('amount')
            ).order_by('-total_earned')[:10]
            
            return Response({
                'success': True,
                'timestamp': timezone.now().isoformat(),
                'period': period,
                'date_range': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                },
                'summary': {
                    'total_amount': float(summary['total_amount'] or 0),
                    'total_transactions': summary['total_transactions'] or 0,
                    'average_amount': float(summary['avg_amount'] or 0),
                    'pending_amount': float(summary['pending_amount'] or 0),
                    'approved_amount': float(summary['approved_amount'] or 0),
                    'paid_amount': float(summary['paid_amount'] or 0),
                    'approval_rate': self._calculate_approval_rate(start_date, end_date),
                    'payment_rate': self._calculate_payment_rate(start_date, end_date)
                },
                'distribution_by_type': [
                    {
                        'type': item['transaction_type'],
                        'count': item['count'],
                        'amount': float(item['amount'] or 0),
                        'percentage': round((item['amount'] / summary['total_amount'] * 100), 1) if summary['total_amount'] else 0,
                        'avg_amount': float(item['avg_amount'] or 0)
                    }
                    for item in by_type
                ],
                'distribution_by_status': [
                    {
                        'status': item['status'],
                        'count': item['count'],
                        'amount': float(item['amount'] or 0),
                        'percentage': round((item['amount'] / summary['total_amount'] * 100), 1) if summary['total_amount'] else 0,
                        'avg_amount': float(item['avg_amount'] or 0)
                    }
                    for item in by_status
                ],
                'top_marketers': [
                    {
                        'marketer_id': item['marketer__id'],
                        'username': item['marketer__user__username'],
                        'tier': item['marketer__marketer_tier'],
                        'total_earned': float(item['total_earned'] or 0),
                        'transaction_count': item['transaction_count'],
                        'avg_commission': float(item['avg_commission'] or 0)
                    }
                    for item in top_marketers
                ]
            })
            
        except Exception as e:
            logger.error(f"Error getting commission summary: {str(e)}")
            return Response({
                'error': 'Failed to get commission summary',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def bulk_approve(self, request):
        """Approve multiple commission transactions"""
        try:
            transaction_ids = request.data.get('transaction_ids', [])
            notes = request.data.get('notes', '')
            
            if not transaction_ids:
                return Response({
                    'error': 'No transaction IDs provided'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            approved = 0
            failed = []
            
            with transaction.atomic():
                for trans_id in transaction_ids:
                    try:
                        commission = CommissionTransaction.objects.get(
                            id=trans_id,
                            status=CommissionTransaction.Status.PENDING
                        )
                        
                        commission.approve(request.user, notes)
                        approved += 1
                        
                    except CommissionTransaction.DoesNotExist:
                        failed.append({
                            'id': trans_id,
                            'error': 'Transaction not found or not pending'
                        })
                    except Exception as e:
                        failed.append({
                            'id': trans_id,
                            'error': str(e)
                        })
            
            return Response({
                'success': True,
                'message': f'Approved {approved} transactions',
                'approved_count': approved,
                'failed_transactions': failed
            })
            
        except Exception as e:
            logger.error(f"Error in bulk approve: {str(e)}")
            return Response({
                'error': 'Failed to bulk approve commissions',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def calculate(self, request):
        """Calculate commission for a transaction"""
        try:
            amount = Decimal(request.data.get('amount', '0'))
            marketer_tier = request.data.get('marketer_tier', 'novice')
            transaction_type = request.data.get('transaction_type', 'referral')
            
            if amount <= 0:
                return Response({
                    'error': 'Amount must be greater than 0'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate commission based on tier and type
            commission_rate = self._get_commission_rate(marketer_tier, transaction_type)
            commission_amount = amount * commission_rate / Decimal('100')
            
            # Calculate tier bonus
            tier_bonus = self._calculate_tier_bonus(marketer_tier, amount)
            
            total_commission = commission_amount + tier_bonus
            
            return Response({
                'success': True,
                'calculation': {
                    'purchase_amount': float(amount),
                    'commission_rate': float(commission_rate),
                    'commission_amount': float(commission_amount),
                    'tier_bonus': float(tier_bonus),
                    'total_commission': float(total_commission),
                    'effective_rate': float((total_commission / amount) * 100) if amount > 0 else 0
                },
                'rates': {
                    'base_rate': float(commission_rate),
                    'tier_bonus_percentage': float((tier_bonus / amount) * 100) if amount > 0 else 0,
                    'total_percentage': float((total_commission / amount) * 100) if amount > 0 else 0
                }
            })
            
        except Exception as e:
            logger.error(f"Error calculating commission: {str(e)}")
            return Response({
                'error': 'Failed to calculate commission',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _calculate_approval_rate(self, start_date, end_date):
        """Calculate approval rate for period"""
        total_pending = CommissionTransaction.objects.filter(
            transaction_date__date__gte=start_date,
            transaction_date__date__lte=end_date,
            status='pending'
        ).count()
        
        total_approved = CommissionTransaction.objects.filter(
            transaction_date__date__gte=start_date,
            transaction_date__date__lte=end_date,
            status__in=['approved', 'paid']
        ).count()
        
        total = total_pending + total_approved
        
        return round((total_approved / total * 100), 1) if total > 0 else 0
    
    def _calculate_payment_rate(self, start_date, end_date):
        """Calculate payment rate for period"""
        total_approved = CommissionTransaction.objects.filter(
            transaction_date__date__gte=start_date,
            transaction_date__date__lte=end_date,
            status='approved'
        ).count()
        
        total_paid = CommissionTransaction.objects.filter(
            transaction_date__date__gte=start_date,
            transaction_date__date__lte=end_date,
            status='paid'
        ).count()
        
        total = total_approved + total_paid
        
        return round((total_paid / total * 100), 1) if total > 0 else 0
    
    def _get_commission_rate(self, marketer_tier, transaction_type):
        """Get commission rate based on tier and type"""
        # Base rates by tier
        tier_rates = {
            'novice': Decimal('5.00'),
            'intermediate': Decimal('7.50'),
            'expert': Decimal('10.00'),
            'master': Decimal('15.00')
        }
        
        # Transaction type multipliers
        type_multipliers = {
            'referral': Decimal('1.0'),
            'bonus': Decimal('1.5'),
            'promotional': Decimal('2.0'),
            'adjustment': Decimal('1.0'),
            'payout': Decimal('0.0')  # No commission on payouts
        }
        
        base_rate = tier_rates.get(marketer_tier, Decimal('5.00'))
        multiplier = type_multipliers.get(transaction_type, Decimal('1.0'))
        
        return base_rate * multiplier
    
    def _calculate_tier_bonus(self, marketer_tier, amount):
        """Calculate tier bonus"""
        tier_bonuses = {
            'novice': Decimal('0.00'),
            'intermediate': Decimal('0.01'),  # 1%
            'expert': Decimal('0.02'),       # 2%
            'master': Decimal('0.03')        # 3%
        }
        
        bonus_percentage = tier_bonuses.get(marketer_tier, Decimal('0.00'))
        return amount * bonus_percentage


class CommissionPayoutView(APIView):
    """Process commission payouts"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Process bulk commission payout"""
        try:
            marketer_ids = request.data.get('marketer_ids', [])
            payment_method = request.data.get('payment_method')
            payment_reference = request.data.get('payment_reference')
            notes = request.data.get('notes', '')
            
            if not marketer_ids:
                return Response({
                    'error': 'No marketer IDs provided'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not payment_method:
                return Response({
                    'error': 'Payment method is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            results = []
            total_amount = Decimal('0.00')
            
            with transaction.atomic():
                for marketer_id in marketer_ids:
                    try:
                        marketer = ClientProfile.objects.get(
                            id=marketer_id,
                            is_marketer=True
                        )
                        
                        if marketer.commission_balance <= 0:
                            results.append({
                                'marketer_id': marketer_id,
                                'username': marketer.username,
                                'status': 'skipped',
                                'reason': 'No commission balance'
                            })
                            continue
                        
                        # Create payout transaction
                        payout = CommissionTransaction.objects.create(
                            marketer=marketer,
                            transaction_type=CommissionTransaction.TransactionType.PAYOUT,
                            amount=marketer.commission_balance,
                            description=f"Commission payout via {payment_method}",
                            reference_id=f"PAYOUT-{timezone.now().timestamp()}",
                            commission_rate=Decimal('0.00'),
                            total_commission=marketer.commission_balance,
                            status=CommissionTransaction.Status.APPROVED,
                            approved_by=request.user,
                            approved_at=timezone.now(),
                            payment_method=payment_method,
                            payment_reference=payment_reference,
                            transaction_date=timezone.now()
                        )
                        
                        # Mark as paid immediately
                        payout.status = CommissionTransaction.Status.PAID
                        payout.paid_at = timezone.now()
                        payout.save()
                        
                        # Update marketer balance
                        marketer.commission_balance = Decimal('0.00')
                        marketer.save()
                        
                        total_amount += payout.amount
                        
                        results.append({
                            'marketer_id': marketer_id,
                            'username': marketer.username,
                            'status': 'paid',
                            'amount': float(payout.amount),
                            'transaction_id': str(payout.id),
                            'payment_reference': payment_reference
                        })
                        
                    except ClientProfile.DoesNotExist:
                        results.append({
                            'marketer_id': marketer_id,
                            'status': 'failed',
                            'reason': 'Marketer not found'
                        })
                    except Exception as e:
                        results.append({
                            'marketer_id': marketer_id,
                            'status': 'failed',
                            'reason': str(e)
                        })
            
            return Response({
                'success': True,
                'message': f'Processed payouts for {len([r for r in results if r["status"] == "paid"])} marketers',
                'total_amount': float(total_amount),
                'payment_method': payment_method,
                'payment_reference': payment_reference,
                'results': results,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error processing payouts: {str(e)}")
            return Response({
                'error': 'Failed to process payouts',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        """Get payout history"""
        try:
            filters = request.query_params
            
            payouts = CommissionTransaction.objects.filter(
                transaction_type=CommissionTransaction.TransactionType.PAYOUT
            ).order_by('-transaction_date')
            
            # Apply filters
            marketer_id = filters.get('marketer_id')
            if marketer_id:
                payouts = payouts.filter(marketer_id=marketer_id)
            
            status_filter = filters.get('status')
            if status_filter:
                payouts = payouts.filter(status=status_filter)
            
            date_from = filters.get('date_from')
            if date_from:
                payouts = payouts.filter(transaction_date__date__gte=date_from)
            
            date_to = filters.get('date_to')
            if date_to:
                payouts = payouts.filter(transaction_date__date__lte=date_to)
            
            # Pagination
            page = int(filters.get('page', 1))
            page_size = int(filters.get('page_size', 20))
            
            total_count = payouts.count()
            total_pages = (total_count + page_size - 1) // page_size
            
            payouts_page = payouts[(page-1)*page_size:page*page_size]
            
            return Response({
                'success': True,
                'payouts': CommissionTransactionSerializer(payouts_page, many=True).data,
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total_count': total_count,
                    'total_pages': total_pages
                },
                'summary': {
                    'total_payouts': total_count,
                    'total_amount': float(payouts.aggregate(total=Sum('amount'))['total'] or 0),
                    'avg_payout': float(payouts.aggregate(avg=Avg('amount'))['avg'] or 0)
                }
            })
            
        except Exception as e:
            logger.error(f"Error getting payout history: {str(e)}")
            return Response({
                'error': 'Failed to get payout history',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MarketerPerformanceView(APIView):
    """Marketer performance analytics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, marketer_id=None):
        """Get marketer performance data"""
        try:
            if marketer_id:
                # Single marketer performance
                return self._get_single_marketer_performance(marketer_id, request.query_params)
            else:
                # All marketers performance
                return self._get_all_marketers_performance(request.query_params)
                
        except Exception as e:
            logger.error(f"Error getting marketer performance: {str(e)}")
            return Response({
                'error': 'Failed to get marketer performance',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_single_marketer_performance(self, marketer_id, params):
        """Get performance data for single marketer"""
        try:
            marketer = ClientProfile.objects.get(
                id=marketer_id,
                is_marketer=True
            )
            
            # Get date range
            start_date_str = params.get('start_date')
            end_date_str = params.get('end_date')
            
            if start_date_str:
                start_date = timezone.datetime.strptime(start_date_str, '%Y-%m-%d').date()
            else:
                start_date = timezone.now().date() - timedelta(days=30)
            
            if end_date_str:
                end_date = timezone.datetime.strptime(end_date_str, '%Y-%m-%d').date()
            else:
                end_date = timezone.now().date()
            
            # Get transactions
            transactions = CommissionTransaction.objects.filter(
                marketer=marketer,
                transaction_date__date__gte=start_date,
                transaction_date__date__lte=end_date
            ).order_by('-transaction_date')
            
            # Get referrals
            referrals = ClientProfile.objects.filter(
                referred_by=marketer,
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            )
            
            # Calculate performance metrics
            total_earned = transactions.filter(
                status__in=['approved', 'paid']
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            
            pending_balance = transactions.filter(
                status='pending'
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            
            # Calculate conversion rate
            total_referrals = referrals.count()
            active_referrals = referrals.filter(status='active').count()
            conversion_rate = (active_referrals / total_referrals * 100) if total_referrals > 0 else 0
            
            # Calculate average commission per referral
            referral_transactions = transactions.filter(
                transaction_type='referral',
                status__in=['approved', 'paid']
            )
            
            avg_commission_per_referral = referral_transactions.aggregate(
                avg=Avg('amount')
            )['avg'] or Decimal('0.00')
            
            # Calculate monthly trends
            monthly_earnings = transactions.filter(
                status__in=['approved', 'paid']
            ).annotate(
                month=TruncMonth('transaction_date')
            ).values('month').annotate(
                earnings=Sum('amount'),
                count=Count('id')
            ).order_by('month')
            
            # Get top performing referrals
            top_referrals = referrals.order_by('-lifetime_value')[:5].values(
                'id', 'user__username', 'user__phone_number',
                'lifetime_value', 'created_at', 'status'
            )
            
            return Response({
                'success': True,
                'timestamp': timezone.now().isoformat(),
                'date_range': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                },
                'marketer': {
                    'id': marketer.id,
                    'username': marketer.username,
                    'phone': marketer.phone_number,
                    'tier': marketer.marketer_tier,
                    'commission_rate': float(marketer.commission_rate),
                    'referral_code': marketer.referral_code,
                    'total_commission_earned': float(marketer.total_commission_earned),
                    'current_balance': float(marketer.commission_balance)
                },
                'performance_metrics': {
                    'total_earned_period': float(total_earned),
                    'pending_balance': float(pending_balance),
                    'total_referrals': total_referrals,
                    'active_referrals': active_referrals,
                    'conversion_rate': round(float(conversion_rate), 1),
                    'avg_commission_per_referral': float(avg_commission_per_referral),
                    'referral_quality_score': self._calculate_referral_quality_score(referrals),
                    'activity_score': self._calculate_activity_score(transactions)
                },
                'monthly_trends': [
                    {
                        'month': item['month'].strftime('%Y-%m'),
                        'earnings': float(item['earnings'] or 0),
                        'transactions': item['count'],
                        'avg_per_transaction': float(item['earnings'] / item['count']) if item['count'] > 0 else 0
                    }
                    for item in monthly_earnings
                ],
                'top_referrals': [
                    {
                        'id': ref['id'],
                        'username': ref['user__username'],
                        'phone': ref['user__phone_number'],
                        'lifetime_value': float(ref['lifetime_value'] or 0),
                        'joined_date': ref['created_at'].isoformat() if ref['created_at'] else None,
                        'status': ref['status']
                    }
                    for ref in top_referrals
                ],
                'transactions_summary': {
                    'total_transactions': transactions.count(),
                    'by_status': transactions.values('status').annotate(
                        count=Count('id'),
                        amount=Sum('amount')
                    ).order_by('status'),
                    'by_type': transactions.values('transaction_type').annotate(
                        count=Count('id'),
                        amount=Sum('amount')
                    ).order_by('-amount')
                }
            })
            
        except ClientProfile.DoesNotExist:
            return Response({
                'error': 'Marketer not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def _get_all_marketers_performance(self, params):
        """Get performance data for all marketers"""
        # Get date range
        start_date_str = params.get('start_date')
        end_date_str = params.get('end_date')
        
        if start_date_str:
            start_date = timezone.datetime.strptime(start_date_str, '%Y-%m-%d').date()
        else:
            start_date = timezone.now().date() - timedelta(days=30)
        
        if end_date_str:
            end_date = timezone.datetime.strptime(end_date_str, '%Y-%m-%d').date()
        else:
            end_date = timezone.now().date()
        
        # Get all marketers
        marketers = ClientProfile.objects.filter(is_marketer=True)
        
        # Get performance data for each marketer
        performance_data = []
        for marketer in marketers:
            # Get transactions for period
            transactions = CommissionTransaction.objects.filter(
                marketer=marketer,
                transaction_date__date__gte=start_date,
                transaction_date__date__lte=end_date,
                status__in=['approved', 'paid']
            )
            
            total_earned = transactions.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            
            # Get referrals for period
            referrals = ClientProfile.objects.filter(
                referred_by=marketer,
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            ).count()
            
            active_referrals = ClientProfile.objects.filter(
                referred_by=marketer,
                created_at__date__gte=start_date,
                created_at__date__lte=end_date,
                status='active'
            ).count()
            
            conversion_rate = (active_referrals / referrals * 100) if referrals > 0 else 0
            
            performance_data.append({
                'marketer_id': marketer.id,
                'username': marketer.username,
                'phone': marketer.phone_number,
                'tier': marketer.marketer_tier,
                'total_earned': float(total_earned),
                'total_referrals': referrals,
                'active_referrals': active_referrals,
                'conversion_rate': round(float(conversion_rate), 1),
                'current_balance': float(marketer.commission_balance),
                'total_commission_earned': float(marketer.total_commission_earned),
                'performance_score': self._calculate_performance_score(
                    float(total_earned),
                    referrals,
                    float(conversion_rate)
                )
            })
        
        # Sort by performance score
        performance_data.sort(key=lambda x: x['performance_score'], reverse=True)
        
        # Calculate summary statistics
        total_marketers = len(performance_data)
        total_earned_all = sum(item['total_earned'] for item in performance_data)
        total_referrals_all = sum(item['total_referrals'] for item in performance_data)
        
        return Response({
            'success': True,
            'timestamp': timezone.now().isoformat(),
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'performance_data': performance_data[:50],  # Limit to top 50
            'summary': {
                'total_marketers': total_marketers,
                'total_earned': float(total_earned_all),
                'total_referrals': total_referrals_all,
                'avg_earned_per_marketer': float(total_earned_all / total_marketers) if total_marketers > 0 else 0,
                'avg_referrals_per_marketer': float(total_referrals_all / total_marketers) if total_marketers > 0 else 0,
                'top_performer': performance_data[0] if performance_data else None,
                'performance_distribution': self._calculate_performance_distribution(performance_data)
            }
        })
    
    def _calculate_referral_quality_score(self, referrals):
        """Calculate referral quality score (0-100)"""
        if not referrals.exists():
            return 0
        
        # Factors: activation rate, lifetime value, activity
        active_count = referrals.filter(status='active').count()
        activation_rate = (active_count / referrals.count()) * 100
        
        avg_ltv = referrals.aggregate(avg=Avg('lifetime_value'))['avg'] or Decimal('0.00')
        
        # Convert to score
        activation_score = min(50, activation_rate * 0.5)
        ltv_score = min(50, float(avg_ltv) / 100)  # KES 100 = 1 point
        
        return round(activation_score + ltv_score, 1)
    
    def _calculate_activity_score(self, transactions):
        """Calculate marketer activity score (0-100)"""
        if not transactions.exists():
            return 0
        
        # Recent activity (last 7 days)
        week_ago = timezone.now() - timedelta(days=7)
        recent_activity = transactions.filter(
            transaction_date__gte=week_ago
        ).count()
        
        # Transaction frequency
        total_transactions = transactions.count()
        days_active = (timezone.now().date() - transactions.first().transaction_date.date()).days + 1
        
        if days_active == 0:
            return 0
        
        avg_daily_transactions = total_transactions / days_active
        
        # Calculate score
        recent_score = min(40, recent_activity * 8)  # Up to 5 transactions per week = 40 points
        frequency_score = min(60, avg_daily_transactions * 30)  # Up to 2 transactions per day = 60 points
        
        return round(recent_score + frequency_score, 1)
    
    def _calculate_performance_score(self, total_earned, referrals, conversion_rate):
        """Calculate overall performance score (0-100)"""
        # Revenue component (0-40)
        revenue_score = min(40, total_earned / 1000)  # KES 1000 = 1 point
        
        # Referral volume component (0-30)
        referral_score = min(30, referrals * 3)  # 1 referral = 3 points
        
        # Conversion quality component (0-30)
        conversion_score = min(30, conversion_rate * 0.3)  # 1% = 0.3 points
        
        return round(revenue_score + referral_score + conversion_score, 1)
    
    def _calculate_performance_distribution(self, performance_data):
        """Calculate performance distribution"""
        scores = [item['performance_score'] for item in performance_data]
        
        if not scores:
            return {}
        
        distribution = {
            'excellent': len([s for s in scores if s >= 80]),
            'good': len([s for s in scores if 60 <= s < 80]),
            'average': len([s for s in scores if 40 <= s < 60]),
            'poor': len([s for s in scores if s < 40])
        }
        
        total = len(scores)
        percentages = {k: round((v / total * 100), 1) for k, v in distribution.items()}
        
        return {
            'counts': distribution,
            'percentages': percentages,
            'avg_score': round(sum(scores) / total, 1),
            'median_score': sorted(scores)[len(scores) // 2] if scores else 0
        }