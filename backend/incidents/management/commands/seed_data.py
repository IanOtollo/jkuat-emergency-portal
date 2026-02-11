from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from incidents.models import Incident
from datetime import datetime, timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')
        
        # Create admin user
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@jkuat.ac.ke',
                password='admin123',
                full_name='System Administrator',
                role='admin'
            )
            self.stdout.write(self.style.SUCCESS(f'Created admin user'))
        
        # Create head of security
        if not User.objects.filter(username='head_security').exists():
            head = User.objects.create_user(
                username='head_security',
                email='head@jkuat.ac.ke',
                password='pass123',
                full_name='Brian Indimuli',
                role='head'
            )
            self.stdout.write(self.style.SUCCESS(f'Created head of security'))
        
        # Create supervisor
        if not User.objects.filter(username='supervisor1').exists():
            supervisor = User.objects.create_user(
                username='supervisor1',
                email='supervisor@jkuat.ac.ke',
                password='pass123',
                full_name='John Kamau',
                role='supervisor',
                phone='0712345678'
            )
            self.stdout.write(self.style.SUCCESS(f'Created supervisor'))
        
        # Create guards
        guards_data = [
            {'username': 'guard1', 'name': 'Peter Omondi', 'phone': '0723456789'},
            {'username': 'guard2', 'name': 'Mary Wanjiru', 'phone': '0734567890'},
            {'username': 'guard3', 'name': 'James Mwangi', 'phone': '0745678901'},
        ]
        
        guards = []
        for guard_data in guards_data:
            if not User.objects.filter(username=guard_data['username']).exists():
                guard = User.objects.create_user(
                    username=guard_data['username'],
                    email=f"{guard_data['username']}@jkuat.ac.ke",
                    password='pass123',
                    full_name=guard_data['name'],
                    role='guard',
                    phone=guard_data['phone']
                )
                guards.append(guard)
                self.stdout.write(self.style.SUCCESS(f'Created guard: {guard.full_name}'))
        
        # Create sample incidents (Skipped for clean production setup)
        # if Incident.objects.count() == 0:
        #     ...
        
        self.stdout.write(self.style.SUCCESS('Database seeding completed!'))
        self.stdout.write('\nLogin credentials:')
        self.stdout.write('Admin: username=admin, password=admin123')
        self.stdout.write('Head: username=head_security, password=pass123')
        self.stdout.write('Supervisor: username=supervisor1, password=pass123')
        self.stdout.write('Guards: username=guard1/guard2/guard3, password=pass123')
