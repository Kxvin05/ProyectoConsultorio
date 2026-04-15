from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import datetime, timedelta

from .models import Cita, Calificacion
from .serializers import CitaSerializer, CalificacionSerializer
from facturacion.models import Factura
from decimal import Decimal
from django.utils import timezone
from django.db.models import Count, Avg
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings

from historias_clinicas.models import HistoriaClinica
from notificaciones.utils import crear_notificacion
from psicologos.models import Psicologo, HorarioPsicologo
from usuarios.permissions import EsStaffClinico, PermisoPorAcccion
from configuracion.permissions import SoloLecturaParaNoStaff
from pacientes.models import Paciente

from rest_framework.permissions import IsAuthenticated, BasePermission


class PuedeCRUDCitas(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method == 'GET':
            return True
        if request.method == 'POST':
            return hasattr(request.user, 'paciente')
        return request.user.is_staff


class CitaViewSet(ModelViewSet):
    serializer_class = CitaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Cita.objects.all()
        if hasattr(user, "psicologo"):
            return Cita.objects.filter(psicologo=user.psicologo)
        if hasattr(user, "paciente"):
            return Cita.objects.filter(paciente=user.paciente)
        return Cita.objects.none()

    def perform_create(self, serializer):
        print("\n" + "="*50)
        print("PERFORM_CREATE LLAMADO")
        print("="*50)

        user = self.request.user

        try:
            paciente = Paciente.objects.filter(usuario=user).first()
            if paciente:
                cita = serializer.save(paciente=paciente)
                print(f"CITA CREADA: {cita.id}")

                # Notificación al psicólogo
                try:
                    crear_notificacion(
                        cita.psicologo.usuario,
                        "Nueva cita asignada",
                        f"El paciente {paciente.nombres} {paciente.apellidos} agendó una cita para el {cita.fecha} a las {cita.hora}. Motivo: {cita.motivo}"
                    )
                except Exception as e:
                    print(f"Error en notificación: {e}")

                # Email de confirmación al paciente con diseño HTML
                try:
                    asunto = '✅ Confirmación de Cita - Consultorio Alexandra Pérez'
                    mensaje_texto = f'Tu cita ha sido agendada para el {cita.fecha} a las {cita.hora}.'
                    mensaje_html = f'''
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {{ margin: 0; padding: 0; background: #f0f4ff; font-family: Arial, sans-serif; }}
    .wrapper {{ max-width: 600px; margin: 40px auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }}
    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); padding: 50px 40px; text-align: center; }}
    .header-icon {{ font-size: 60px; margin-bottom: 15px; }}
    .header h1 {{ color: white; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.2); }}
    .header p {{ color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px; }}
    .body {{ padding: 40px; }}
    .greeting {{ font-size: 22px; font-weight: 700; color: #2d3748; margin-bottom: 8px; }}
    .subtitle {{ color: #718096; font-size: 15px; margin-bottom: 30px; }}
    .badge {{ display: inline-block; background: linear-gradient(135deg, #48bb78, #38a169); color: white; padding: 6px 16px; border-radius: 50px; font-size: 12px; font-weight: 700; margin-bottom: 25px; }}
    .card {{ background: linear-gradient(135deg, #f7f0ff, #ede9fe); border: 2px solid #c4b5fd; border-radius: 16px; padding: 25px; margin: 25px 0; }}
    .card-title {{ font-size: 13px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 18px; }}
    .detail-row {{ display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #e9d5ff; }}
    .detail-row:last-child {{ border-bottom: none; }}
    .detail-icon {{ font-size: 22px; width: 45px; flex-shrink: 0; }}
    .detail-label {{ font-size: 11px; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }}
    .detail-value {{ font-size: 15px; color: #1f2937; font-weight: 700; }}
    .tips {{ background: linear-gradient(135deg, #fffbeb, #fef3c7); border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0; }}
    .tips-title {{ font-weight: 700; color: #d97706; margin-bottom: 12px; font-size: 14px; }}
    .tip {{ color: #92400e; font-size: 13px; margin: 8px 0; line-height: 1.5; }}
    .footer {{ background: linear-gradient(135deg, #1e1b4b, #312e81); padding: 30px 40px; text-align: center; }}
    .footer-logo {{ font-size: 30px; margin-bottom: 10px; }}
    .footer strong {{ color: white; font-size: 15px; display: block; margin-bottom: 5px; }}
    .footer p {{ color: rgba(255,255,255,0.6); font-size: 12px; margin: 4px 0; }}
    .divider {{ height: 5px; background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #4facfe); }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-icon">🧠</div>
      <h1>¡Cita Confirmada!</h1>
      <p>Consultorio Psicológico Alexandra Pérez</p>
    </div>
    <div class="divider"></div>
    <div class="body">
      <span class="badge">✅ Reserva Exitosa</span>
      <div class="greeting">Hola, {paciente.nombres} {paciente.apellidos} 👋</div>
      <p class="subtitle">Tu cita ha sido agendada correctamente. Aquí tienes todos los detalles:</p>

      <div class="card">
        <div class="card-title">📋 Detalles de tu Cita</div>
        <div class="detail-row">
          <div class="detail-icon">📅</div>
          <div>
            <div class="detail-label">Fecha</div>
            <div class="detail-value">{cita.fecha}</div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-icon">🕐</div>
          <div>
            <div class="detail-label">Hora</div>
            <div class="detail-value">{cita.hora}</div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-icon">👨‍⚕️</div>
          <div>
            <div class="detail-label">Psicólogo</div>
            <div class="detail-value">{cita.psicologo.nombres} {cita.psicologo.apellidos}</div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-icon">🏥</div>
          <div>
            <div class="detail-label">Especialidad</div>
            <div class="detail-value">{cita.psicologo.especialidad}</div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-icon">📝</div>
          <div>
            <div class="detail-label">Motivo</div>
            <div class="detail-value">{cita.motivo}</div>
          </div>
        </div>
      </div>

      <div class="tips">
        <div class="tips-title">💡 Recomendaciones importantes</div>
        <div class="tip">⏰ Llega 10 minutos antes de tu cita</div>
        <div class="tip">❌ Si necesitas cancelar, hazlo con 24 horas de anticipación</div>
        <div class="tip">📱 Guarda este email como comprobante</div>
        <div class="tip">🔒 Tu privacidad y confidencialidad están garantizadas</div>
      </div>
    </div>
    <div class="footer">
      <div class="footer-logo">💜</div>
      <strong>Consultorio Psicológico Alexandra Pérez</strong>
      <p>Tu bienestar mental es nuestra prioridad</p>
      <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
    </div>
  </div>
</body>
</html>
                    '''

                    email_msg = EmailMultiAlternatives(
                        subject=asunto,
                        body=mensaje_texto,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        to=[paciente.usuario.email]
                    )
                    email_msg.attach_alternative(mensaje_html, "text/html")
                    email_msg.send(fail_silently=True)
                    print(f"✅ Email de confirmación enviado a {paciente.usuario.email}")
                except Exception as e:
                    print(f"Error enviando email de confirmación: {e}")

            else:
                print("ERROR: Usuario NO tiene paciente")
                serializer.save()
        except Exception as e:
            print(f"Error crítico: {e}")
            serializer.save()

    @action(detail=False, methods=["get"])
    def agenda(self, request):
        psicologo_id = request.query_params.get("psicologo")
        fecha = request.query_params.get("fecha")

        if not psicologo_id or not fecha:
            return Response({"error": "Debe enviar psicologo y fecha"}, status=400)

        citas = Cita.objects.filter(
            psicologo_id=psicologo_id,
            fecha=fecha
        ).order_by("hora")

        serializer = CitaSerializer(citas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def horas_disponibles(self, request):
        psicologo_id = request.query_params.get("psicologo")
        fecha_str = request.query_params.get("fecha")

        if not psicologo_id or not fecha_str:
            return Response({"error": "Debe enviar psicologo y fecha"}, status=400)

        try:
            fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Formato de fecha inválido (use YYYY-MM-DD)"}, status=400)

        dia_semana = fecha.weekday()

        try:
            psicologo = Psicologo.objects.get(pk=psicologo_id)
        except Psicologo.DoesNotExist:
            return Response({"error": "Psicólogo no encontrado"}, status=404)

        duracion = psicologo.duracion_cita_min

        horarios = HorarioPsicologo.objects.filter(
            psicologo_id=psicologo_id,
            dia_semana=dia_semana
        )

        if not horarios.exists():
            return Response([])

        ocupadas = set(
            Cita.objects.filter(
                psicologo_id=psicologo_id,
                fecha=fecha
            ).values_list("hora", flat=True)
        )

        disponibles = []

        for h in horarios:
            actual = datetime.combine(fecha, h.hora_inicio)
            fin = datetime.combine(fecha, h.hora_fin)

            while actual < fin:
                hora_turno = actual.time()
                if hora_turno not in ocupadas:
                    disponibles.append(hora_turno.strftime("%H:%M"))
                actual += timedelta(minutes=duracion)

        return Response(disponibles)

    @action(detail=False, methods=["get"])
    def mis_citas(self, request):
        try:
            paciente = Paciente.objects.filter(usuario=request.user).first()
            if not paciente:
                raise Paciente.DoesNotExist
            citas = Cita.objects.filter(paciente=paciente)
        except Paciente.DoesNotExist:
            citas = Cita.objects.none()

        serializer = self.get_serializer(citas, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def cancelar(self, request, pk=None):
        try:
            cita = Cita.objects.get(pk=pk)
        except Cita.DoesNotExist:
            return Response({"error": "Cita no encontrada"}, status=404)

        paciente = Paciente.objects.filter(usuario=request.user).first()
        if not request.user.is_staff and cita.paciente != paciente:
            return Response({"error": "No tienes permiso para cancelar esta cita"}, status=403)

        if cita.estado == "cancelada":
            return Response({"error": "La cita ya está cancelada"}, status=400)

        cita.estado = "cancelada"
        cita.save()

        # Email de cancelación al paciente
        try:
            asunto = '❌ Cita Cancelada - Consultorio Alexandra Pérez'
            mensaje_html = f'''
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {{ margin: 0; padding: 0; background: #fff5f5; font-family: Arial, sans-serif; }}
    .wrapper {{ max-width: 600px; margin: 40px auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }}
    .header {{ background: linear-gradient(135deg, #fc8181, #f56565, #e53e3e); padding: 50px 40px; text-align: center; }}
    .header-icon {{ font-size: 60px; margin-bottom: 15px; }}
    .header h1 {{ color: white; margin: 0; font-size: 28px; font-weight: 700; }}
    .header p {{ color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px; }}
    .body {{ padding: 40px; }}
    .greeting {{ font-size: 20px; font-weight: 700; color: #2d3748; margin-bottom: 8px; }}
    .subtitle {{ color: #718096; font-size: 15px; margin-bottom: 25px; }}
    .card {{ background: #fff5f5; border: 2px solid #fed7d7; border-radius: 16px; padding: 25px; margin: 20px 0; }}
    .detail-row {{ display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #fed7d7; }}
    .detail-row:last-child {{ border-bottom: none; }}
    .detail-icon {{ font-size: 20px; width: 40px; flex-shrink: 0; }}
    .detail-label {{ font-size: 11px; color: #9ca3af; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }}
    .detail-value {{ font-size: 15px; color: #1f2937; font-weight: 700; }}
    .cta {{ background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-align: center; padding: 20px; border-radius: 12px; margin: 25px 0; }}
    .cta p {{ margin: 0; font-size: 14px; }}
    .footer {{ background: linear-gradient(135deg, #1e1b4b, #312e81); padding: 30px 40px; text-align: center; }}
    .footer strong {{ color: white; font-size: 15px; display: block; margin-bottom: 5px; }}
    .footer p {{ color: rgba(255,255,255,0.6); font-size: 12px; margin: 4px 0; }}
    .divider {{ height: 5px; background: linear-gradient(90deg, #fc8181, #f56565, #e53e3e); }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-icon">❌</div>
      <h1>Cita Cancelada</h1>
      <p>Consultorio Psicológico Alexandra Pérez</p>
    </div>
    <div class="divider"></div>
    <div class="body">
      <div class="greeting">Hola, {cita.paciente.nombres} {cita.paciente.apellidos}</div>
      <p class="subtitle">Tu cita ha sido cancelada. Aquí están los detalles de la cita cancelada:</p>
      <div class="card">
        <div class="detail-row">
          <div class="detail-icon">📅</div>
          <div>
            <div class="detail-label">Fecha</div>
            <div class="detail-value">{cita.fecha}</div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-icon">🕐</div>
          <div>
            <div class="detail-label">Hora</div>
            <div class="detail-value">{cita.hora}</div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-icon">👨‍⚕️</div>
          <div>
            <div class="detail-label">Psicólogo</div>
            <div class="detail-value">{cita.psicologo.nombres} {cita.psicologo.apellidos}</div>
          </div>
        </div>
      </div>
      <div class="cta">
        <p>¿Deseas reagendar tu cita? Ingresa al sistema y agenda una nueva cita 📅</p>
      </div>
    </div>
    <div class="footer">
      <strong>Consultorio Psicológico Alexandra Pérez</strong>
      <p>Tu bienestar mental es nuestra prioridad 💜</p>
      <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
    </div>
  </div>
</body>
</html>
            '''
            email_msg = EmailMultiAlternatives(
                subject=asunto,
                body=f'Tu cita del {cita.fecha} a las {cita.hora} ha sido cancelada.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[cita.paciente.usuario.email]
            )
            email_msg.attach_alternative(mensaje_html, "text/html")
            email_msg.send(fail_silently=True)
        except Exception as e:
            print(f"Error enviando email de cancelación: {e}")

        return Response({"ok": "Cita cancelada correctamente"})

    @action(detail=True, methods=["post"])
    def confirmar(self, request, pk=None):
        cita = self.get_object()
        if cita.estado != "pendiente":
            return Response({"error": "Solo se pueden confirmar citas pendientes"}, status=400)
        cita.estado = "confirmada"
        cita.save()
        return Response({"ok": "Cita confirmada correctamente"})

    @action(detail=True, methods=["post"])
    def atender(self, request, pk=None):
        cita = self.get_object()
        if cita.estado == "atendida":
            return Response({"error": "La cita ya fue atendida"}, status=400)
        cita.estado = "atendida"
        cita.save()
        return Response({"ok": "Cita atendida correctamente"})

    @action(detail=False, methods=["get"])
    def resumen_estado(self, request):
        data = Cita.objects.values("estado").annotate(cantidad=Count("id"))
        return Response(data)

    @action(detail=False, methods=["get"])
    def todas_citas(self, request):
        user = request.user
        if user.rol != 'recepcion' and not user.is_staff:
            return Response({"error": "No tienes permiso"}, status=403)
        citas = Cita.objects.all()
        serializer = self.get_serializer(citas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def mis_citas_psicologo(self, request):
        """Obtiene las citas del psicólogo actual"""
        user = request.user
    
        # Verificar que el usuario sea psicólogo
        if not hasattr(user, "psicologo"):
            return Response(
                {"error": "Este usuario no es un psicólogo"},
                status=400
            )
    
        psicologo = user.psicologo
        citas = Cita.objects.filter(psicologo=psicologo).order_by('-fecha', '-hora')
    
        serializer = self.get_serializer(citas, many=True)
        return Response(serializer.data)


class CalificacionViewSet(ModelViewSet):
    serializer_class = CalificacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Calificacion.objects.all()
        if hasattr(user, "paciente"):
            return Calificacion.objects.filter(paciente=user.paciente)
        return Calificacion.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, "paciente"):
            serializer.save(paciente=user.paciente)

    @action(detail=False, methods=["get"])
    def psicologo(self, request):
        psicologo_id = request.query_params.get("psicologo_id")
        if not psicologo_id:
            return Response([], status=200)
        calificaciones = Calificacion.objects.filter(psicologo_id=psicologo_id)
        serializer = CalificacionSerializer(calificaciones, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def promedio_psicologo(self, request):
        psicologo_id = request.query_params.get("psicologo_id")
        if not psicologo_id:
            return Response({"promedio": 0, "total": 0})
        calificaciones = Calificacion.objects.filter(psicologo_id=psicologo_id)
        if not calificaciones.exists():
            return Response({"promedio": 0, "total": 0})
        promedio = calificaciones.aggregate(Avg('estrellas'))['estrellas__avg']
        return Response({
            "promedio": round(promedio, 1),
            "total": calificaciones.count()
        })
