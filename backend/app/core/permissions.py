from functools import wraps
from fastapi import HTTPException, status
from app.enums import Role
from app.models.user import User


def require_roles(*allowed_roles: Role):
    """
    Decorator to enforce role-based access control.
    
    Usage:
        @router.post("/endpoint")
        @require_roles(Role.SUPPLIER_OWNER, Role.SUPPLIER_MANAGER)
        def my_endpoint(current_user: User = Depends(auth_bearer)):
            ...
    """
    def decorator(endpoint):
        @wraps(endpoint)
        async def async_wrapper(*args, current_user: User, **kwargs):
            if current_user.role not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied for role {current_user.role.value}. Required: {[r.value for r in allowed_roles]}"
                )
            return await endpoint(*args, current_user=current_user, **kwargs)
        
        @wraps(endpoint)
        def sync_wrapper(*args, current_user: User, **kwargs):
            if current_user.role not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied for role {current_user.role.value}. Required: {[r.value for r in allowed_roles]}"
                )
            return endpoint(*args, current_user=current_user, **kwargs)
        
        # Return async wrapper for async endpoints, sync for sync
        import inspect
        if inspect.iscoroutinefunction(endpoint):
            return async_wrapper
        return sync_wrapper
    
    return decorator


def require_consumer(current_user: User):
    """Helper to check if user is a consumer"""
    if current_user.role != Role.CONSUMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only consumers can perform this action"
        )


def require_supplier_owner(current_user: User):
    """Helper to check if user is a supplier owner"""
    if current_user.role != Role.SUPPLIER_OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only supplier owners can perform this action"
        )


def require_supplier_owner_or_manager(current_user: User):
    """Helper to check if user is supplier owner or manager"""
    if current_user.role not in [Role.SUPPLIER_OWNER, Role.SUPPLIER_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only supplier owners or managers can perform this action"
        )

