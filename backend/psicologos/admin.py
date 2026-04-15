from django.contrib import admin
from .models import Psicologo
from usuarios.permissions import EsAdmin
from .models import HorarioPsicologo


@admin.register(Psicologo)
class PsicologoAdmin(admin.ModelAdmin):
    list_display = (
        "nombres",
        "apellidos",
        "documento",
        "especialidad",
        "email",
        "activo",
    )

    search_fields = (
        "nombres",
        "apellidos",
        "documento",
        "email",
    )

    list_filter = (
        "especialidad",
        "activo",
    )

    ordering = ("apellidos", "nombres")


    permission_classes = [EsAdmin]
    admin.site.register(HorarioPsicologo)
