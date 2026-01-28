"""
Payment Plan and Scholarship ViewSets
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from decimal import Decimal

from .models import PaymentPlan, Installment, Scholarship, ScholarshipApplication, Enrollment
from .serializers import (
    PaymentPlanSerializer, InstallmentSerializer,
    ScholarshipSerializer, ScholarshipApplicationSerializer
)
from .permissions import IsAdminOrStaff


class PaymentPlanViewSet(viewsets.ModelViewSet):
    """ViewSet for payment plan management"""
    queryset = PaymentPlan.objects.all()
    serializer_class = PaymentPlanSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'student':
            return PaymentPlan.objects.filter(enrollment__student=self.request.user)
        elif self.request.user.role in ['admin', 'staff']:
            return PaymentPlan.objects.all()
        return PaymentPlan.objects.none()
    
    @action(detail=False, methods=['post'])
    def create_plan(self, request):
        """Create payment plan for enrollment"""
        enrollment_id = request.data.get('enrollment_id')
        down_payment = Decimal(str(request.data.get('down_payment')))
        num_installments = int(request.data.get('num_installments'))
        
        enrollment = get_object_or_404(Enrollment, id=enrollment_id)
        
        # Check if plan already exists
        if hasattr(enrollment, 'payment_plan'):
            return Response(
                {'error': 'Payment plan already exists for this enrollment'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        total_amount = enrollment.batch.course.fee
        
        # Validate down payment (minimum 30%)
        min_down = total_amount * Decimal('0.30')
        if down_payment < min_down:
            return Response(
                {'error': f'Down payment must be at least 30% (NPR {min_down})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate installments
        if num_installments < 1 or num_installments > 12:
            return Response(
                {'error': 'Number of installments must be between 1 and 12'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create payment plan
        remaining = total_amount - down_payment
        plan = PaymentPlan.objects.create(
            enrollment=enrollment,
            total_amount=total_amount,
            down_payment=down_payment,
            remaining_amount=remaining,
            number_of_installments=num_installments,
            installment_amount=remaining / num_installments,
            start_date=timezone.now().date()
        )
        
        # Generate installments
        plan.calculate_installments()
        
        return Response(PaymentPlanSerializer(plan).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def pay_installment(self, request, pk=None):
        """Mark installment as paid"""
        plan = self.get_object()
        installment_id = request.data.get('installment_id')
        payment_id = request.data.get('payment_id')
        
        installment = get_object_or_404(Installment, id=installment_id, payment_plan=plan)
        
        installment.status = 'paid'
        installment.paid_amount = installment.amount
        installment.paid_date = timezone.now()
        installment.payment_id = payment_id
        installment.save()
        
        # Check if plan is completed
        plan.check_completion()
        
        return Response({'message': 'Installment marked as paid'})


class ScholarshipViewSet(viewsets.ModelViewSet):
    """ViewSet for scholarship management"""
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role in ['admin', 'staff']:
            return Scholarship.objects.all()
        return Scholarship.objects.filter(is_active=True)
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminOrStaff()]
        return [IsAuthenticated()]


class ScholarshipApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet for scholarship applications"""
    queryset = ScholarshipApplication.objects.all()
    serializer_class = ScholarshipApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'student':
            return ScholarshipApplication.objects.filter(student=self.request.user)
        elif self.request.user.role in ['admin', 'staff']:
            return ScholarshipApplication.objects.all()
        return ScholarshipApplication.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve scholarship application"""
        if request.user.role not in ['admin', 'staff']:
            return Response(
                {'error': 'Only admin and staff can approve applications'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        application = self.get_object()
        application.status = 'approved'
        application.reviewed_by = request.user
        application.review_date = timezone.now()
        application.review_notes = request.data.get('review_notes', '')
        application.save()
        
        return Response({'message': 'Application approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject scholarship application"""
        if request.user.role not in ['admin', 'staff']:
            return Response(
                {'error': 'Only admin and staff can reject applications'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        application = self.get_object()
        application.status = 'rejected'
        application.reviewed_by = request.user
        application.review_date = timezone.now()
        application.review_notes = request.data.get('review_notes', '')
        application.save()
        
        return Response({'message': 'Application rejected'})
