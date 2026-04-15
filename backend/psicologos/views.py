from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

from .models import Psicologo
from .serializers import PsicologoSerializer
from configuracion.permissions import SoloLecturaParaNoStaff

from citas.models import Cita
from citas.serializers import CitaSerializer
from historias_clinicas.models import HistoriaClinica
from notificaciones.models import Notificacion


class PsicologoViewSet(ModelViewSet):
    queryset = Psicologo.objects.all()
    serializer_class = PsicologoSerializer
    permission_classes = [SoloLecturaParaNoStaff]

    #PANEL DEL PSICÓLOGO
    @action(detail=False, methods=["get"])
    def mi_panel(self, request):

        user = request.user

        # verificar que el usuario sea psicólogo
        if not hasattr(user, "psicologo"):
            return Response(
                {"error": "Este usuario no es psicólogo"},
                status=400
            )

        psicologo = user.psicologo
        hoy = timezone.now().date()

        citas = Cita.objects.filter(psicologo=psicologo)
        citas_hoy = citas.filter(fecha=hoy)

        pacientes_unicos = citas.values("paciente").distinct().count()

        historias = HistoriaClinica.objects.filter(
            paciente__cita__psicologo=psicologo
        ).count()

        notificaciones = Notificacion.objects.filter(
            usuario=user,
            leida=False
        ).count()

        #proxima cita del dia 
        proxima = citas_hoy.filter(
            hora__gte=timezone.now().time(),
            estado="pendiente"
        ).order_by("hora").first()

        data = {
            "citas_totales": citas.count(),
            "citas_hoy": citas_hoy.count(),
            "pacientes_atendidos": pacientes_unicos,
            "historias_clinicas": historias,
            "notificaciones_no_leidas": notificaciones,
            "proxima_cita":{
                "paciente": str(proxima.paciente) if proxima else None,
                "hora": proxima.hora if proxima else None,
            }
        }

        return Response(data)
    
    #agenda semanal del psicologo
    @action(detail=False, methods=["get"])
    def agenda_semanal(self, request):

        user = request.user

        if not hasattr(user, "psicologo"):
            return Response(
                {"error": "Este usuario no es psicologo"},
                status=400
            )
        
        psicologo = user.psicologo

        hoy = timezone.now().date()

        #lunes de la semana actual
        inicio_semana = hoy - timedelta(days=hoy.weekday())

        #domingo
        fin_semana = inicio_semana + timedelta(days=6)

        citas = Cita.objects.filter(
            psicologo=psicologo,
            fecha__range=[inicio_semana, fin_semana]
        ).order_by("fecha", "hora")

        serializer = CitaSerializer(citas, many=True)

        return Response({
            "semana": {
                "inicio": inicio_semana,
                "fin": fin_semana
            },
            "total_citas": citas.count(),
            "citas": serializer.data
        })
    
    @action(detail=False, methods=["get"])
    def resumen_recepcion(self, request):
        from django.utils.timezone import now
        from citas.models import Cita
        from pacientes.models import Paciente

        mes_actual = now().month
        año_actual = now().year

        psicologos = Psicologo.objects.all()
        data = []

        for psicologo in psicologos:
            citas_mes = Cita.objects.filter(
                psicologo=psicologo,
                fecha__month=mes_actual,
                fecha__year=año_actual,
                estado='atendida'
            ).count()

            citas_pendientes_mes = Cita.objects.filter(
                psicologo=psicologo,
                fecha__month=mes_actual,
                fecha__year=año_actual,
                estado='pendiente'
            ).count()


            pacientes_unicos = Cita.objects.filter(
                psicologo=psicologo
            ).values('paciente').distinct().count()

            data.append({
                'id': psicologo.id,
                'nombres': psicologo.nombres,
                'apellidos': psicologo.apellidos,
                'especialidad': psicologo.especialidad,
                'email': psicologo.email,
                'telefono': psicologo.telefono,
                'activo': psicologo.activo,
                'citas_atendidas_mes': citas_mes,
                'citas_pendientes_mes': citas_pendientes_mes,
                'total_pacientes': pacientes_unicos,
            })

        return Response(data)
    
    @action(detail=False, methods=["get"])
    def mi_estado(self, request):
        user = request.user
        if not hasattr(user, "psicologo"):
            return Response({"error": "No es psicólogo"}, status=400)
        psicologo = user.psicologo
        return Response({"id": psicologo.id, "activo": psicologo.activo})

    @action(detail=False, methods=["post"])
    def toggle_estado(self, request):
        user = request.user
        if not hasattr(user, "psicologo"):
            return Response({"error": "No es psicólogo"}, status=400)
        psicologo = user.psicologo
        psicologo.activo = not psicologo.activo
        psicologo.save()
        return Response({
            "activo": psicologo.activo,
            "mensaje": "Ahora estás Activo" if psicologo.activo else "Ahora estás Inactivo"
        })
    
    @action(detail=True, methods=["post"])
    def toggle_estado_recepcion(self, request, pk=None):
        user = request.user
        if user.rol != 'recepcion' and not user.is_staff:
            return Response({"error": "No tienes permiso"}, status=403)
        try:
            psicologo = Psicologo.objects.get(pk=pk)
            psicologo.activo = not psicologo.activo
            psicologo.save()
            return Response({
                "activo": psicologo.activo,
                "mensaje": "Ahora está Activo" if psicologo.activo else "Ahora está Inactivo"
            })
        except Psicologo.DoesNotExist:
            return Response({"error": "Psicólogo no encontrado"}, status=404)
        
    def get_permissions(self):
        if self.action in ['toggle_estado', 'toggle_estado_recepcion', 'mi_estado']:
            from rest_framework.permissions import IsAuthenticated
            return [IsAuthenticated()]
        return super().get_permissions()

from .models import HorarioPsicologo
from .serializers import HorarioPsicologoSerializer
from usuarios.permissions import EsAdmin


class HorarioPsicologoViewSet(ModelViewSet):
    queryset = HorarioPsicologo.objects.all()
    serializer_class = HorarioPsicologoSerializer
    permission_classes = [EsAdmin]