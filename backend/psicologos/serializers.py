from rest_framework import serializers
from .models import Psicologo, HorarioPsicologo


class HorarioPsicologoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorarioPsicologo
        fields = "__all__"


class PsicologoSerializer(serializers.ModelSerializer):
    horarios = HorarioPsicologoSerializer(many=True, read_only=True)

    class Meta:
        model = Psicologo
        fields = "__all__"