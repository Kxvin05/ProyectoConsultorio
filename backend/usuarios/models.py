from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta


class Usuario(AbstractUser):

    ROLES = (
        ("admin", "Administrador"),
        ("psicologo", "Psicólogo"),
        ("paciente", "Paciente"),
        ("recepcion", "Recepción"),
    )

    rol = models.CharField(max_length=20, choices=ROLES)
    telefono = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.username


class RecuperacionPassword(models.Model):

    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        related_name="recuperacion"
    )

    codigo = models.CharField(max_length=6)

    usado = models.BooleanField(default=False)

    creado_en = models.DateTimeField(auto_now_add=True)

    def codigo_expirado(self):
        return timezone.now() > self.creado_en + timedelta(minutes=5)

    def __str__(self):
        return f"Recuperación de {self.usuario.email}"