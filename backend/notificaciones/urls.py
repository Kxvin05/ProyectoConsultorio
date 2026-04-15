from rest_framework.routers import DefaultRouter
from .views import NotificacionViewSet, MensajeViewSet, ConversacionViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r"notificaciones", NotificacionViewSet, basename="notificaciones")
router.register(r"mensajes", MensajeViewSet, basename="mensajes")
router.register(r"conversaciones", ConversacionViewSet, basename="conversaciones")

urlpatterns = router.urls
