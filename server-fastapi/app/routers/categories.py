from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from typing import List
from schemas.categories import CategoryIn, CategoryOut, CategoryPatch

# Add explicit prefix including /api to eliminate mismatched client paths and avoid redirect chains
router = APIRouter(prefix="/api/categories")


@router.post("/", response_model=CategoryOut, status_code=201)
def create_category(body: CategoryIn, db: Session = Depends(get_db)):
    import uuid

    cat = models.Category(id=str(uuid.uuid4()), name=body.name)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return CategoryOut(id=cat.id, name=cat.name)


@router.get("/", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    rows = db.query(models.Category).all()
    return [CategoryOut(id=r.id, name=r.name) for r in rows]


@router.get("/{id}", response_model=CategoryOut)
def get_category(id: str, db: Session = Depends(get_db)):
    r = db.query(models.Category).filter(models.Category.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    return CategoryOut(id=r.id, name=r.name)


@router.patch("/{id}", response_model=CategoryOut)
def patch_category(id: str, body: CategoryPatch, db: Session = Depends(get_db)):
    r = db.query(models.Category).filter(models.Category.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    if body.name is not None:
        r.name = body.name
    db.commit()
    db.refresh(r)
    return CategoryOut(id=r.id, name=r.name)


@router.delete("/{id}")
def delete_category(id: str, db: Session = Depends(get_db)):
    r = db.query(models.Category).filter(models.Category.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(r)
    db.commit()
    return {"ok": True}
