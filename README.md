# JKUAT Emergency Incident Communication Platform

A comprehensive web-based incident management system for JKUAT Security Department.

## Features

### Security Personnel Dashboard
- Digital incident logging with automatic timestamping and reference numbering
- Role-based access control (Guard, Supervisor, Head of Security, Admin)
- Incident assignment and tracking
- Evidence upload (photos/PDFs)
- Real-time status updates
- Comprehensive audit trails
- Search and filtering capabilities

### Public Reporting Portal
- Student/staff self-service incident reporting
- Anonymous reporting option
- Report status tracking via reference number
- Simple, mobile-responsive interface

### Analytics & Reporting
- Dashboard statistics
- Incident trend analysis
- Type and severity distribution charts
- Location-based analytics

## Tech Stack

### Backend
- Django 6.0
- Django REST Framework
- PostgreSQL/SQLite
- JWT Authentication
- CORS support

### Frontend
- React 18
- Vite
- React Router
- TanStack Query
- Recharts (analytics)
- Lucide React (icons)

## Installation

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install --break-system-packages django djangorestframework django-cors-headers pillow psycopg2-binary python-decouple djangorestframework-simplejwt
```

3. Run migrations:
```bash
python3 manage.py makemigrations
python3 manage.py migrate
```

4. Seed database with sample data:
```bash
python3 manage.py seed_data
```

5. Start development server:
```bash
python3 manage.py runserver
```

Backend will run on http://localhost:8000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on http://localhost:5173

## Default Users

After running `seed_data`, you can login with:

- **Admin**: username=`admin`, password=`admin123`
- **Head of Security**: username=`head_security`, password=`pass123`
- **Supervisor**: username=`supervisor1`, password=`pass123`
- **Guards**: username=`guard1/guard2/guard3`, password=`pass123`

## Project Structure

```
jkuat-incident-system/
├── backend/
│   ├── incident_system/       # Django project settings
│   ├── users/                 # User management app
│   ├── incidents/             # Incident management app
│   ├── analytics/             # Analytics app
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React context
│   │   ├── pages/            # Page components
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login/` - Login
- `POST /api/auth/refresh/` - Refresh token

### Incidents
- `GET /api/incidents/` - List incidents
- `POST /api/incidents/` - Create incident
- `GET /api/incidents/{id}/` - Get incident details
- `PATCH /api/incidents/{id}/` - Update incident
- `POST /api/incidents/{id}/add_note/` - Add note
- `POST /api/incidents/{id}/upload_evidence/` - Upload evidence
- `GET /api/incidents/dashboard_stats/` - Get statistics

### Public
- `POST /api/public/submit/` - Submit public report
- `GET /api/public/status/{ref}/` - Check report status

### Users
- `GET /api/users/` - List users
- `GET /api/users/me/` - Get current user
- `GET /api/users/guards/` - List guards

## Features by Role

### Security Guard
- Create incidents
- View assigned incidents
- Update incident status
- Add notes and evidence
- View dashboard statistics

### Security Supervisor
- All guard features
- View all incidents
- Assign incidents to guards
- Access basic analytics

### Head of Security / Admin
- All supervisor features
- Advanced analytics and reporting
- User management (admin only)
- Audit log access
- System configuration

## Database Models

### Users
- Custom user model extending Django's AbstractUser
- Roles: guard, supervisor, head, admin
- Tracks full name, phone, active status

### Incidents
- Reference number (auto-generated)
- Type, title, description
- Location details with optional coordinates
- Status tracking (pending → assigned → in_progress → resolved → closed)
- Severity levels (low, medium, high)
- Assignment tracking
- Public report flag

### Evidence
- File storage for photos and PDFs
- Metadata tracking
- User attribution

### Audit Logs
- Comprehensive activity tracking
- User actions, timestamps
- IP address and user agent
- Immutable records

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- HTTPS encryption
- CSRF protection
- SQL injection prevention
- File upload validation
- Audit trail for all actions

## Development

### Running Tests
```bash
cd backend
python3 manage.py test
```

### Creating Superuser
```bash
python3 manage.py createsuperuser
```

### Accessing Admin Panel
Visit http://localhost:8000/admin with superuser credentials

## Deployment

### Production Considerations

1. Update `DEBUG = False` in settings.py
2. Set secure `SECRET_KEY`
3. Configure PostgreSQL database
4. Set allowed hosts
5. Enable HTTPS
6. Configure static/media file serving
7. Set up regular backups
8. Configure logging

### Environment Variables
Create `.env` file:
```
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost/dbname
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

## Future Enhancements

- SMS/Email notifications
- Mobile app (React Native)
- Real-time updates (WebSockets)
- CCTV integration
- GIS mapping for campus locations
- Advanced reporting with PDF generation
- Integration with university systems
- Multi-language support

## Support

For issues and questions, contact:
- Email: support@jkuat.ac.ke
- Phone: 0700-000-000

## License

Proprietary - JKUAT Security Department
