"""
Bulk operations utilities for CSV import/export and batch processing
"""
import csv
import io
from django.db import transaction
from django.contrib.auth import get_user_model
from .models import Course, Batch, Enrollment, Notification, ActivityLog
from django.utils import timezone

User = get_user_model()


class BulkStudentImporter:
    """Handle bulk student import from CSV"""
    
    REQUIRED_FIELDS = ['username', 'email', 'first_name', 'last_name']
    OPTIONAL_FIELDS = ['phone', 'date_of_birth', 'address', 'citizenship_number']
    
    def __init__(self, csv_file, created_by):
        self.csv_file = csv_file
        self.created_by = created_by
        self.errors = []
        self.warnings = []
        self.success_count = 0
        self.rows = []
        
    def validate_row(self, row, line_number):
        """Validate a single CSV row"""
        errors = []
        
        # Check required fields
        for field in self.REQUIRED_FIELDS:
            if not row.get(field) or not row.get(field).strip():
                errors.append(f"Line {line_number}: Missing required field '{field}'")
        
        # Check if username already exists
        username = row.get('username', '').strip()
        if username and User.objects.filter(username=username).exists():
            errors.append(f"Line {line_number}: Username '{username}' already exists")
        
        # Validate email format
        email = row.get('email', '').strip()
        if email and '@' not in email:
            errors.append(f"Line {line_number}: Invalid email format '{email}'")
        
        # Check if email already exists
        if email and User.objects.filter(email=email).exists():
            errors.append(f"Line {line_number}: Email '{email}' already exists")
        
        return errors
    
    def parse_csv(self):
        """Parse CSV file and validate all rows"""
        try:
            # Read CSV file
            csv_data = self.csv_file.read().decode('utf-8')
            csv_reader = csv.DictReader(io.StringIO(csv_data))
            
            line_number = 1  # Header is line 0
            for row in csv_reader:
                line_number += 1
                
                # Validate row
                row_errors = self.validate_row(row, line_number)
                if row_errors:
                    self.errors.extend(row_errors)
                else:
                    self.rows.append(row)
            
            return len(self.errors) == 0
            
        except Exception as e:
            self.errors.append(f"CSV parsing error: {str(e)}")
            return False
    
    def create_students(self):
        """Create student users from validated rows"""
        created_students = []
        
        try:
            with transaction.atomic():
                for row in self.rows:
                    # Create user
                    user = User.objects.create_user(
                        username=row['username'].strip(),
                        email=row['email'].strip(),
                        first_name=row['first_name'].strip(),
                        last_name=row['last_name'].strip(),
                        role='student',
                        is_active=True
                    )
                    
                    # Set optional fields
                    if row.get('phone'):
                        user.phone = row['phone'].strip()
                    if row.get('date_of_birth'):
                        user.date_of_birth = row['date_of_birth'].strip()
                    if row.get('address'):
                        user.address = row['address'].strip()
                    if row.get('citizenship_number'):
                        user.citizenship_number = row['citizenship_number'].strip()
                    
                    # Set default password (username)
                    user.set_password(row['username'].strip())
                    user.save()
                    
                    created_students.append(user)
                    self.success_count += 1
                
                # Log activity
                ActivityLog.objects.create(
                    user=self.created_by,
                    action='bulk_import',
                    description=f'Bulk imported {self.success_count} students via CSV',
                    ip_address='system'
                )
                
        except Exception as e:
            self.errors.append(f"Database error: {str(e)}")
            return []
        
        return created_students
    
    def process(self):
        """Process CSV file - validate and create students"""
        from .models import ImportHistory
        
        # Create import history record
        history = ImportHistory.objects.create(
            import_type='student',
            imported_by=self.created_by,
            file_name=self.csv_file.name,
            status='processing'
        )
        
        try:
            # Parse and validate
            if not self.parse_csv():
                history.status = 'failed'
                history.total_rows = len(self.rows) + len(self.errors)
                history.error_count = len(self.errors)
                history.import_results = {
                    'success': False,
                    'errors': self.errors,
                    'warnings': self.warnings
                }
                history.save()
                
                return {
                    'success': False,
                    'success_count': 0,
                    'error_count': len(self.errors),
                    'errors': self.errors,
                    'warnings': self.warnings
                }
            
            # Create students
            created_students = self.create_students()
            
            # Update history
            history.status = 'completed' if len(self.errors) == 0 else 'failed'
            history.total_rows = len(self.rows)
            history.success_count = self.success_count
            history.error_count = len(self.errors)
            history.warning_count = len(self.warnings)
            history.import_results = {
                'success': len(self.errors) == 0,
                'created_students': [
                    {'id': s.id, 'username': s.username, 'email': s.email, 'name': s.get_full_name()}
                    for s in created_students
                ],
                'errors': self.errors,
                'warnings': self.warnings
            }
            history.save()
            
            return {
                'success': len(self.errors) == 0,
                'success_count': self.success_count,
                'error_count': len(self.errors),
                'errors': self.errors,
                'warnings': self.warnings,
                'created_students': [
                    {
                        'id': s.id,
                        'username': s.username,
                        'email': s.email,
                        'name': s.get_full_name()
                    }
                    for s in created_students
                ],
                'history_id': history.id
            }
            
        except Exception as e:
            history.status = 'failed'
            history.import_results = {'error': str(e)}
            history.save()
            raise


class BulkEnrollmentProcessor:
    """Handle bulk enrollment operations"""
    
    def __init__(self, batch, student_ids, created_by):
        self.batch = batch
        self.student_ids = student_ids
        self.created_by = created_by
        self.results = {
            'success': [],
            'errors': [],
            'warnings': []
        }
    
    def validate_student_enrollment(self, student):
        """Validate if student can be enrolled in batch"""
        from .models import Schedule
        
        errors = []
        warnings = []
        
        # Check if batch is active
        if not self.batch.is_active:
            errors.append('Batch is not active')
            return errors, warnings
        
        # Check capacity
        if self.batch.enrolled_count >= self.batch.capacity:
            errors.append('Batch is full')
            return errors, warnings
        
        # Check if already enrolled
        if Enrollment.objects.filter(student=student, batch=self.batch).exists():
            errors.append('Already enrolled in this batch')
            return errors, warnings
        
        # Check if enrolled in another batch of same course
        existing = Enrollment.objects.filter(
            student=student,
            batch__course=self.batch.course,
            status__in=['active', 'pending']
        ).first()
        if existing:
            errors.append(f'Already enrolled in {self.batch.course.name} (Batch {existing.batch.batch_number})')
            return errors, warnings
        
        # Check prerequisites
        course = self.batch.course
        if course.prerequisite_enforcement == 'strict':
            met, missing = course.check_prerequisites_met(student)
            if not met:
                missing_names = [f"{p.code}" for p in missing]
                errors.append(f'Prerequisites not met: {", ".join(missing_names)}')
        elif course.prerequisite_enforcement == 'soft':
            met, missing = course.check_prerequisites_met(student)
            if not met:
                missing_names = [f"{p.code}" for p in missing]
                warnings.append(f'Prerequisites not met: {", ".join(missing_names)}')
        
        # Check schedule conflicts
        if course.schedule_conflict_checking == 'strict':
            has_conflicts, conflicts = Schedule.check_schedule_conflicts(student, self.batch)
            if has_conflicts:
                conflict_desc = conflicts[0]['conflict_description'] if conflicts else 'Schedule conflict'
                errors.append(f'Schedule conflict: {conflict_desc}')
        elif course.schedule_conflict_checking == 'warning':
            has_conflicts, conflicts = Schedule.check_schedule_conflicts(student, self.batch)
            if has_conflicts:
                warnings.append(f'Schedule conflicts detected ({len(conflicts)} conflict(s))')
        
        return errors, warnings
    
    def process(self):
        """Process bulk enrollment"""
        for student_id in self.student_ids:
            try:
                student = User.objects.get(id=student_id, role='student')
                
                # Validate
                errors, warnings = self.validate_student_enrollment(student)
                
                if errors:
                    self.results['errors'].append({
                        'student_id': student_id,
                        'student_name': student.get_full_name(),
                        'username': student.username,
                        'errors': errors
                    })
                    continue
                
                # Create enrollment
                enrollment = Enrollment.objects.create(
                    student=student,
                    batch=self.batch,
                    course=self.batch.course,
                    status='active'
                )
                
                # Send notification
                Notification.objects.create(
                    user=student,
                    notification_type='enrollment',
                    channel='in_app',
                    title='Enrollment Confirmation',
                    message=f'You have been enrolled in {self.batch.course.name} - Batch {self.batch.batch_number}',
                    related_enrollment=enrollment
                )
                
                self.results['success'].append({
                    'student_id': student_id,
                    'student_name': student.get_full_name(),
                    'username': student.username,
                    'enrollment_id': enrollment.id,
                    'warnings': warnings
                })
                
                if warnings:
                    self.results['warnings'].extend([
                        f"{student.username}: {w}" for w in warnings
                    ])
                
            except User.DoesNotExist:
                self.results['errors'].append({
                    'student_id': student_id,
                    'errors': ['Student not found']
                })
            except Exception as e:
                self.results['errors'].append({
                    'student_id': student_id,
                    'errors': [str(e)]
                })
        
        # Log activity
        ActivityLog.objects.create(
            user=self.created_by,
            action='bulk_enrollment',
            description=f'Bulk enrolled {len(self.results["success"])} students in {self.batch}',
            ip_address='system'
        )
        
        return self.results
