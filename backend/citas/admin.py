from django.contrib import admin
from .models import Cita


@admin.register(Cita)
class CitaAdmin(admin.ModelAdmin):
    list_display = ("paciente", "psicologo", "fecha", "hora", "estado")
    list_filter = ("estado", "fecha")
