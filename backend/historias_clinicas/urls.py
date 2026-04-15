from rest_framework.routers import DefaultRouter
from .views import HistoriaClinicaViewSet

router = DefaultRouter()
router.register(r"historias", HistoriaClinicaViewSet, basename="historias")

urlpatterns = router.urls
