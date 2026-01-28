"""
Progress Tracking ViewSets - Assignments, Exams, and Student Progress
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Avg, Count
from decimal import Decimal

from .models import (
    Assignment, AssignmentSubmission, Exam, ExamResult, 
    StudentProgress, Enrollment, Batch, User
)
from .serializers import (
    AssignmentSerializer, AssignmentSubmissionSerializer,
    ExamSerializer, ExamResultSerializer, StudentProgressSerializer
)
from .permissions import IsAdminOrStaff


class AssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for assignment management"""
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Assignment.objects.all()
        batch_id = self.request.query_params.get('batch')
        if batch_id:
            queryset = queryset.filter(batch_id=batch_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit assignment"""
        assignment = self.get_object()
        student = request.user
        
        # Check if already submitted
        if AssignmentSubmission.objects.filter(assignment=assignment, student=student).exists():
            return Response(
                {'error': 'Assignment already submitted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if late
        is_late = timezone.now() > assignment.due_date
        if is_late and not assignment.allow_late_submission:
            return Response(
                {'error': 'Late submissions not allowed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        submission_file = request.FILES.get('submission_file')
        submission_text = request.data.get('submission_text', '')
        
        submission = AssignmentSubmission.objects.create(
            assignment=assignment,
            student=student,
            submission_file=submission_file,
            submission_text=submission_text,
            is_late=is_late,
            status='late' if is_late else 'submitted'
        )
        
        return Response(
            AssignmentSubmissionSerializer(submission).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def grade(self, request, pk=None):
        """Grade assignment submission"""
        if request.user.role not in ['admin', 'staff', 'instructor']:
            return Response(
                {'error': 'Only instructors can grade assignments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        assignment = self.get_object()
        submission_id = request.data.get('submission_id')
        marks = Decimal(str(request.data.get('marks')))
        feedback = request.data.get('feedback', '')
        
        submission = get_object_or_404(AssignmentSubmission, id=submission_id, assignment=assignment)
        
        # Apply late penalty if applicable
        if submission.is_late and assignment.late_penalty_percent > 0:
            penalty = marks * (assignment.late_penalty_percent / 100)
            submission.late_penalty_applied = penalty
            marks = marks - penalty
        
        submission.marks_obtained = marks
        submission.feedback = feedback
        submission.status = 'graded'
        submission.graded_by = request.user
        submission.graded_at = timezone.now()
        submission.save()
        
        # Update student progress
        self._update_student_progress(submission.student, assignment.batch)
        
        return Response({'message': 'Assignment graded successfully'})
    
    @action(detail=True, methods=['get'])
    def submissions(self, request, pk=None):
        """Get all submissions for an assignment"""
        assignment = self.get_object()
        submissions = AssignmentSubmission.objects.filter(assignment=assignment)
        serializer = AssignmentSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)
    
    def _update_student_progress(self, student, batch):
        """Update student progress after grading"""
        try:
            enrollment = Enrollment.objects.get(student=student, batch=batch)
            progress, created = StudentProgress.objects.get_or_create(enrollment=enrollment)
            
            # Calculate assignment average
            submissions = AssignmentSubmission.objects.filter(
                student=student,
                assignment__batch=batch,
                status='graded'
            )
            
            if submissions.exists():
                total_percentage = 0
                for sub in submissions:
                    percentage = (sub.marks_obtained / sub.assignment.max_marks) * 100
                    total_percentage += percentage
                progress.assignment_average = total_percentage / submissions.count()
                progress.assignments_submitted = submissions.count()
            
            progress.assignments_total = Assignment.objects.filter(batch=batch).count()
            progress.save()
            progress.calculate_overall_grade()
            progress.check_at_risk()
            
        except Enrollment.DoesNotExist:
            pass


class ExamViewSet(viewsets.ModelViewSet):
    """ViewSet for exam management"""
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Exam.objects.all()
        batch_id = self.request.query_params.get('batch')
        if batch_id:
            queryset = queryset.filter(batch_id=batch_id)
        return queryset
    
    @action(detail=True, methods=['post'])
    def enter_results(self, request, pk=None):
        """Enter exam results for students"""
        if request.user.role not in ['admin', 'staff', 'instructor']:
            return Response(
                {'error': 'Only instructors can enter results'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        exam = self.get_object()
        results_data = request.data.get('results', [])
        
        created_results = []
        for result in results_data:
            student_id = result.get('student_id')
            marks = Decimal(str(result.get('marks')))
            remarks = result.get('remarks', '')
            
            student = get_object_or_404(User, id=student_id)
            
            # Calculate percentage and grade
            percentage = (marks / exam.max_marks) * 100
            grade = StudentProgress.get_letter_grade(percentage)
            result_status = 'pass' if marks >= exam.passing_marks else 'fail'
            
            exam_result, created = ExamResult.objects.update_or_create(
                exam=exam,
                student=student,
                defaults={
                    'marks_obtained': marks,
                    'percentage': percentage,
                    'grade': grade,
                    'status': result_status,
                    'remarks': remarks,
                    'entered_by': request.user
                }
            )
            created_results.append(exam_result)
            
            # Update student progress
            self._update_student_progress(student, exam.batch)
        
        return Response({
            'message': f'{len(created_results)} results entered successfully',
            'results': ExamResultSerializer(created_results, many=True).data
        })
    
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get all results for an exam"""
        exam = self.get_object()
        results = ExamResult.objects.filter(exam=exam)
        serializer = ExamResultSerializer(results, many=True)
        return Response(serializer.data)
    
    def _update_student_progress(self, student, batch):
        """Update student progress after exam"""
        try:
            enrollment = Enrollment.objects.get(student=student, batch=batch)
            progress, created = StudentProgress.objects.get_or_create(enrollment=enrollment)
            
            # Calculate exam average
            results = ExamResult.objects.filter(
                student=student,
                exam__batch=batch
            )
            
            if results.exists():
                avg_percentage = results.aggregate(Avg('percentage'))['percentage__avg']
                progress.exam_average = avg_percentage
                progress.exams_completed = results.count()
            
            progress.exams_total = Exam.objects.filter(batch=batch).count()
            progress.save()
            progress.calculate_overall_grade()
            progress.check_at_risk()
            
        except Enrollment.DoesNotExist:
            pass


class StudentProgressViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for student progress tracking"""
    queryset = StudentProgress.objects.all()
    serializer_class = StudentProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'student':
            return StudentProgress.objects.filter(enrollment__student=self.request.user)
        elif self.request.user.role in ['admin', 'staff', 'instructor']:
            return StudentProgress.objects.all()
        return StudentProgress.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_progress(self, request):
        """Get current user's progress across all enrollments"""
        progress = StudentProgress.objects.filter(enrollment__student=request.user)
        serializer = self.get_serializer(progress, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def at_risk(self, request):
        """Get list of at-risk students"""
        if request.user.role not in ['admin', 'staff', 'instructor']:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        at_risk_students = StudentProgress.objects.filter(is_at_risk=True)
        serializer = self.get_serializer(at_risk_students, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def batch_analytics(self, request):
        """Get analytics for a batch"""
        batch_id = request.query_params.get('batch_id')
        if not batch_id:
            return Response({'error': 'batch_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        batch = get_object_or_404(Batch, id=batch_id)
        progress_records = StudentProgress.objects.filter(enrollment__batch=batch)
        
        analytics = {
            'batch': {
                'id': batch.id,
                'course': batch.course.name,
                'batch_number': batch.batch_number
            },
            'total_students': progress_records.count(),
            'at_risk_count': progress_records.filter(is_at_risk=True).count(),
            'average_grade': progress_records.aggregate(Avg('overall_percentage'))['overall_percentage__avg'] or 0,
            'grade_distribution': {},
            'top_performers': [],
            'struggling_students': []
        }
        
        # Grade distribution
        for grade in ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']:
            count = progress_records.filter(current_grade=grade).count()
            analytics['grade_distribution'][grade] = count
        
        # Top performers
        top = progress_records.order_by('-overall_percentage')[:5]
        analytics['top_performers'] = self.get_serializer(top, many=True).data
        
        # Struggling students
        struggling = progress_records.filter(overall_percentage__lt=60).order_by('overall_percentage')[:10]
        analytics['struggling_students'] = self.get_serializer(struggling, many=True).data
        
        return Response(analytics)
    
    @action(detail=False, methods=['post'])
    def recalculate(self, request):
        """Recalculate all progress for a batch"""
        if request.user.role not in ['admin', 'staff']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        batch_id = request.data.get('batch_id')
        batch = get_object_or_404(Batch, id=batch_id)
        
        progress_records = StudentProgress.objects.filter(enrollment__batch=batch)
        for progress in progress_records:
            progress.calculate_overall_grade()
            progress.check_at_risk()
        
        return Response({'message': f'Recalculated progress for {progress_records.count()} students'})
