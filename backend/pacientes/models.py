from django.db import models
from usuarios.models import Usuario

class Paciente(models.Model):

    TIPOS_DOCUMENTO = [
        ('Tarjeta de identidad', 'Tarjeta de identidad'),
        ('Pasaporte', 'Pasaporte'),
        ('Cedula de extranjeria', 'Cédula de extranjería'),
        ('Cedula de ciudadania', 'Cédula de ciudadanía'),
    ]

    tipo_documento = models.CharField(max_length=30, choices=TIPOS_DOCUMENTO, blank=True)

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name="pacientes",
        null=True,
        blank=True
    )

    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    documento = models.CharField(max_length=30, unique=True)
    telefono = models.CharField(max_length=20)
    email = models.EmailField(blank=True)

    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"

