from django.contrib import admin
from .models import Factura


@admin.register(Factura)
class FacturaAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "paciente",
        "valor",
        "creada_en",
    )

    search_fields = (
        "paciente__nombres",
        "paciente__apellidos",
    )

    list_filter = (
        "creada_en",
    )

    ordering = ("-creada_en",)
