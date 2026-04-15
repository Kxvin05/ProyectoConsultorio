from django.contrib import admin
from .models import Paciente


@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ("nombres", "apellidos", "documento", "email")
    search_fields = ("nombres", "apellidos", "documento")
