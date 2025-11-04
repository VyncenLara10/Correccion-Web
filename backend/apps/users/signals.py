from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, UserBalance


@receiver(post_save, sender=User)
def create_user_balance(sender, instance, created, **kwargs):
    """Crea un UserBalance automáticamente cuando se crea un usuario"""
    if created:
        UserBalance.objects.get_or_create(user=instance)


@receiver(post_save, sender=User)
def save_user_balance(sender, instance, **kwargs):
    """Guarda el UserBalance del usuario"""
    if hasattr(instance, 'balance'):
        instance.balance.save()
