from django.db import models
from pacientes.models import Paciente


class HistoriaClinica(models.Model):

    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='historias')

    motivo_consulta = models.TextField(blank=True)
    diagnostico = models.TextField(blank=True)
    tratamiento = models.TextField(blank=True)
    antecedentes_medicos = models.TextField(blank=True)
    alergias = models.TextField(blank=True)
    medicamentos_actuales = models.TextField(blank=True)
    observaciones = models.TextField(blank=True)

    creada_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Historia - {self.paciente}"