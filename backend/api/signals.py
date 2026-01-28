"""
Django signals for automatic enrollment count management
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Enrollment


@receiver(post_save, sender=Enrollment)
def update_counts_on_enrollment_save(sender, instance, created, **kwargs):
    """
    Update batch and course enrollment counts when an enrollment is created or updated
    """
    if created:
        # Increment counts when new enrollment is created
        batch = instance.batch
        if batch:
            # Update batch enrolled count
            batch.enrolled_count = batch.enrollments.filter(status__in=['active', 'pending']).count()
            batch.save(update_fields=['enrolled_count'])
            
            # Update course enrolled count
            course = batch.course
            if course:
                course.enrolled_count = Enrollment.objects.filter(
                    batch__course=course,
                    status__in=['active', 'pending']
                ).count()
                course.save(update_fields=['enrolled_count'])


@receiver(post_delete, sender=Enrollment)
def update_counts_on_enrollment_delete(sender, instance, **kwargs):
    """
    Update batch and course enrollment counts when an enrollment is deleted
    Also process waitlist for auto-enrollment
    """
    from .models import Waitlist, Notification
    from django.utils import timezone
    
    batch = instance.batch
    if batch:
        # Update batch enrolled count
        batch.enrolled_count = batch.enrollments.filter(status__in=['active', 'pending']).count()
        batch.save(update_fields=['enrolled_count'])
        
        # Update course enrolled count
        course = batch.course
        if course:
            course.enrolled_count = Enrollment.objects.filter(
                batch__course=course,
                status__in=['active', 'pending']
            ).count()
            course.save(update_fields=['enrolled_count'])
        
        # Process waitlist - auto-enroll next student if seat available
        if batch.enrolled_count < batch.capacity:
            # Get the next waiting student (FCFS - lowest position)
            next_waitlist = Waitlist.objects.filter(
                batch=batch,
                status='waiting'
            ).order_by('position', 'joined_date').first()
            
            if next_waitlist:
                # Create enrollment for the waitlisted student
                new_enrollment = Enrollment.objects.create(
                    student=next_waitlist.student,
                    batch=batch,
                    course=batch.course,
                    status='active'
                )
                
                # Update waitlist status
                next_waitlist.status = 'enrolled'
                next_waitlist.notified = True
                next_waitlist.save()
                
                # Send notification to student
                Notification.objects.create(
                    user=next_waitlist.student,
                    notification_type='enrollment',
                    channel='in_app',
                    title='Enrolled from Waitlist!',
                    message=f'Great news! A seat opened up and you have been automatically enrolled in {batch.course.name} - Batch {batch.batch_number}.',
                    related_enrollment=new_enrollment
                )
                
                # Reorder remaining waitlist positions
                remaining_waitlist = Waitlist.objects.filter(
                    batch=batch,
                    status='waiting'
                ).order_by('position', 'joined_date')
                
                for index, waitlist_entry in enumerate(remaining_waitlist, start=1):
                    if waitlist_entry.position != index:
                        waitlist_entry.position = index
                        waitlist_entry.save(update_fields=['position'])

