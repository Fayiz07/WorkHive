from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, PromotionViewSet, EmployeeOfTheYearViewSet

router = DefaultRouter()
router.register('events', EventViewSet)
router.register('promotions', PromotionViewSet)
router.register('eoy', EmployeeOfTheYearViewSet)

urlpatterns = [
    path('', include(router.urls)),
]