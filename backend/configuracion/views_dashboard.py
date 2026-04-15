from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Sum

from citas.models import Cita
from pacientes.models import Paciente
from facturacion.models import Factura

from usuarios.permissions import EsAdmin

@api_view(["GET"])
@permission_classes([])  # luego puedes poner solo admin
def dashboard_admin(request):

    hoy = timezone.now().date()

    #Citas de hoy
    citas_hoy = Cita.objects.filter(fecha=hoy)

    total_citas = citas_hoy.count()
    atendidas = citas_hoy.filter(estado="atendida").count()
    canceladas = citas_hoy.filter(estado="cancelada").count()

    #Pacientes registrados
    total_pacientes = Paciente.objects.count()

    #Ingresos del día
    ingresos = Factura.objects.filter(
        creada_en__date=hoy,
        estado="pagada"
    ).aggregate(total=Sum("total"))["total"] or 0

    #Psicólogo con más citas hoy
    top_psicologo = (
        citas_hoy.values("psicologo__nombres", "psicologo__apellidos")
        .annotate(total=Count("id"))
        .order_by("-total")
        .first()
    )

    return Response({
        "citas_hoy": total_citas,
        "atendidas": atendidas,
        "canceladas": canceladas,
        "pacientes_registrados": total_pacientes,
        "ingresos_hoy": ingresos,
        "psicologo_con_mas_citas": top_psicologo
    })

