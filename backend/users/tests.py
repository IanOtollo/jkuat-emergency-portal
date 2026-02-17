from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@jkuat.ac.ke',
            password='Password123!',
            full_name='System Admin',
            role='admin'
        )
        self.guard_user = User.objects.create_user(
            username='guard',
            email='guard@jkuat.ac.ke',
            password='Password123!',
            full_name='Security Guard',
            role='guard'
        )

    def test_login_success(self):
        url = reverse('token_obtain_pair')
        data = {
            'username': 'admin',
            'password': 'Password123!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['role'], 'admin')

    def test_login_invalid_credentials(self):
        url = reverse('token_obtain_pair')
        data = {
            'username': 'admin',
            'password': 'wrongpassword'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class UserPermissionTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username='admin', password='Password123!', role='admin', full_name='Admin'
        )
        self.supervisor = User.objects.create_user(
            username='supervisor', password='Password123!', role='supervisor', full_name='Supervisor'
        )
        self.guard = User.objects.create_user(
            username='guard', password='Password123!', role='guard', full_name='Guard'
        )

    def test_admin_can_list_all_users(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('user-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Handle pagination
        results = response.data['results'] if 'results' in response.data else response.data
        self.assertGreaterEqual(len(results), 3)

    def test_guard_can_only_see_themselves(self):
        self.client.force_authenticate(user=self.guard)
        url = reverse('user-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Handle pagination
        results = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['username'], 'guard')

    def test_only_admin_can_create_users(self):
        url = reverse('user-list')
        data = {
            'username': 'newuser',
            'password': 'Password123!',
            'password2': 'Password123!',
            'email': 'new@jkuat.ac.ke',
            'full_name': 'New User',
            'role': 'guard'
        }
        
        # Test guard cannot create
        self.client.force_authenticate(user=self.guard)
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Test admin can create
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
