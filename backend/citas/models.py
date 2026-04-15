from django.db import models
from pacientes.models import Paciente
from psicologos.models import Psicologo
from django.core.exceptions import ValidationError
from datetime import datetime

class Cita(models.Model):

    ESTADOS = [
        ("pendiente", "Pendiente"),
        ("confirmada", "Confirmada"),
        ("cancelada", "Cancelada"),
        ("atendida", "Atendida"),
    ]

    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)
    psicologo = models.ForeignKey(Psicologo, on_delete=models.CASCADE)

    fecha = models.DateField()
    hora = models.TimeField()

    motivo = models.TextField()
    estado = models.CharField(max_length=20, choices=ESTADOS, default="pendiente")

    creada_en = models.DateTimeField(auto_now_add=True)

    observaciones = models.TextField(blank=True)
    motivo_cancelacion = models.TextField(blank=True)

    atendida_en = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.paciente} - {self.fecha} {self.hora}"
    
    #validacion
    def clean(self):
        existe = Cita.objects.filter(
            psicologo=self.psicologo,
            fecha=self.fecha,
            hora=self.hora
        ).exclude(pk=self.pk).exists()

        if existe:
            raise ValidationError(
                "Este psicólogo ya tiene una cita programada para esta fecha y hora."
            )
        
        #validar horario de atencion
        dia = self.fecha.weekday()

        horarios = self.psicologo.horarios.filter(
            dia_semana=dia
        )

        if not horarios.exists():
            raise ValidationError(
                "El psicólogo no atiende ese día."
            )
        
        dentro_de_horario = any(
            h.hora_inicio <= self.hora <= h.hora_fin
            for h in horarios
        )

        if not dentro_de_horario:
            raise ValidationError(
                "La hora está fuera del horario de atención del psicólogo."
            )
    #restriccion de bd
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["psicologo", "fecha", "hora"],
                name="cita_unica_psicologo_fecha_hora"
            )
        ]

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

class Calificacion(models.Model):
    ESTRELLAS = [
        (1, '⭐'),
        (2, '⭐⭐'),
        (3, '⭐⭐⭐'),
        (4, '⭐⭐⭐⭐'),
        (5, '⭐⭐⭐⭐⭐'),
    ]
    
    cita = models.ForeignKey(Cita, on_delete=models.CASCADE, related_name='calificaciones')
    paciente = models.ForeignKey('pacientes.Paciente', on_delete=models.CASCADE)
    psicologo = models.ForeignKey('psicologos.Psicologo', on_delete=models.CASCADE, related_name='calificaciones')
    estrellas = models.IntegerField(choices=ESTRELLAS)
    comentario = models.TextField(blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('cita', 'paciente')
    
    def __str__(self):
        return f"Calificación {self.estrellas} - {self.psicologo.nombres}"