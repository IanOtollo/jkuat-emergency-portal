from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Incident, PublicReport, AuditLog

User = get_user_model()

class IncidentTests(APITestCase):
    def setUp(self):
        self.supervisor = User.objects.create_user(
            username='supervisor', password='password', role='supervisor', full_name='Supervisor'
        )
        self.guard = User.objects.create_user(
            username='guard', password='password', role='guard', full_name='Guard'
        )
        self.other_guard = User.objects.create_user(
            username='other_guard', password='password', role='guard', full_name='Other Guard'
        )
        self.incident = Incident.objects.create(
            incident_type='theft',
            title='Test Theft',
            description='Someone stole a laptop',
            location_building='Engineering Block',
            reported_by=self.guard,
            assigned_to=self.guard,
            severity='medium',
            status='assigned'
        )

    def test_supervisor_can_list_all_incidents(self):
        self.client.force_authenticate(user=self.supervisor)
        url = reverse('incident-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_guard_can_only_see_their_incidents(self):
        self.client.force_authenticate(user=self.other_guard)
        url = reverse('incident-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Results is paginated
        self.assertEqual(len(response.data['results']), 0)

    def test_incident_assignment_logs_audit(self):
        self.client.force_authenticate(user=self.supervisor)
        url = reverse('incident-assign', args=[self.incident.id])
        data = {'officer_id': self.other_guard.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check audit log
        audit = AuditLog.objects.filter(action='assign', entity_id=self.incident.id).first()
        self.assertIsNotNone(audit)
        self.assertIn('Assigned incident', audit.description)

class PublicPortalTests(APITestCase):
    def test_public_report_submission(self):
        url = reverse('public-report-submit')
        data = {
            'incident_type': 'vandalism',
            'description': 'Someone broke a window in the lab',
            'location_building': 'Science Building',
            'reporter_name': 'John Doe',
            'is_anonymous': False
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('reference_number', response.data)
        
        # Verify incident was created
        incident = Incident.objects.filter(incident_type='vandalism').first()
        self.assertIsNotNone(incident)
        self.assertTrue(incident.is_public_report)

    def test_public_report_status_tracking(self):
        report = PublicReport.objects.create(
            incident_type='noise',
            description='Loud party',
            location_building='Hostel A',
            is_anonymous=True
        )
        url = reverse('public-report-status', args=[report.reference_number])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'received')

class AuditLogPermissionsTests(APITestCase):
    def setUp(self):
        self.supervisor = User.objects.create_user(
            username='super', password='password', role='supervisor', full_name='Super'
        )
        self.guard = User.objects.create_user(
            username='guard', password='password', role='guard', full_name='Guard'
        )
        AuditLog.objects.create(user=self.supervisor, action='login', entity_type='user', description='Logged in')

    def test_only_supervisor_can_view_audit_logs(self):
        url = reverse('auditlog-list')
        
        # Guard fails
        self.client.force_authenticate(user=self.guard)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Supervisor succeeds
        self.client.force_authenticate(user=self.supervisor)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 1)
