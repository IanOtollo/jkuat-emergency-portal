from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """Allows access only to admin users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')

class IsHeadOfSecurity(permissions.BasePermission):
    """Allows access only to Head of Security and Admins."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['head', 'admin'])

class IsSupervisorUser(permissions.BasePermission):
    """Allows access to Supervisors, Head of Security, and Admins."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['supervisor', 'head', 'admin'])

class IsSecurityGuard(permissions.BasePermission):
    """Allows access only to security guards (and staff/admin)."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'guard' or request.user.is_staff))
