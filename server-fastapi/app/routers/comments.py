from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db.database import get_db
from db import models
from schemas.comments import CommentCreate, CommentOut
from utils.auth import get_current_user
import uuid
from datetime import datetime


router = APIRouter(prefix="/comments")


def to_out(c: models.Comment) -> CommentOut:
    return CommentOut(
        id=c.id,
        productId=c.productId,
        userId=c.userId,
        content=c.content,
        createdAt=c.createdAt.isoformat(),
    )


@router.get("/product/{product_id}", response_model=List[CommentOut])
def list_comments(product_id: str, db: Session = Depends(get_db)):
    if not db.query(models.Product).filter(models.Product.id == product_id).first():
        raise HTTPException(status_code=404, detail="Product not found")
    rows = (
        db.query(models.Comment)
        .filter(models.Comment.productId == product_id)
        .order_by(models.Comment.createdAt.desc())
        .all()
    )
    return [to_out(r) for r in rows]


@router.post("/", response_model=CommentOut, status_code=201)
def create_comment(
    body: CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Confirm product exists
    if not db.query(models.Product).filter(models.Product.id == body.productId).first():
        raise HTTPException(status_code=404, detail="Product not found")
    c = models.Comment(
        id=str(uuid.uuid4()),
        productId=body.productId,
        userId=current_user.id,
        content=body.content,
        createdAt=datetime.utcnow(),
        updatedAt=datetime.utcnow(),
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return to_out(c)


@router.delete("/{comment_id}")
def delete_comment(
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    c = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    roles = set(current_user.roles or [])
    is_admin = current_user.isAdmin or ("admin" in roles)
    if not is_admin and c.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    db.delete(c)
    db.commit()
    return {"ok": True}
