from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Paciente
from .serializers import PacienteSerializer
from configuracion.permissions import SoloLecturaParaNoStaff

from citas.models import Cita
from facturacion.models import Factura
from historias_clinicas.models import HistoriaClinica
from notificaciones.models import Notificacion


class PacienteViewSet(ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    permission_classes = [SoloLecturaParaNoStaff]

    #PANEL DEL PACIENTE (MI CUENTA)
    @action(detail=False, methods=["get"])
    def mi_panel(self, request):

        user = request.user

        # verificar que el usuario sea paciente
        if not hasattr(user, "paciente"):
            return Response(
                {"error": "Este usuario no es un paciente"},
                status=400
            )

        paciente = user.paciente

        citas = Cita.objects.filter(paciente=paciente)
        facturas = Factura.objects.filter(paciente=paciente)
        historia = HistoriaClinica.objects.filter(
            paciente=paciente
        ).first()

        notificaciones = Notificacion.objects.filter(
            usuario=user,
            leida=False
        ).count()

        data = {
            "citas_total": citas.count(),
            "citas_pendientes": citas.filter(
                estado="pendiente"
            ).count(),
            "facturas_pendientes": facturas.filter(
                estado="pendiente"
            ).count(),
            "tiene_historia_clinica": historia is not None,
            "notificaciones_no_leidas": notificaciones
        }

        return Response(data)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def pacientes(self, request):
        """Lista todos los pacientes (solo para recepcionistas)"""
        # Solo recepcionista o admin pueden ver pacientes
        if request.user.rol not in ['recepcion', 'admin'] and not request.user.is_staff:
            return Response(
                {"error": "No tienes permiso para ver pacientes"},
                status=403
            )
        
        pacientes = Paciente.objects.all()
        serializer = self.get_serializer(pacientes, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=["get"])
    def buscar_por_documento(self, request):
        """Buscar paciente por número de documento"""
        documento = request.query_params.get('documento')
    
        if not documento:
            return Response({"error": "Documento requerido"}, status=400)
    
        paciente = Paciente.objects.filter(documento=documento).first()
    
        if not paciente:
            return Response({"error": "Paciente no encontrado"}, status=404)
    
        serializer = self.get_serializer(paciente)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def mis_pacientes(self, request):
        """Obtiene los pacientes que han agendado citas con el psicólogo actual"""
        user = request.user
    
        # Verificar que el usuario sea psicólogo
        if not hasattr(user, "psicologo"):
            return Response(
                {"error": "Este usuario no es un psicólogo"},
                status=400
            )
    
        psicologo = user.psicologo
    
        # Obtener pacientes únicos que tienen citas con este psicólogo
        pacientes_ids = Cita.objects.filter(
            psicologo=psicologo
        ).values_list('paciente_id', flat=True).distinct()
    
        pacientes = Paciente.objects.filter(id__in=pacientes_ids)
    
        serializer = self.get_serializer(pacientes, many=True)
        return Response(serializer.data)
