from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from pydantic import BaseModel
from typing import Optional
from utils.auth import get_current_user

router = APIRouter(prefix="/inventory")


class InventoryPatch(BaseModel):
    stock: int


@router.get("/{product_id}")
def get_stock(product_id: str, db: Session = Depends(get_db)):
    inv = db.query(models.Inventory).filter(models.Inventory.productId == product_id).first()
    return {"productId": product_id, "stock": inv.stock if inv else 0}


@router.patch("/{product_id}")
def update_stock(
    product_id: str,
    body: InventoryPatch,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Authorization: admin or owning seller can update
    roles = set(current_user.roles or [])
    is_admin = current_user.isAdmin or ("admin" in roles)
    if not is_admin:
        sp = db.query(models.SellerProduct).filter(models.SellerProduct.productId == product_id).first()
        seller = db.query(models.SellerProfile).filter(models.SellerProfile.userId == current_user.id).first()
        if not seller or not sp or sp.sellerId != seller.id:
            raise HTTPException(status_code=403, detail="Not allowed")

    inv = db.query(models.Inventory).filter(models.Inventory.productId == product_id).first()
    if not inv:
        inv = models.Inventory(productId=product_id, stock=body.stock)
        db.add(inv)
    else:
        inv.stock = body.stock
    db.commit()
    return {"productId": product_id, "stock": inv.stock}
