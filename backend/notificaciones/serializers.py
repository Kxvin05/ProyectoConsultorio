from rest_framework import serializers
from .models import Notificacion, Mensaje, Conversacion
from django.db.models import Q

class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = "__all__"

class MensajeSerializer(serializers.ModelSerializer):
    remitente_nombre = serializers.SerializerMethodField()
    destinatario_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = Mensaje
        fields = ['mensaje_id', 'remitente', 'remitente_nombre', 'destinatario', 'destinatario_nombre', 'contenido', 'fecha_creacion', 'leido']
        read_only_fields = ['mensaje_id', 'fecha_creacion']
    
    def get_remitente_nombre(self, obj):
        return obj.remitente.username
    
    def get_destinatario_nombre(self, obj):
        return obj.destinatario.username


class ConversacionSerializer(serializers.ModelSerializer):
    p1_username = serializers.SerializerMethodField()
    p2_username = serializers.SerializerMethodField()
    ultimo_mensaje = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversacion
        fields = ['conversacion_id', 'participante1', 'p1_username', 'participante2', 'p2_username', 'fecha_ultima_actualizacion', 'ultimo_mensaje']
    
    def get_p1_username(self, obj):
        return obj.participante1.username
    
    def get_p2_username(self, obj):
        return obj.participante2.username
    
    def get_ultimo_mensaje(self, obj):
        mensaje = Mensaje.objects.filter(
            (Q(remitente=obj.participante1) & Q(destinatario=obj.participante2)) |
            (Q(remitente=obj.participante2) & Q(destinatario=obj.participante1))
        ).first()
        if mensaje:
            return {
                'contenido': mensaje.contenido[:50],
                'fecha': mensaje.fecha_creacion
            }
        return None