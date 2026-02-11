from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IncidentViewSet, AuditLogViewSet, public_report_submit, public_report_status

router = DefaultRouter()
router.register(r'incidents', IncidentViewSet, basename='incident')
router.register(r'audit-logs', AuditLogViewSet, basename='auditlog')

urlpatterns = [
    path('', include(router.urls)),
    path('public/submit/', public_report_submit, name='public-report-submit'),
    path('public/status/<str:reference_number>/', public_report_status, name='public-report-status'),
]
