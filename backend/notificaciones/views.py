from rest_framework.viewsets import ModelViewSet
from .models import Notificacion, Mensaje, Conversacion
from .serializers import NotificacionSerializer, MensajeSerializer, ConversacionSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.db.models import Q
from usuarios.models import Usuario


class EsPropietarioNotificacion(BasePermission):
    """Permite al usuario gestionar solo sus propias notificaciones"""
    def has_object_permission(self, request, view, obj):
        return obj.usuario == request.user


class NotificacionViewSet(ModelViewSet):
    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated, EsPropietarioNotificacion]

    def get_queryset(self):
        return Notificacion.objects.filter(
            usuario=self.request.user
        ).order_by("-creada_en")

    @action(detail=True, methods=["post"])
    def marcar_leida(self, request, pk=None):
        n = self.get_object()
        n.leida = True
        n.save()
        return Response({"ok": "Marcada como leída"})

    @action(detail=False, methods=["get"])
    def no_leidas(self, request):
        notis = Notificacion.objects.filter(
            usuario=request.user,
            leida=False
        ).order_by("-creada_en")
        serializer = NotificacionSerializer(notis, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def marcar_todas(self, request):
        Notificacion.objects.filter(
            usuario=request.user,
            leida=False
        ).update(leida=True)
        return Response({"ok": "Todas marcadas como leídas"})


class MensajeViewSet(ModelViewSet):
    serializer_class = MensajeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Mensaje.objects.filter(Q(remitente=user) | Q(destinatario=user))

    def perform_create(self, serializer):
        serializer.save(remitente=self.request.user)

    @action(detail=False, methods=["get"])
    def conversacion(self, request):
        otro_usuario_id = request.query_params.get("usuario_id")
        if not otro_usuario_id:
            return Response([], status=200)

        mensajes = Mensaje.objects.filter(
            (Q(remitente=request.user) & Q(destinatario_id=otro_usuario_id)) |
            (Q(remitente_id=otro_usuario_id) & Q(destinatario=request.user))
        ).order_by('fecha_creacion')

        serializer = MensajeSerializer(mensajes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def marcar_leidos(self, request):
        usuario_id = request.data.get("usuario_id")
        Mensaje.objects.filter(
            destinatario=request.user,
            remitente_id=usuario_id,
            leido=False
        ).update(leido=True)
        return Response({"ok": "Mensajes marcados como leídos"})


class ConversacionViewSet(ModelViewSet):
    serializer_class = ConversacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversacion.objects.filter(Q(participante1=user) | Q(participante2=user))

    @action(detail=False, methods=["post"])
    def crear_o_obtener(self, request):
        otro_usuario_id = request.data.get("usuario_id")
        user = request.user

        try:
            otro_usuario = Usuario.objects.get(pk=otro_usuario_id)
        except Usuario.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=404)

        conversacion, created = Conversacion.objects.get_or_create(
            participante1_id=min(user.id, otro_usuario.id),
            participante2_id=max(user.id, otro_usuario.id)
        )

        serializer = ConversacionSerializer(conversacion)
        return Response(serializer.data)
