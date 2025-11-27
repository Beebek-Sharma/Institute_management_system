"""
Custom permission classes for role-based access control
Following the Physical Institute Management System requirements
"""

from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Permission to check if user is Admin"""
    message = "Only admins can access this resource."
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsStaff(BasePermission):
    """Permission to check if user is Staff"""
    message = "Only staff can access this resource."
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'staff'


class IsInstructor(BasePermission):
    """Permission to check if user is Instructor"""
    message = "Only instructors can access this resource."
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'instructor'


class IsStudent(BasePermission):
    """Permission to check if user is Student"""
    message = "Only students can access this resource."
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'student'


class IsAdminOrStaff(BasePermission):
    """Permission to check if user is Admin or Staff"""
    message = "Only admins or staff can access this resource."
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'staff']


class IsAdminOrInstructor(BasePermission):
    """Permission to check if user is Admin or Instructor"""
    message = "Only admins or instructors can access this resource."
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'instructor']


class IsStudentOrInstructor(BasePermission):
    """Permission to check if user is Student or Instructor"""
    message = "Only students or instructors can access this resource."
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['student', 'instructor']


# ===================== OBJECT-LEVEL PERMISSIONS =====================

class IsOwnProfile(BasePermission):
    """Permission to access/modify own profile"""
    message = "You can only access your own profile."
    
    def has_object_permission(self, request, view, obj):
        return obj.id == request.user.id


class IsOwnEnrollment(BasePermission):
    """Permission to access own enrollments (for students)"""
    message = "You can only access your own enrollments."
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        if request.user.role == 'student':
            return obj.student.id == request.user.id
        if request.user.role == 'instructor':
            return obj.batch.instructor.id == request.user.id
        return False


class IsOwnPayment(BasePermission):
    """Permission to access own payments"""
    message = "You can only access your own payments."
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        if request.user.role == 'student':
            return obj.enrollment.student.id == request.user.id
        if request.user.role == 'staff':
            return True
        return False


class CanViewUser(BasePermission):
    """Permission to view user details based on role"""
    message = "You don't have permission to view this user."
    
    def has_object_permission(self, request, view, obj):
        # Admin can view anyone
        if request.user.role == 'admin':
            return True
        
        # Staff can view students and instructors
        if request.user.role == 'staff':
            return obj.role in ['student', 'instructor']
        
        # Users can view themselves
        if request.user.id == obj.id:
            return True
        
        # Instructors can view their students
        if request.user.role == 'instructor':
            # Check if this user is enrolled in any of instructor's courses
            from .models import Enrollment
            return Enrollment.objects.filter(
                student=obj,
                batch__instructor=request.user
            ).exists()
        
        return False


class CanDeleteUser(BasePermission):
    """Permission to delete users based on role"""
    message = "You don't have permission to delete this user."
    
    def has_object_permission(self, request, view, obj):
        # Only admin can delete users
        if request.user.role != 'admin':
            return False
        
        # Admin cannot delete themselves
        if request.user.id == obj.id:
            return False
        
        return True


class CanManageCourse(BasePermission):
    """Permission to manage courses"""
    message = "You don't have permission to manage this course."
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        
        # Instructor can update only their own courses
        if request.user.role == 'instructor':
            return obj.instructor.id == request.user.id
        
        if request.user.role == 'staff':
            return True
        
        return False


class CanManageEnrollment(BasePermission):
    """Permission to manage enrollments"""
    message = "You don't have permission to manage this enrollment."
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        
        # Staff can manage enrollments
        if request.user.role == 'staff':
            return True
        
        # Instructors can view enrollments in their batches
        if request.user.role == 'instructor':
            return obj.batch.instructor.id == request.user.id
        
        # Students can only view their own
        if request.user.role == 'student':
            return obj.student.id == request.user.id
        
        return False


class CanMarkAttendance(BasePermission):
    """Permission to mark attendance"""
    message = "You don't have permission to mark attendance."
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        
        # Only instructors of the batch can mark attendance
        if request.user.role == 'instructor':
            return obj.schedule.batch.instructor.id == request.user.id
        
        return False


class CanVerifyPayment(BasePermission):
    """Permission to verify payments (manual payments)"""
    message = "You don't have permission to verify payments."
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        
        if request.user.role == 'staff':
            return True
        
        return False


class CanViewActivityLog(BasePermission):
    """Permission to view activity logs"""
    message = "Only admins can view activity logs."
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


# ===================== PERMISSION HELPER FUNCTIONS =====================

def has_role(user, *roles):
    """Helper function to check if user has any of the specified roles"""
    return user.is_authenticated and user.role in roles


def can_create_user(user, target_role):
    """
    Check if user can create a user with target_role
    
    ADMIN: Can create Admin, Staff, Instructor, Student
    STAFF: Can create Student, Instructor (limited)
    INSTRUCTOR: Cannot create users
    STUDENT: Cannot create users
    """
    if user.role == 'admin':
        return True
    
    if user.role == 'staff':
        return target_role in ['student', 'instructor']
    
    return False


def can_delete_user(user, target_user):
    """
    Check if user can delete target_user
    
    ADMIN: Can delete anyone except themselves
    STAFF: Cannot delete anyone
    INSTRUCTOR: Cannot delete anyone
    STUDENT: Cannot delete anyone
    """
    if user.role != 'admin':
        return False
    
    if user.id == target_user.id:
        return False
    
    return True


def can_view_dashboard(user):
    """Check if user can access dashboard"""
    return user.is_authenticated


def can_access_financial_dashboard(user):
    """Check if user can access financial/payment dashboard"""
    return user.role in ['admin', 'staff']
