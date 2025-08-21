from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from pydantic import BaseModel
from typing import List, Optional
import uuid
from utils.auth import get_current_user

router = APIRouter(prefix="/addresses")


class AddressIn(BaseModel):
    line1: str
    line2: Optional[str] = None
    city: str
    state: Optional[str] = None
    postalCode: str
    country: str
    phone: Optional[str] = None
    isDefault: Optional[bool] = False
    userId: str

class AddressOut(AddressIn):
    id: str


@router.post("/", response_model=AddressOut, status_code=201)
def create_address(
    body: AddressIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    roles = set(current_user.roles or [])
    is_admin = current_user.isAdmin or ("admin" in roles)
    if not is_admin and body.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    addr = models.Address(id=str(uuid.uuid4()), **body.dict())
    if body.isDefault:
        db.query(models.Address).filter(models.Address.userId == body.userId).update({models.Address.isDefault: False})
    db.add(addr)
    db.commit()
    db.refresh(addr)
    return AddressOut(**{**body.dict(), "id": addr.id})


@router.get("/user/{user_id}", response_model=List[AddressOut])
def list_user_addresses(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    roles = set(current_user.roles or [])
    is_admin = current_user.isAdmin or ("admin" in roles)
    if not is_admin and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    rows = db.query(models.Address).filter(models.Address.userId == user_id).all()
    return [AddressOut(
        id=r.id,
        line1=r.line1,
        line2=r.line2,
        city=r.city,
        state=r.state,
        postalCode=r.postalCode,
        country=r.country,
        phone=r.phone,
        isDefault=r.isDefault,
        userId=r.userId,
    ) for r in rows]


@router.patch("/{id}", response_model=AddressOut)
def patch_address(
    id: str,
    body: AddressIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    r = db.query(models.Address).filter(models.Address.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    roles = set(current_user.roles or [])
    is_admin = current_user.isAdmin or ("admin" in roles)
    if not is_admin and r.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    data = body.dict(exclude_unset=True)
    if data.get("isDefault"):
        db.query(models.Address).filter(models.Address.userId == r.userId).update({models.Address.isDefault: False})
    for k,v in data.items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return AddressOut(
        id=r.id,
        line1=r.line1,
        line2=r.line2,
        city=r.city,
        state=r.state,
        postalCode=r.postalCode,
        country=r.country,
        phone=r.phone,
        isDefault=r.isDefault,
        userId=r.userId,
    )


@router.delete("/{id}")
def delete_address(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    r = db.query(models.Address).filter(models.Address.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    roles = set(current_user.roles or [])
    is_admin = current_user.isAdmin or ("admin" in roles)
    if not is_admin and r.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    db.delete(r)
    db.commit()
    return {"ok": True}
