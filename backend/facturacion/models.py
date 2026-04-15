from django.db import models
from pacientes.models import Paciente
from citas.models import Cita
from django.core.exceptions import ValidationError


class Factura(models.Model):

    ESTADOS = [
        ("pendiente", "Pendiente"),
        ("pagada", "Pagada"),
        ("anulada", "Anulada"),
    ]

    METODOS = [
        ("efectivo", "Efectivo"),
        ("tarjeta", "Tarjeta"),
        ("transferencia", "Transferencia"),
    ]

    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)

    # opcional — no rompe datos viejos
    cita = models.OneToOneField(
        Cita,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    valor = models.DecimalField(max_digits=10, decimal_places=2)
    descuento = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    descripcion = models.TextField()

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default="pendiente"
    )

    metodo_pago = models.CharField(
        max_length=20,
        choices=METODOS,
        blank=True
    )

    creada_en = models.DateTimeField(auto_now_add=True)
    pagada_en = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Factura {self.id}"

    #validaciones
    def clean(self):
        if self.valor <= 0:
            raise ValidationError(
                "El valor debe ser mayor que cero."
            )

        if self.descuento < 0:
            raise ValidationError(
                "El descuento no puede ser negativo."
            )

        if self.descuento > self.valor:
            raise ValidationError(
                "El descuento no puede ser mayor que el valor."
            )

    #cálculo automático
    def save(self, *args, **kwargs):
        self.total = self.valor - self.descuento
        super().save(*args, **kwargs)