from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import User
from .serializers import UserSerializer, UserCreateSerializer, UserDetailSerializer
from incidents.models import AuditLog

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'full_name': self.user.full_name,
            'role': self.user.role,
        }
        
        # Log login
        AuditLog.objects.create(
            user=self.user,
            action='login',
            entity_type='user',
            entity_id=self.user.id,
            description=f'User {self.user.username} logged in'
        )
        
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action == 'retrieve':
            return UserDetailSerializer
        return UserSerializer
    
    def get_queryset(self):
        # Supervisors and above can see all users
        if self.request.user.role in ['supervisor', 'head', 'admin']:
            return User.objects.all()
        # Guards can only see themselves
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def guards(self, request):
        """Get all security guards for assignment"""
        guards = User.objects.filter(role='guard', active=True)
        serializer = self.get_serializer(guards, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        # Only admins can create users
        if request.user.role != 'admin':
            return Response(
                {'error': 'Only administrators can create users'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        response = super().create(request, *args, **kwargs)
        
        # Log user creation
        AuditLog.objects.create(
            user=request.user,
            action='create',
            entity_type='user',
            description=f'Created user {request.data.get("username")}'
        )
        
        return response
