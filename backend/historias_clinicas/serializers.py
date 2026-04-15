from rest_framework import serializers
from .models import HistoriaClinica

class HistoriaClinicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriaClinica
        fields = "__all__"