from django.db import models
from usuarios.models import Usuario

class Psicologo(models.Model):

    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE)

    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    documento = models.CharField(max_length=30, unique=True)
    especialidad = models.CharField(max_length=100)

    telefono = models.CharField(max_length=20)
    email = models.EmailField()

    activo = models.BooleanField(default=True)

    duracion_cita_min = models.PositiveIntegerField(default=30)

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"
    
class HorarioPsicologo(models.Model):
    DIAS = [
        (0, "Lunes"),
        (1, "Martes"),
        (2, "Miércoles"),
        (3, "Jueves"),
        (4, "Viernes"),
        (5, "Sábado"),
        (6, "Domingo"),
    ]

    psicologo = models.ForeignKey(
        Psicologo,
        on_delete=models.CASCADE,
        related_name="horarios"
    )

    dia_semana = models.IntegerField(choices=DIAS)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()

    def __str__(self):
        return f"{self.psicologo} - {self.get_dia_semana_display()} {self.hora_inicio}-{self.hora_fin}"
