from rest_framework import permissions

class IsAdminOperator(permissions.BasePermission):
    """
    Allows access only to users with the 'AdminOperator' role.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'AdminOperator'

class IsAdminBase(permissions.BasePermission):
    """
    Allows access only to users with the 'AdminBase' role.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'AdminBase'

class TrainingRecordPermission(permissions.BasePermission):
    """
    Custom permission for training records:
    - Administrators have full access.
    - AdminBase users can access records for personnel in their base.
    - Pessoal users can only access their own records.
    """
    def has_permission(self, request, view):
        allowed_roles = ['Administrator', 'AdminBase', 'Pessoal']
        return request.user.is_authenticated and request.user.role in allowed_roles

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'Administrator':
            return True
        if request.user.role == 'AdminBase':
            return obj.user.base == request.user.base and obj.user.role == 'Pessoal'
        if request.user.role == 'Pessoal':
            return obj.user == request.user
        return False

class TransportRequestPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        allowed_roles = ['Operador', 'AdminBase', 'Administrator']
        return request.user.is_authenticated and request.user.role in allowed_roles

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'Administrator':
            return True
        if request.user.role == 'Operador':
            return obj.requester == request.user
        if request.user.role == 'AdminBase':
            return obj.vehicle.base == request.user.base
        return False

class VehiclePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        allowed_roles = ['Administrator', 'AdminBase']
        return request.user.is_authenticated and request.user.role in allowed_roles

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'Administrator':
            return True
        if request.user.role == 'AdminBase':
            return obj.base == request.user.base
        return False

