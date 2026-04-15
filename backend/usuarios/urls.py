from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')  

urlpatterns = [
    path('', include(router.urls)),
    path('login/', UsuarioViewSet.as_view({'post': 'login'})),
    path('registro_paciente/', UsuarioViewSet.as_view({'post': 'registro_paciente'})),         
    path('mi_perfil/', UsuarioViewSet.as_view({'get': 'mi_perfil'})),
    path('cambiar-contrasena/', UsuarioViewSet.as_view({'post': 'cambiar_contraseña'})),
    path('crear_psicologo/', UsuarioViewSet.as_view({'post': 'crear_psicologo'})),
    path('recuperar_password/', UsuarioViewSet.as_view({'post': 'recuperar_password'})),
    path('verificar_codigo/', UsuarioViewSet.as_view({'post': 'verificar_codigo'})),
    path('restablecer_password/', UsuarioViewSet.as_view({'post': 'restablecer_password'})),
]