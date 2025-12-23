from fastapi import Depends, HTTPException, status
from app.core.dependencies import get_current_user
from app.db.models.user import User

SUBSCRIPTION_ORDER = {
    "free": 0,
    "basic": 1,
    "pro": 2,
    "max": 3
}

def require_role(*allowed_roles: str):
    def checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires role in {allowed_roles}",
            )
        return user

    return checker

def require_subscription(min_level: str):
    def checker(user: User = Depends(get_current_user)) -> User:
        required = SUBSCRIPTION_ORDER.get(min_level)
        current = SUBSCRIPTION_ORDER.get(user.subscription_level, -1)

        if required is None:
            raise HTTPException(status_code=500, detail="Invalid subscription configuration")

        if current < required:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {min_level} subscription",
            )
        return user
    return checker
