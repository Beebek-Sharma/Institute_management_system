"""
API Views with Role-Based Access Control for Physical Institute Management System
"""

from rest_framework import status, generics, permissions, viewsets, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model, authenticate
from django.db.models import Q, Prefetch
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import (
    Course, Enrollment, Payment, CourseCategory, Batch, Schedule,
    Attendance, Notification, ActivityLog, User as CustomUser, Announcement, PasswordReset
)
from .serializers import (
    UserSerializer, UserDetailSerializer, UserRegistrationSerializer, UserCreateByStaffSerializer,
    CourseSerializer, CourseCategorySerializer,
    BatchSerializer, ScheduleSerializer,
    EnrollmentListSerializer, EnrollmentDetailSerializer,
    PaymentSerializer, PaymentVerifySerializer,
    AttendanceSerializer,
    NotificationSerializer,
    ActivityLogSerializer,
    AnnouncementSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)
from .permissions import (
    IsAdmin, IsStaff, IsInstructor, IsStudent, IsAdminOrStaff,
    IsOwnProfile, IsOwnEnrollment, IsOwnPayment, CanViewUser,
    CanDeleteUser, CanManageCourse, CanManageEnrollment,
    CanMarkAttendance, CanVerifyPayment, CanViewActivityLog,
    can_create_user, can_delete_user
)

User = get_user_model()


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


# ===================== AUTHENTICATION VIEWS =====================

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new student account"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        
        # Log activity
        ActivityLog.objects.create(
            user=user,
            action='login',
            description=f'User {user.username} registered',
            target_user=user,
            ip_address=get_client_ip(request)
        )
        
        return Response({
            'message': 'Registration successful',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login with email and password (Coursera-style)"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Find user by email only
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Verify password
    if not user.check_password(password):
        # Log failed attempt
        ActivityLog.objects.create(
            action='login',
            description=f'Failed login attempt for {email}',
            ip_address=get_client_ip(request)
        )
        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Check if user is active
    if not user.is_active:
        return Response(
            {'error': 'User account is inactive'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    refresh = RefreshToken.for_user(user)
    
    # Log successful login
    ActivityLog.objects.create(
        user=user,
        action='login',
        description=f'User {user.email} logged in',
        target_user=user,
        ip_address=get_client_ip(request),
        device_info=request.META.get('HTTP_USER_AGENT', '')
    )
    
    return Response({
        'message': 'Login successful',
        'user': UserDetailSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def unified_login(request):
    """Unified authentication endpoint - handles both login and auto-registration"""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    # Validation
    if not password:
        return Response(
            {'error': 'Password is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not username and not email:
        return Response(
            {'error': 'Username or email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Use email as username if username not provided
    if not username:
        username = email.split('@')[0]
    
    # Use username as email if email not provided (with temp domain)
    if not email:
        email = f"{username}@temp.local"
    
    # Try to find existing user by username or email
    user = User.objects.filter(Q(username=username) | Q(email=email)).first()
    
    if user:
        # User exists - attempt login
        if not user.check_password(password):
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {'error': 'Account is disabled'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        action = 'login'
    else:
        # User doesn't exist - auto-register
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role='student'  # Default role for auto-registered users
            )
            action = 'registered'
            
            # Log registration activity
            ActivityLog.objects.create(
                user=user,
                action='user_create',
                description=f'User {user.username} auto-registered via unified auth',
                ip_address=get_client_ip(request),
                device_info=request.META.get('HTTP_USER_AGENT', '')
            )
        except Exception as e:
            return Response(
                {'error': f'Registration failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    
    # Log login activity
    ActivityLog.objects.create(
        user=user,
        action='login',
        description=f'User {user.username} logged in via unified auth',
        ip_address=get_client_ip(request),
        device_info=request.META.get('HTTP_USER_AGENT', '')
    )
    
    return Response({
        'action': action,  # 'login' or 'registered'
        'message': 'Login successful' if action == 'login' else 'Registration successful',
        'user': UserDetailSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout user"""
    ActivityLog.objects.create(
        user=request.user,
        action='logout',
        description=f'User {request.user.username} logged out',
        ip_address=get_client_ip(request)
    )
    return Response({'message': 'Logout successful'})


# ===================== COURSERA-STYLE EMAIL VERIFICATION ENDPOINTS =====================

@api_view(['POST'])
@permission_classes([AllowAny])
def check_email(request):
    """Check if email exists in the system"""
    from .serializers import EmailCheckSerializer
    
    serializer = EmailCheckSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    user = User.objects.filter(email=email).first()
    
    if user:
        return Response({
            'exists': True,
            'user_id': user.id
        })
    else:
        return Response({
            'exists': False
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def send_verification_code(request):
    """Send verification code to email for new user signup"""
    import random
    from datetime import timedelta
    from .serializers import SendVerificationCodeSerializer
    from .models import EmailVerification
    
    serializer = SendVerificationCodeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    
    # Check if email already exists
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already registered'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Generate 6-digit code
    code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    
    # Set expiry to 10 minutes from now
    expires_at = timezone.now() + timedelta(minutes=10)
    
    # Create verification record
    EmailVerification.objects.create(
        email=email,
        code=code,
        expires_at=expires_at
    )
    
    # Send email (using console backend for development)
    from django.core.mail import send_mail
    from django.conf import settings
    
    try:
        send_mail(
            'Email Verification Code - Institute Management System',
            f'Your verification code is: {code}\n\nThis code will expire in 10 minutes.',
            settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@institute.com',
            [email],
            fail_silently=False,
        )
    except Exception as e:
        # Log the error but don't fail the request
        print(f"Email sending failed: {e}")
        print(f"Verification code for {email}: {code}")
    
    return Response({
        'message': 'Verification code sent to your email',
        'expires_in': 600  # 10 minutes in seconds
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_code(request):
    """Verify the email verification code"""
    import secrets
    from .serializers import VerifyCodeSerializer
    from .models import EmailVerification
    
    serializer = VerifyCodeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    code = serializer.validated_data['code']
    
    # Find the most recent unused verification code for this email
    verification = EmailVerification.objects.filter(
        email=email,
        code=code,
        is_used=False
    ).order_by('-created_at').first()
    
    if not verification:
        return Response(
            {'error': 'Invalid verification code'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if verification.is_expired:
        return Response(
            {'error': 'Verification code has expired. Please request a new one.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Mark as used
    verification.is_used = True
    verification.save()
    
    # Generate a temporary token for completing signup
    temp_token = secrets.token_urlsafe(32)
    
    return Response({
        'valid': True,
        'token': temp_token,
        'message': 'Email verified successfully'
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def complete_signup(request):
    """Complete user signup after email verification"""
    from .serializers import CompleteSignupSerializer
    
    serializer = CompleteSignupSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    full_name = serializer.validated_data['full_name']
    password = serializer.validated_data['password']
    
    # Split full name into first and last name
    name_parts = full_name.strip().split(' ', 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ''
    
    # Generate username from email
    username = email.split('@')[0]
    
    # Ensure username is unique
    base_username = username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    
    try:
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role='student'
        )
        
        # Log activity
        ActivityLog.objects.create(
            user=user,
            action='user_create',
            description=f'User {user.username} registered via Coursera-style auth',
            target_user=user,
            ip_address=get_client_ip(request),
            device_info=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Account created successfully',
            'user': UserDetailSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to create account: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """Request password reset - sends email with reset link"""
    import secrets
    from django.core.mail import send_mail
    from django.conf import settings
    from django.utils import timezone
    from datetime import timedelta
    
    serializer = PasswordResetRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    
    try:
        user = User.objects.get(email=email)
        
        # Generate secure reset token
        token = secrets.token_urlsafe(32)
        expiry_hours = getattr(settings, 'PASSWORD_RESET_TOKEN_EXPIRY_HOURS', 24)
        expires_at = timezone.now() + timedelta(hours=expiry_hours)
        
        # Create password reset record
        PasswordReset.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
        
        # Send email
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3001')
        reset_link = f"{frontend_url}/reset-password?token={token}"
        
        email_subject = 'Password Reset Request - Institute Management System'
        email_message = f"""
        Hello {user.get_full_name() or user.username},

        You requested to reset your password. Click the link below to proceed:

        {reset_link}

        This link will expire in {expiry_hours} hours.

        If you did not request this, please ignore this email.

        Best regards,
        Institute Management System
        """
        
        send_mail(
            email_subject,
            email_message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        # Log activity
        ActivityLog.objects.create(
            user=user,
            action='password_reset',
            description=f'Password reset requested for {user.username}',
            target_user=user,
            ip_address=get_client_ip(request)
        )
        
        return Response({
            'message': 'Password reset link sent to your email. Please check your inbox.'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        # Don't reveal if email exists for security
        return Response({
            'message': 'If an account exists with this email, you will receive a password reset link.'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': f'Failed to send password reset email: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    """Confirm password reset with token"""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    token = serializer.validated_data['token']
    new_password = serializer.validated_data['password']
    
    try:
        password_reset = PasswordReset.objects.get(token=token)
        
        # Validate token
        if not password_reset.is_valid:
            if password_reset.is_used:
                return Response({
                    'error': 'This password reset link has already been used.'
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    'error': 'This password reset link has expired. Please request a new one.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update password
        user = password_reset.user
        user.set_password(new_password)
        user.save()
        
        # Mark token as used
        password_reset.is_used = True
        password_reset.save()
        
        # Log activity
        ActivityLog.objects.create(
            user=user,
            action='password_reset',
            description=f'Password reset completed for {user.username}',
            target_user=user,
            ip_address=get_client_ip(request)
        )
        
        return Response({
            'message': 'Password has been reset successfully. You can now login with your new password.'
        }, status=status.HTTP_200_OK)
        
    except PasswordReset.DoesNotExist:
        return Response({
            'error': 'Invalid or expired password reset token.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': f'Failed to reset password: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """Get current user profile"""
    serializer = UserDetailSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update current user profile"""
    serializer = UserDetailSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        user = serializer.save()
        
        # Log activity
        ActivityLog.objects.create(
            user=request.user,
            action='user_update',
            description=f'User {request.user.username} updated their profile',
            target_user=user,
            ip_address=get_client_ip(request)
        )
        
        return Response({'message': 'Profile updated', 'user': serializer.data})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])  # Change to IsAdmin if you want to restrict it
def create_admin(request):
    """Create a new admin user via POST request"""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    # Validation
    if not all([username, email, password]):
        return Response(
            {'error': 'username, email, and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user already exists
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Create admin user
        admin_user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Set role to admin
        admin_user.role = 'admin'
        admin_user.save()
        
        # Log activity
        ActivityLog.objects.create(
            user=admin_user,
            action='admin_created',
            description=f'Admin user {username} created',
            target_user=admin_user,
            ip_address=get_client_ip(request)
        )
        
        return Response({
            'message': 'Admin user created successfully',
            'user': UserSerializer(admin_user).data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


# ===================== ADMIN MANAGEMENT ENDPOINTS =====================

@api_view(['POST'])
@permission_classes([IsAdmin])
def create_staff(request):
    """Admin: Create a staff account"""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    if not all([username, email, password]):
        return Response(
            {'error': 'username, email, and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        staff_user = User.objects.create_user(
            username=username, email=email, password=password,
            first_name=first_name, last_name=last_name, role='staff'
        )
        ActivityLog.objects.create(
            user=request.user, action='staff_created',
            description=f'Admin {request.user.username} created staff {username}',
            target_user=staff_user, ip_address=get_client_ip(request)
        )
        return Response({'message': 'Staff created', 'user': UserSerializer(staff_user).data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdminOrStaff])
def create_instructor(request):
    """Admin/Staff: Create an instructor account"""
    # Check if user has permission to create instructor
    if not can_create_user(request.user, 'instructor'):
        return Response(
            {'error': 'You do not have permission to create instructors'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    phone = request.data.get('phone', '')
    
    if not all([username, email, password]):
        return Response({'error': 'username, email, and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        instructor_user = User.objects.create_user(
            username=username, email=email, password=password,
            first_name=first_name, last_name=last_name, role='instructor', phone=phone
        )
        ActivityLog.objects.create(
            user=request.user, action='instructor_created',
            description=f'{request.user.role} {request.user.username} created instructor {username}',
            target_user=instructor_user, ip_address=get_client_ip(request)
        )
        return Response({'message': 'Instructor created', 'user': UserSerializer(instructor_user).data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdminOrStaff])
def create_student(request):
    """Admin/Staff: Create a student account"""
    # Check if user has permission to create student
    if not can_create_user(request.user, 'student'):
        return Response(
            {'error': 'You do not have permission to create students'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    if not all([username, email, password]):
        return Response({'error': 'username, email, and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        student_user = User.objects.create_user(
            username=username, email=email, password=password,
            first_name=first_name, last_name=last_name, role='student'
        )
        ActivityLog.objects.create(
            user=request.user, action='student_created',
            description=f'{request.user.role} {request.user.username} created student {username}',
            target_user=student_user, ip_address=get_client_ip(request)
        )
        return Response({'message': 'Student created', 'user': UserSerializer(student_user).data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdmin])
def reset_user_password(request, user_id):
    """Admin: Reset any user's password"""
    try:
        user = User.objects.get(id=user_id)
        new_password = request.data.get('password')
        
        if not new_password:
            return Response({'error': 'New password is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        
        ActivityLog.objects.create(
            user=request.user, action='password_reset',
            description=f'Admin {request.user.username} reset password for {user.username}',
            target_user=user, ip_address=get_client_ip(request)
        )
        
        return Response({'message': f'Password reset for {user.username}'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdmin])
def delete_user_admin(request, user_id):
    """Admin: Delete any user account"""
    try:
        user = User.objects.get(id=user_id)
        username = user.username
        
        ActivityLog.objects.create(
            user=request.user, action='user_deleted',
            description=f'Admin {request.user.username} deleted user {username}',
            target_user=user, ip_address=get_client_ip(request)
        )
        
        user.delete()
        return Response({'message': f'User {username} deleted successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminOrStaff])
def get_all_users(request):
    """Admin/Staff: View all users with filters"""
    role = request.query_params.get('role')
    search = request.query_params.get('search')
    
    users = User.objects.all()
    
    if role:
        users = users.filter(role=role)
    if search:
        users = users.filter(
            Q(username__icontains=search) | Q(email__icontains=search) |
            Q(first_name__icontains=search) | Q(last_name__icontains=search)
        )
    
    serializer = UserDetailSerializer(users, many=True)
    return Response({'count': users.count(), 'users': serializer.data})


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdmin])
def edit_user_admin(request, user_id):
    """Admin: Edit any user's information"""
    try:
        user = User.objects.get(id=user_id)
        serializer = UserDetailSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            updated_user = serializer.save()
            ActivityLog.objects.create(
                user=request.user, action='user_updated',
                description=f'Admin {request.user.username} updated user {user.username}',
                target_user=updated_user, ip_address=get_client_ip(request)
            )
            return Response({'message': 'User updated', 'user': serializer.data})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


# ===================== USER MANAGEMENT VIEWS (Admin/Staff) =====================

class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for user management"""
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'username']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserCreateByStaffSerializer
        return UserDetailSerializer
    
    def get_queryset(self):
        """Filter users based on requester's role"""
        if self.request.user.role == 'admin':
            return User.objects.all()
        elif self.request.user.role == 'staff':
            # Staff can only view students and instructors
            return User.objects.filter(role__in=['student', 'instructor'])
        return User.objects.none()
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated(), IsAdminOrStaff()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminOrStaff()]
        elif self.action == 'list':
            return [IsAuthenticated(), IsAdminOrStaff()]
        elif self.action == 'retrieve':
            return [IsAuthenticated()]
        return [IsAuthenticated()]
    
    def create(self, request, *args, **kwargs):
        """Create a new user (by admin/staff)"""
        if not can_create_user(request.user, request.data.get('role')):
            return Response(
                {'error': 'You do not have permission to create users with this role'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            ActivityLog.objects.create(
                user=request.user,
                action='user_create',
                description=f'{request.user.username} created {user.role} account for {user.username}',
                target_user=user,
                ip_address=get_client_ip(request)
            )
            
            return Response(
                {'message': f'{user.get_role_display()} created successfully', 'user': UserDetailSerializer(user).data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a user (admin only)"""
        instance = self.get_object()
        
        if not can_delete_user(request.user, instance):
            return Response(
                {'error': 'You do not have permission to delete this user'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        ActivityLog.objects.create(
            user=request.user,
            action='user_delete',
            description=f'{request.user.username} deleted {instance.role} account for {instance.username}',
            target_user=instance,
            ip_address=get_client_ip(request)
        )
        
        instance.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


# ===================== COURSE MANAGEMENT VIEWS =====================

class CourseCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for course categories"""
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [AllowAny()]


class CourseViewSet(viewsets.ModelViewSet):
    """ViewSet for courses"""
    serializer_class = CourseSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['created_at', 'fee']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return all courses for admin/staff, only active for others"""
        user = self.request.user
        
        # Admin and staff can see all courses (including inactive)
        if user.is_authenticated and user.role in ['admin', 'staff']:
            return Course.objects.all().prefetch_related('batches')
        
        # Others see only active courses
        return Course.objects.filter(is_active=True).prefetch_related('batches')
    
    def get_permissions(self):
        """Allow anyone to read courses, but only admin can write"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [AllowAny()]
    
    def create(self, request, *args, **kwargs):
        """Create a new course (admin only)"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Ensure is_active is True by default if not provided
            course = serializer.save(is_active=request.data.get('is_active', True))
            
            ActivityLog.objects.create(
                user=request.user,
                action='course_create',
                description=f'{request.user.username} created course {course.code}',
                ip_address=get_client_ip(request)
            )
            
            return Response(
                {'message': 'Course created successfully', 'course': serializer.data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """Update a course (admin only)"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            course = serializer.save()
            
            ActivityLog.objects.create(
                user=request.user,
                action='course_update',
                description=f'{request.user.username} updated course {course.code}',
                ip_address=get_client_ip(request)
            )
            
            return Response({'message': 'Course updated', 'course': serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def my_courses(self, request):
        """Get courses assigned to the current instructor"""
        if request.user.role != 'instructor':
            return Response(
                {'error': 'Only instructors can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        courses = Course.objects.filter(
            instructor=request.user,
            is_active=True
        ).prefetch_related('batches')
        
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)



# ===================== BATCH & SCHEDULE VIEWS =====================

class BatchViewSet(viewsets.ModelViewSet):
    """ViewSet for course batches"""
    queryset = Batch.objects.filter(is_active=True).prefetch_related('schedules', 'enrollments')
    serializer_class = BatchSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['course']
    search_fields = ['course__name', 'batch_number']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminOrStaff()]
        return [AllowAny()]
    
    @action(detail=True, methods=['get'])
    def enrollments(self, request, pk=None):
        """Get enrollments for a batch"""
        batch = self.get_object()
        enrollments = batch.enrollments.all()
        serializer = EnrollmentListSerializer(enrollments, many=True)
        return Response(serializer.data)


class ScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for class schedules"""
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['batch__course__name', 'room_number']
    
    def get_queryset(self):
        """Filter schedules - instructors see only their batch schedules"""
        user = self.request.user
        queryset = Schedule.objects.all()
        
        # If instructor parameter is passed, filter for instructor's schedules
        instructor_param = self.request.query_params.get('instructor')
        if instructor_param == 'true' and user.role == 'instructor':
            print(f"DEBUG: Filtering schedules for instructor {user.username} (ID: {user.id})")
            queryset = queryset.filter(batch__instructor=user)
            print(f"DEBUG: Found {queryset.count()} schedules")
        elif instructor_param == 'true':
            print(f"DEBUG: User {user.username} requested instructor schedules but has role {user.role}")
        
        return queryset
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminOrStaff()]
        return [IsAuthenticated()]
        return [AllowAny()]


# ===================== ENROLLMENT VIEWS =====================

class EnrollmentViewSet(viewsets.ModelViewSet):
    """ViewSet for student enrollments"""
    serializer_class = EnrollmentListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['student__username', 'batch__course__name']
    ordering_fields = ['enrollment_date', 'status']
    ordering = ['-enrollment_date']
    
    def get_queryset(self):
        """Filter enrollments based on user role"""
        user = self.request.user
        
        if user.role == 'admin':
            return Enrollment.objects.select_related('student', 'batch')
        elif user.role == 'staff':
            return Enrollment.objects.select_related('student', 'batch')
        elif user.role == 'instructor':
            # Instructors see only their batch enrollments
            return Enrollment.objects.filter(batch__instructor=user).select_related('student', 'batch')
        elif user.role == 'student':
            # Students see only their own enrollments
            return Enrollment.objects.filter(student=user).select_related('student', 'batch')
        
        return Enrollment.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EnrollmentDetailSerializer
        return EnrollmentListSerializer
    
    def get_permissions(self):
        if self.action in ['create']:
            return [IsAuthenticated()]  # Allow students to create their own enrollments
        elif self.action in ['destroy']:
            return [IsAuthenticated(), IsAdminOrStaff()]
        elif self.action in ['update', 'partial_update']:
            return [IsAuthenticated(), IsAdminOrStaff()]
        return [IsAuthenticated()]
    
    def create(self, request, *args, **kwargs):
        """Enroll a student in a batch"""
        batch_id = request.data.get('batch')
        student_id = request.data.get('student')
        
        # If no student specified, use the authenticated user (students can only enroll themselves)
        if not student_id:
            if request.user.role != 'student':
                return Response(
                    {'error': 'Must specify student ID'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            student_id = request.user.id
        
        # Allow students to enroll themselves, admin/staff can enroll others
        if request.user.role == 'student':
            if int(student_id) != request.user.id:
                return Response(
                    {'error': 'Students can only enroll themselves'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif request.user.role not in ['admin', 'staff']:
            return Response(
                {'error': 'Only admin, staff, or students can create enrollments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        batch = get_object_or_404(Batch, id=batch_id)
        student = get_object_or_404(User, id=student_id, role='student')
        
        # Check if batch is full
        if batch.enrolled_count >= batch.capacity:
            return Response(
                {'error': 'Batch is full'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if student already enrolled
        if Enrollment.objects.filter(student=student, batch=batch).exists():
            return Response(
                {'error': 'Student is already enrolled in this batch'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrollment = Enrollment.objects.create(
            student=student,
            batch=batch,
            course=batch.course,
            status='active'
        )
        
        # Update batch enrollment count
        batch.enrolled_count += 1
        batch.save()
        
        # Update course enrollment count
        batch.course.enrolled_count = Enrollment.objects.filter(course=batch.course).count()
        batch.course.save()
        
        # Create notification
        Notification.objects.create(
            user=student,
            notification_type='enrollment',
            channel='in_app',
            title=f'Enrollment Confirmation',
            message=f'You have been enrolled in {batch.course.name} - Batch {batch.batch_number}',
            related_enrollment=enrollment
        )
        
        # Log activity
        ActivityLog.objects.create(
            user=request.user,
            action='enrollment_create',
            description=f'{request.user.username} enrolled {student.username} in {batch}',
            target_user=student,
            ip_address=get_client_ip(request)
        )
        
        return Response(
            {'message': 'Student enrolled successfully', 'enrollment': EnrollmentDetailSerializer(enrollment).data},
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['get'])
    def my_students(self, request):
        """Get all students enrolled in instructor's courses"""
        if request.user.role != 'instructor':
            return Response(
                {'error': 'Only instructors can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get all enrollments for batches where user is instructor
        enrollments = Enrollment.objects.filter(
            batch__instructor=request.user
        ).select_related('student', 'batch').order_by('-enrollment_date')
        
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)


# ===================== PAYMENT VIEWS =====================

class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for payments"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['enrollment__student__username', 'transaction_id']
    ordering_fields = ['payment_date', 'status']
    ordering = ['-payment_date']
    
    def get_queryset(self):
        """Filter payments based on user role"""
        user = self.request.user
        
        if user.role == 'admin':
            return Payment.objects.select_related('enrollment', 'verified_by')
        elif user.role == 'staff':
            return Payment.objects.select_related('enrollment', 'verified_by')
        elif user.role == 'student':
            # Students see only their payments
            return Payment.objects.filter(enrollment__student=user).select_related('enrollment', 'verified_by')
        
        return Payment.objects.none()
    
    def get_permissions(self):
        if self.action in ['create', 'partial_update', 'verify_payment']:
            return [IsAuthenticated(), IsAdminOrStaff()]
        return [IsAuthenticated()]
    
    @action(detail=True, methods=['post'])
    def verify_payment(self, request, pk=None):
        """Verify a manual payment (staff/admin only)"""
        payment = self.get_object()
        serializer = PaymentVerifySerializer(data=request.data)
        
        if serializer.is_valid():
            payment.status = serializer.validated_data.get('status', payment.status)
            payment.receipt_number = serializer.validated_data.get('receipt_number', payment.receipt_number)
            payment.notes = serializer.validated_data.get('notes', payment.notes)
            payment.verified_by = request.user
            payment.verified_date = timezone.now()
            payment.save()
            
            # Create notification for student
            Notification.objects.create(
                user=payment.enrollment.student,
                notification_type='payment_confirmation',
                channel='in_app',
                title='Payment Verified',
                message=f'Your payment of NPR {payment.amount} for {payment.enrollment.batch.course.name} has been verified',
                related_enrollment=payment.enrollment
            )
            
            ActivityLog.objects.create(
                user=request.user,
                action='payment_verify',
                description=f'{request.user.username} verified payment {payment.id}',
                ip_address=get_client_ip(request)
            )
            
            return Response(
                {'message': 'Payment verified', 'payment': PaymentSerializer(payment).data}
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ===================== ATTENDANCE VIEWS =====================

class AttendanceViewSet(viewsets.ModelViewSet):
    """ViewSet for attendance records"""
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['enrollment__student__username']
    ordering_fields = ['marked_date', 'status']
    ordering = ['-marked_date']
    
    def get_queryset(self):
        """Filter attendance based on user role"""
        user = self.request.user
        
        if user.role == 'admin':
            return Attendance.objects.select_related('enrollment', 'marked_by')
        elif user.role == 'instructor':
            # Instructors see attendance for their batches
            return Attendance.objects.filter(
                schedule__batch__instructor=user
            ).select_related('enrollment', 'marked_by')
        elif user.role == 'student':
            # Students see their own attendance
            return Attendance.objects.filter(enrollment__student=user).select_related('enrollment', 'marked_by')
        
        return Attendance.objects.none()
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsInstructor()]
        return [IsAuthenticated()]
    
    def create(self, request, *args, **kwargs):
        """Mark attendance (instructor only)"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            attendance = serializer.save(marked_by=request.user)
            
            ActivityLog.objects.create(
                user=request.user,
                action='attendance_mark',
                description=f'{request.user.username} marked attendance for {attendance.enrollment.student.username}',
                ip_address=get_client_ip(request)
            )
            
            return Response(
                {'message': 'Attendance marked', 'attendance': serializer.data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ===================== NOTIFICATION VIEWS =====================

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for notifications (read-only for users)"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'is_read']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Users see only their own notifications"""
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a notification as read"""
        notification = self.get_object()
        if notification.user != request.user:
            return Response(
                {'error': 'You can only mark your own notifications as read'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        return Response({'message': 'Notification marked as read'})


# ===================== ACTIVITY LOG VIEWS (Admin Only) =====================

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for activity logs (admin only)"""
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated, CanViewActivityLog]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__username', 'action']
    ordering_fields = ['created_at', 'action']
    ordering = ['-created_at']


# ===================== ANNOUNCEMENT VIEWS =====================

class AnnouncementViewSet(viewsets.ModelViewSet):
    """ViewSet for announcements (admin can create/edit, all can view)"""
    queryset = Announcement.objects.filter(is_published=True)
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter based on user role and target audience"""
        queryset = Announcement.objects.filter(is_published=True)
        
        # Admins can see all announcements
        if self.request.user.role == 'admin':
            return Announcement.objects.all()
        
        # Filter by target audience
        user_role = self.request.user.role
        queryset = queryset.filter(
            Q(target_audience='all') |
            Q(target_audience='students', user__role='student') |
            Q(target_audience='instructors', user__role='instructor') |
            Q(target_audience='staff', user__role='staff')
        )
        return queryset
    
    def get_permissions(self):
        """Different permissions for different actions"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        """Set the created_by field to the current user"""
        serializer.save(created_by=self.request.user)


# ===================== HELPER FUNCTIONS =====================

def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
