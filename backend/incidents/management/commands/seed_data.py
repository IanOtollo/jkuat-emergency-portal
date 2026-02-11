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
        
        # Create sample incidents
        if Incident.objects.count() == 0:
            incident_types = ['theft', 'suspicious', 'vandalism', 'facility', 'noise']
            locations = [
                'Main Library', 'Student Hostels Block A', 'Computer Lab Building',
                'Engineering Workshop', 'Sports Complex', 'Main Gate',
                'Cafeteria', 'Lecture Hall 3', 'Admin Block'
            ]
            
            statuses = ['pending', 'assigned', 'in_progress', 'resolved']
            severities = ['low', 'medium', 'high']
            
            for i in range(20):
                incident_type = random.choice(incident_types)
                created_date = datetime.now() - timedelta(days=random.randint(0, 30))
                
                incident = Incident.objects.create(
                    incident_type=incident_type,
                    title=f'Sample {incident_type} incident #{i+1}',
                    description=f'This is a sample incident for testing purposes. Incident type: {incident_type}',
                    location_building=random.choice(locations),
                    location_floor=f'Floor {random.randint(1, 5)}',
                    status=random.choice(statuses),
                    severity=random.choice(severities),
                    reported_by=supervisor if i % 3 == 0 else random.choice(guards) if guards else None,
                    assigned_to=random.choice(guards) if guards and i % 2 == 0 else None,
                )
                incident.created_at = created_date
                incident.save()
                
                if incident.status == 'resolved':
                    incident.resolved_at = created_date + timedelta(hours=random.randint(1, 48))
                    incident.save()
            
            self.stdout.write(self.style.SUCCESS(f'Created 20 sample incidents'))
        
        self.stdout.write(self.style.SUCCESS('Database seeding completed!'))
        self.stdout.write('\nLogin credentials:')
        self.stdout.write('Admin: username=admin, password=admin123')
        self.stdout.write('Head: username=head_security, password=pass123')
        self.stdout.write('Supervisor: username=supervisor1, password=pass123')
        self.stdout.write('Guards: username=guard1/guard2/guard3, password=pass123')
