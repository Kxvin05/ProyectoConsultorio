from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.http import HttpResponse

from .models import Factura
from pacientes.models import Paciente
from .serializers import FacturaSerializer
from .pdf_utils import generar_pdf_factura


class FacturaViewSet(ModelViewSet):

    serializer_class = FacturaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Factura.objects.all()

        # Recepcionista ve todas las facturas
        if user.rol == 'recepcion':
            return Factura.objects.all()

        # Paciente ve solo sus facturas
        paciente = Paciente.objects.filter(usuario=user).first()
        if paciente:
            return Factura.objects.filter(paciente=paciente)

        return Factura.objects.none()

    @action(detail=True, methods=["post"])
    def pagar(self, request, pk=None):
        factura = self.get_object()

        if factura.estado == "pagada":
            return Response({"error": "La factura ya esta pagada"}, status=400)

        factura.estado = "pagada"
        factura.pagada_en = timezone.now()
        factura.save()

        return Response({"ok": "Factura pagada"})

    @action(detail=True, methods=["get"])
    def pdf(self, request, pk=None):
        # ✅ Buscar directamente sin filtrar por usuario
        try:
            factura = Factura.objects.get(pk=pk)
        except Factura.DoesNotExist:
            return Response({"error": "Factura no encontrada"}, status=404)

        # Verificar permiso
        paciente = Paciente.objects.filter(usuario=request.user).first()
        if (not request.user.is_staff and
            request.user.rol != 'recepcion' and
            factura.paciente != paciente):
            return Response({"error": "No tienes permiso"}, status=403)

        buffer = generar_pdf_factura(factura)

        return HttpResponse(
            buffer,
            content_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="factura_{factura.id}.pdf"'
            },
        )

    @action(detail=False, methods=["get"])
    def por_paciente(self, request):
        """Obtener facturas de un paciente específico — para recepción"""
        paciente_id = request.query_params.get('paciente_id')

        if not paciente_id:
            return Response({"error": "paciente_id requerido"}, status=400)

        facturas = Factura.objects.filter(paciente_id=paciente_id)
        serializer = self.get_serializer(facturas, many=True)
        return Response(serializer.data)
