from rest_framework import serializers
from .models import Factura


class FacturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Factura
        fields = "__all__"
        read_only_fields = ["total", "creada_en", "pagada_en"]

    def validate(self, data):

        #usar validaciones del modelo
        instance = Factura(**data)
        instance.clean()
        return data