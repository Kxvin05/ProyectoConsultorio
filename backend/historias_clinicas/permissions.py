from rest_framework.permissions import BasePermission

class EsDuenoHistoriaOStaff(BasePermission):

    def has_object_permission(self, request, view, obj):

        #staff siempre puede
        if request.user.is_staff:
            return True

        #dueño = usuario ligado al paciente
        return obj.paciente.usuario == request.user
