from rest_framework.permissions import BasePermission


class EsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == "admin"
    

class EsPsicologoOAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.rol in ["admin", "psicologo"]
        )
    

class EsRecepcionOAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.rol in ["admin", "recepcion"]
        )
    

class EsStaffClinico(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.rol in ["admin", "psicologo", "recepcion"]
        )
    

class PermisoPorAcccion(BasePermission):
    def has_permission(self, request, view):

        if not request.user.is_authenticated:
            return False
        
        rol = request.user.rol

        #ver datos - todos los roles staff
        if view.action in ["list", "retrieve"]:
            return rol in ["admin", "psicologo", "recepcion"]
        
        #crear
        if view.action == "create":
            return rol in ["admin", "recepcion"]
        
        #editar
        if view.action in ["update", "partial_update"]:
            return rol in ["admin", "psicologo"]
        
        #eliminar
        if view.action == "destroy":
            return rol == "admin"
        
        return False

    #permiso por objeto
    def has_object_permission(self, request, view, obj):

        rol = request.user.rol

        #admin ve todo
        if rol == "admin":
            return True

        #psicólogo solo sus citas
        if rol == "psicologo":
            if hasattr(obj, "psicologo"):
                return obj.psicologo.id == request.user.id

        #recepción solo lectura
        if rol == "recepcion":
            return request.method in ["GET"]

        return False  
    
class EsPropietarioODelStaff(BasePermission):
    """
    permite ecceso si:
    -es staff
    -o el objeto pertenece al ususario
    """

    def has_object_permission(self, request, view, obj):
        #staff puede todo
        if request.user.is_staff:
            return True
        
        #intenta diferentes nombres comunes
        if hasattr(obj, "usuario"):
            return obj.usuario == request.user
        
        if hasattr(obj, "paciente") and hasattr(obj.paciente, "usuario"):
            return obj.paciente.usuario == request.user
        
        return False