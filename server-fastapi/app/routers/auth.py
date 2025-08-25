from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from schemas.auth import Credentials, SignupCredentials, UserInfo, User
from core import settings
from passlib.context import CryptContext
from jose import jwt, JWTError
from typing import Optional
from pydantic import BaseModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timezone

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)


def create_token(user: models.User) -> str:
    # Include standard claims (sub, roles, username, exp)
    exp = int((datetime.now(timezone.utc) + settings.access_token_expires).timestamp())
    payload = {"sub": user.id, "username": user.username, "roles": user.roles or [], "exp": exp}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing token")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(models.User).filter(models.User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/me", response_model=User)
def me(current_user: models.User = Depends(get_current_user)):
    return User(
        id=current_user.id,
        username=current_user.username,
        isAdmin=current_user.isAdmin,
        firstName=current_user.firstName,
        lastName=current_user.lastName,
        roles=current_user.roles or [],
    )


@router.post("/login", response_model=UserInfo)
def login(body: Credentials, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == body.username).first()
    if not user or not pwd_context.verify(body.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return UserInfo(
        accessToken=create_token(user),
        id=user.id,
        roles=user.roles or [],
        username=user.username,
    )


@router.post("/signup", response_model=UserInfo)
def signup(body: SignupCredentials, db: Session = Depends(get_db)):
    # Basic input validation
    if not body.username or not body.password:
        raise HTTPException(status_code=400, detail="username and password are required")
    if body.accountType not in (None, "buyer", "seller"):
        raise HTTPException(status_code=400, detail="accountType must be 'buyer' or 'seller'")

    # Uniqueness checks
    existing = db.query(models.User).filter(models.User.username == body.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    import uuid

    # Assign roles smartly
    roles = ["buyer"] if (body.accountType or "buyer") == "buyer" else ["buyer", "seller"]

    user = models.User(
        id=str(uuid.uuid4()),
        username=body.username,
        password=pwd_context.hash(body.password),
        firstName=body.firstName,
        lastName=body.lastName,
        isAdmin=False,
        roles=roles,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # If seller requested, create SellerProfile with display name
    if "seller" in roles:
        display = body.sellerDisplayName or (body.firstName or body.username)
        # Ensure display name uniqueness (best-effort)
        existing_seller = (
            db.query(models.SellerProfile).filter(models.SellerProfile.displayName == display).first()
        )
        if existing_seller:
            display = f"{display}-{user.id[:6]}"
        seller = models.SellerProfile(id=str(uuid.uuid4()), userId=user.id, displayName=display)
        db.add(seller)
        db.commit()

    return UserInfo(accessToken=create_token(user), id=user.id, roles=user.roles or [], username=user.username)


class UpgradeToSellerBody(BaseModel):
    displayName: Optional[str] = None


@router.post("/upgrade-to-seller", response_model=UserInfo)
def upgrade_to_seller(
    body: UpgradeToSellerBody,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    roles = set(current_user.roles or [])
    if "seller" in roles:
        return UserInfo(
            accessToken=create_token(current_user),
            id=current_user.id,
            roles=current_user.roles or [],
            username=current_user.username,
        )
    roles.add("seller")
    current_user.roles = list(roles)
    existing = db.query(models.SellerProfile).filter(models.SellerProfile.userId == current_user.id).first()
    if not existing:
        display = body.displayName or (current_user.firstName or current_user.username)
        import uuid as _uuid
        sp = models.SellerProfile(id=str(_uuid.uuid4()), userId=current_user.id, displayName=display)
        db.add(sp)
    db.commit()
    db.refresh(current_user)
    return UserInfo(
        accessToken=create_token(current_user),
        id=current_user.id,
        roles=current_user.roles or [],
        username=current_user.username,
    )
