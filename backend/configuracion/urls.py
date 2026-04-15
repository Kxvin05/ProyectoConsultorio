from django.contrib import admin
from django.urls import path, include
from .views import home
from .views_dashboard import dashboard_admin
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("", home),
    path('admin/', admin.site.urls),

    # JWT
    path('api/login/', TokenObtainPairView.as_view()),
    path('api/refresh/', TokenRefreshView.as_view()),

    # APIs
    path('api/usuarios/', include('usuarios.urls')),
    path('api/psicologos/', include('psicologos.urls')),
    path('api/pacientes/', include('pacientes.urls')),
    path('api/citas/', include('citas.urls')),
    path('api/historias_clinicas/', include('historias_clinicas.urls')),
    path('api/facturacion/', include('facturacion.urls')),
    path('api/notificaciones/', include('notificaciones.urls')),
    path("api/dashboard/admin/", dashboard_admin),
]
