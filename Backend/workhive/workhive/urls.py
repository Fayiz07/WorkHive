from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from accounts.views import MeView, RegisterView, UpdateUserView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', MeView.as_view(), name='me'),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/update/<int:pk>/', UpdateUserView.as_view(), name='update_user'),
    path('api/employees/', include('employees.urls')),
    path('api/attendance/', include('attendance.urls')),
    path('api/leave/', include('leave.urls')),
    path('api/payroll/', include('payroll.urls')),
    path('api/performance/', include('performance.urls')),
    path('api/transactions/', include('transactions.urls')),
    path('api/hr-dashboard/', include('hr_dashboard.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)