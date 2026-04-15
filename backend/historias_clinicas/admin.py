from django.contrib import admin
from .models import HistoriaClinica


@admin.register(HistoriaClinica)
class HistoriaClinicaAdmin(admin.ModelAdmin):
    list_display = ("paciente", "creada_en")
