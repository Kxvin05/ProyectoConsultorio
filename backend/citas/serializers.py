from rest_framework import serializers
from datetime import datetime, timedelta
from .models import Cita, Calificacion
from psicologos.models import HorarioPsicologo


class CitaSerializer(serializers.ModelSerializer):

    paciente_nombre = serializers.SerializerMethodField()
    paciente_documento = serializers.SerializerMethodField()
    psicologo_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Cita
        fields = ['id', 'psicologo', 'fecha', 'hora', 'motivo', 'estado', 'paciente_nombre', 'paciente_documento', 'psicologo_nombre']
        read_only_fields = ['id', 'estado']

    def get_paciente_nombre(self, obj):
        if obj.paciente:
            return f"{obj.paciente.nombres} {obj.paciente.apellidos}"
        return None

    def get_paciente_documento(self, obj):
        if obj.paciente:
            return obj.paciente.documento
        return None
    
    def get_psicologo_nombre(self, obj):
        if obj.psicologo:
            return f"{obj.psicologo.nombres} {obj.psicologo.apellidos}"
        return None

    def validate(self, data):
        psicologo = data["psicologo"]
        fecha = data["fecha"]
        hora = data["hora"]

        # Validar que el psicólogo esté activo
        if not psicologo.activo:
            raise serializers.ValidationError(
                "Este psicólogo no está disponible en este momento."
            )

        # validar horario laboral

        dia_semana = fecha.weekday()

        horarios = HorarioPsicologo.objects.filter(
            psicologo=psicologo,
            dia_semana=dia_semana
        )

        if not horarios.exists():
            raise serializers.ValidationError(
                "El psicólogo no trabaja ese día."
            )

        dentro = False
        for h in horarios:
            if h.hora_inicio <= hora < h.hora_fin:
                dentro = True
                break

        if not dentro:
            raise serializers.ValidationError(
                "Hora fuera del horario del psicólogo."
            )

        # duración configurable

        duracion = psicologo.duracion_cita_min

        if duracion <= 0 or 60 % duracion != 0:
            raise serializers.ValidationError(
                "Duración de cita inválida configurada en el psicólogo."
            )

        if hora.minute % duracion != 0:
            raise serializers.ValidationError(
                f"La cita debe iniciar en múltiplos de {duracion} minutos."
            )

        # validar cruce de citas

        inicio = datetime.combine(fecha, hora)
        fin = inicio + timedelta(minutes=duracion)

        citas = Cita.objects.filter(
            psicologo=psicologo,
            fecha=fecha
        )

        if self.instance:
            citas = citas.exclude(pk=self.instance.pk)

        for c in citas:
            c_inicio = datetime.combine(c.fecha, c.hora)
            c_fin = c_inicio + timedelta(
                minutes=c.psicologo.duracion_cita_min
            )

            if inicio < c_fin and fin > c_inicio:
                raise serializers.ValidationError(
                    "La cita se cruza con otra existente."
                )

        return data

class CalificacionSerializer(serializers.ModelSerializer):
    psicologo_nombre = serializers.SerializerMethodField()
    paciente_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = Calificacion
        fields = ['calificacion_id', 'cita', 'paciente', 'paciente_nombre', 'psicologo', 'psicologo_nombre', 'estrellas', 'comentario', 'fecha_creacion']
        read_only_fields = ['calificacion_id', 'fecha_creacion']
    
    def get_psicologo_nombre(self, obj):
        return f"{obj.psicologo.nombres} {obj.psicologo.apellidos}"
    
    def get_paciente_nombre(self, obj):
        return f"{obj.paciente.nombres} {obj.paciente.apellidos}"