from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PsicologoViewSet, HorarioPsicologoViewSet

router = DefaultRouter()
router.register(r'psicologos', PsicologoViewSet)
router.register(r'horarios', HorarioPsicologoViewSet)

urlpatterns = [
    path('', include(router.urls))
]