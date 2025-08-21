from typing import Optional, List, Callable
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from core import settings
from db.database import get_db
from db import models


def parse_bearer(auth_header: Optional[str]) -> Optional[str]:
    if not auth_header:
        return None
    parts = auth_header.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_optional_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> Optional[models.User]:
    token = parse_bearer(authorization)
    if not token:
        return None
    payload = decode_token(token)
    user = db.query(models.User).filter(models.User.id == payload.get("sub")).first()
    return user


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> models.User:
    token = parse_bearer(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    payload = decode_token(token)
    user = db.query(models.User).filter(models.User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def require_roles(required: List[str]) -> Callable:
    def dependency(user: models.User = Depends(get_current_user)) -> models.User:
        user_roles = set((user.roles or []))
        # Admin overrides
        if user.isAdmin or ("admin" in user_roles):
            return user
        if not set(required).issubset(user_roles):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user

    return dependency
