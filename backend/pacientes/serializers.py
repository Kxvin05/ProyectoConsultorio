from rest_framework import serializers
from .models import Paciente

class PacienteSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.SerializerMethodField()
    usuario_email = serializers.CharField(source='usuario.email', read_only=True)
    
    class Meta:
        model = Paciente
        fields = ['id', 'usuario_nombre', 'usuario_email','tipo_documento', 'documento', 'telefono', 'nombres', 'apellidos']
    
    def get_usuario_nombre(self, obj):
        return f"{obj.nombres} {obj.apellidos}"