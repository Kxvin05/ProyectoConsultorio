from rest_framework import serializers
from .models import Usuario
from pacientes.models import Paciente


class UsuarioSerializer(serializers.ModelSerializer):
    documento = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            'id',
            'username',
            'email',
            'rol',
            'telefono',
            'documento',   # ← SerializerMethodField, debe estar aquí
        ]

    def get_documento(self, obj):
        try:
            paciente = Paciente.objects.filter(usuario=obj).first()
            if paciente:
                return paciente.documento
            return None
        except Exception as e:
            print("ERROR EN get_documento:", e)
            return None

    def create(self, validated_data):
        password = validated_data.pop("password")
        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance