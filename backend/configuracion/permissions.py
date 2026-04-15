from rest_framework.permissions import BasePermission, SAFE_METHODS

class SoloLecturaParaNoStaff(BasePermission):

    def has_permission(self, request, view):

        #permitir metodos de lectura
        if request.method in SAFE_METHODS:
            return True

        #permitir escritura solo a staff/admin
        return request.user and request.user.is_staff
