from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from db.database import get_db
from db import models
from schemas.products import ProductCreate, ProductOut, ProductPatch
from utils.auth import require_roles, get_current_user
from schemas.comments import CommentOut
import uuid

router = APIRouter(prefix="/products")


def to_out(p: models.Product) -> ProductOut:
    return ProductOut(
        id=p.id,
        title=p.title,
        discountPrice=p.discountPrice,
        salePrice=p.salePrice,
        description=p.description,
        colors=p.colors,
        images=p.images,
        variants=p.variants,
        category={"id": p.categoryId},
    )


@router.post("/", response_model=ProductOut, status_code=201)
def create_product(
    body: ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["seller"])),
):
    cat_id = body.category.get("id") if body.category else None
    if not cat_id:
        raise HTTPException(status_code=400, detail="category.id required")
    m = models.Product(
        id=str(uuid.uuid4()),
        title=body.title,
        discountPrice=body.discountPrice,
        salePrice=body.salePrice,
        description=body.description,
        colors=body.colors,
        images=body.images,
        variants=body.variants,
        categoryId=cat_id,
    )
    db.add(m)
    db.commit()
    # ensure inventory row exists
    if not db.query(models.Inventory).filter(models.Inventory.productId == m.id).first():
        db.add(models.Inventory(productId=m.id, stock=0))
        db.commit()
    # Link product to seller
    seller = db.query(models.SellerProfile).filter(models.SellerProfile.userId == current_user.id).first()
    if not seller:
        raise HTTPException(status_code=400, detail="Seller profile not found for user")
    db.add(models.SellerProduct(id=str(uuid.uuid4()), sellerId=seller.id, productId=m.id))
    db.commit()
    db.refresh(m)
    return to_out(m)


@router.get("/", response_model=List[ProductOut])
def list_products(request: Request, db: Session = Depends(get_db)):
    q = db.query(models.Product)
    qp = request.query_params
    # Support qs-like nested params: where[title][contains], where[category][id]
    title_contains = qp.get("where[title][contains]")
    if title_contains:
        q = q.filter(models.Product.title.ilike(f"%{title_contains}%"))
    category_id = qp.get("where[category][id]")
    if category_id:
        q = q.filter(models.Product.categoryId == category_id)

    return [to_out(p) for p in q.all()]


@router.get("/{id}", response_model=ProductOut)
def get_product(id: str, db: Session = Depends(get_db)):
    p = db.query(models.Product).filter(models.Product.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    return to_out(p)


@router.get("/{id}/comments", response_model=List[CommentOut])
def list_product_comments_public(id: str, db: Session = Depends(get_db)):
    p = db.query(models.Product).filter(models.Product.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    rows = (
        db.query(models.Comment)
        .filter(models.Comment.productId == id)
        .order_by(models.Comment.createdAt.desc())
        .all()
    )
    return [
        CommentOut(
            id=c.id,
            productId=c.productId,
            userId=c.userId,
            content=c.content,
            createdAt=c.createdAt.isoformat(),
        )
        for c in rows
    ]


@router.patch("/{id}", response_model=ProductOut)
def patch_product(
    id: str,
    body: ProductPatch,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    p = db.query(models.Product).filter(models.Product.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    # Authorization: admin or owning seller only
    sp = db.query(models.SellerProduct).filter(models.SellerProduct.productId == id).first()
    roles = set(current_user.roles or [])
    is_admin = current_user.isAdmin or ("admin" in roles)
    if not is_admin:
        seller = db.query(models.SellerProfile).filter(models.SellerProfile.userId == current_user.id).first()
        if not seller or not sp or sp.sellerId != seller.id:
            raise HTTPException(status_code=403, detail="Not allowed")
    for field in [
        "title",
        "discountPrice",
        "salePrice",
        "description",
        "colors",
        "images",
        "variants",
    ]:
        val = getattr(body, field)
        if val is not None:
            setattr(p, field, val)
    if body.category and body.category.get("id"):
        p.categoryId = body.category["id"]
    db.commit()
    db.refresh(p)
    return to_out(p)


@router.delete("/{id}")
def delete_product(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    p = db.query(models.Product).filter(models.Product.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    # Authorization: admin or owning seller only
    sp = db.query(models.SellerProduct).filter(models.SellerProduct.productId == id).first()
    roles = set(current_user.roles or [])
    is_admin = current_user.isAdmin or ("admin" in roles)
    if not is_admin:
        seller = db.query(models.SellerProfile).filter(models.SellerProfile.userId == current_user.id).first()
        if not seller or not sp or sp.sellerId != seller.id:
            raise HTTPException(status_code=403, detail="Not allowed")
    db.delete(p)
    db.commit()
    return {"ok": True}
