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
    """
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
