from django.core.mail import send_mail
from django.conf import settings

def enviar_email(usuario, titulo, mensaje):
    if not usuario.email:
        return
    
    send_mail(
        subject=titulo,
        message=mensaje,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[usuario.email],
        fail_silently=True,
    )