from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from db import models
from schemas.products import ProductOut


router = APIRouter(prefix="/sellers")


def product_to_out(p: models.Product) -> ProductOut:
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


@router.get("/{email}/products", response_model=List[ProductOut])
def list_products_by_seller_email(email: str, db: Session = Depends(get_db)):
    # Find user by username (email)
    user = db.query(models.User).filter(models.User.username == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Seller user not found")

    # Find seller profile
    seller = (
        db.query(models.SellerProfile)
        .filter(models.SellerProfile.userId == user.id)
        .first()
    )
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found")

    # Find product links
    links = (
        db.query(models.SellerProduct)
        .filter(models.SellerProduct.sellerId == seller.id)
        .all()
    )
    product_ids = [l.productId for l in links]
    if not product_ids:
        return []

    products = (
        db.query(models.Product)
        .filter(models.Product.id.in_(product_ids))
        .all()
    )
    return [product_to_out(p) for p in products]
