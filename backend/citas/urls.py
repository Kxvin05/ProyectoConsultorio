from rest_framework.routers import DefaultRouter
from .views import CitaViewSet
from .views import CalificacionViewSet

router = DefaultRouter()
router.register(r"citas", CitaViewSet, basename="citas")
router.register(r'calificaciones', CalificacionViewSet, basename='calificacion')

urlpatterns = router.urls
