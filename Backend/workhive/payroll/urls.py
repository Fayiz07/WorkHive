from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PayrollViewSet

router = DefaultRouter()
router.register('', PayrollViewSet)

urlpatterns = [
    path('', include(router.urls)),
]