from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from db.database import get_db
from db import models
from schemas.orders import OrderCreate, OrderOut, OrderPatch
from core import settings
import uuid
import stripe as stripe_sdk
from utils.auth import get_optional_user

router = APIRouter(prefix="/orders")


stripe = None
if settings.STRIPE_SECRET_KEY:
    stripe = stripe_sdk.StripeClient(settings.STRIPE_SECRET_KEY)


def product_to_dict(p: models.Product) -> dict:
    return {
        "id": p.id,
        "title": p.title,
        "discountPrice": p.discountPrice,
        "salePrice": p.salePrice,
        "description": p.description,
        "colors": p.colors,
        "images": p.images,
        "variants": p.variants,
        "category": {"id": p.categoryId},
    }


@router.post("/", response_model=dict)
def create_order(
    body: OrderCreate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_user),
):
    client_secret = ""
    payment_intent = ""
    if body.status and body.status.get("paymentMode") == "stripe" and settings.STRIPE_SECRET_KEY:
        s = stripe_sdk.StripeClient(settings.STRIPE_SECRET_KEY)
        pi = s.payment_intents.create(
            amount=int(body.price * 100),
            currency="usd",
            automatic_payment_methods={"enabled": True},
        )
        payment_intent = pi["id"] if isinstance(pi, dict) else pi.id
        client_secret = pi["client_secret"] if isinstance(pi, dict) else pi.client_secret

    user_id = current_user.id if current_user else (body.user.id if body.user else None)
    order = models.Order(
        id=str(uuid.uuid4()),
        paymentIntent=payment_intent,
        paymentStatus=False,
        price=body.price or 0.0,
        status=body.status,
        userId=user_id,
    )
    db.add(order)
    # Build items list (support both legacy products.connect and new items)
    connect_list = (body.products or {}).get("connect", []) if body.products else []
    # normalize to [{id, quantity}]
    items = [{"id": it.get("id"), "quantity": max(1, int(it.get("quantity", 1)))} for it in connect_list]
    if body.items:
        items.extend([{"id": it.id, "quantity": max(1, int(it.quantity))} for it in body.items])

    # Merge duplicate ids, sum quantities
    from collections import defaultdict

    qty_map: dict[str, int] = defaultdict(int)
    for it in items:
        if it.get("id"):
            qty_map[it["id"]] += it.get("quantity", 1)

    product_ids = list(qty_map.keys())
    products = (
        db.query(models.Product).filter(models.Product.id.in_(product_ids)).all() if product_ids else []
    )

    # Map for quick lookup
    pm = {p.id: p for p in products}
    missing = [pid for pid in product_ids if pid not in pm]
    if missing:
        raise HTTPException(status_code=400, detail=f"Unknown product ids: {', '.join(missing)}")

    total = 0.0
    for pid, qty in qty_map.items():
        p = pm[pid]
        unit = p.discountPrice if p.discountPrice is not None else p.salePrice
        inv = db.query(models.Inventory).filter(models.Inventory.productId == pid).first()
        if inv and inv.stock < qty:
            raise HTTPException(status_code=409, detail=f"Insufficient stock for product {pid}")
        oi = models.OrderItem(
            id=str(uuid.uuid4()), orderId=order.id, productId=pid, quantity=qty, unitPrice=unit
        )
        db.add(oi)
        if inv:
            inv.stock -= qty
        total += unit * qty
        order.products.append(p)

    # Compute price if not provided or if negative/zero
    if not body.price or body.price <= 0:
        order.price = total
    db.commit()
    return {"client_secret": client_secret}


@router.get("/", response_model=List[OrderOut])
def list_orders(request: Request, db: Session = Depends(get_db)):
    from fastapi import Request  # type: ignore

    qp = request.query_params
    q = db.query(models.Order)
    pay_intent = qp.get("where[paymentIntent]")
    if pay_intent:
        q = q.filter(models.Order.paymentIntent == pay_intent)
    user_id = qp.get("where[user][id]")
    if user_id:
        q = q.filter(models.Order.userId == user_id)
    rows = q.all()
    return [
        OrderOut(
            id=r.id,
            price=r.price,
            status=r.status,
            paymentStatus=r.paymentStatus,
            products=[product_to_dict(p) for p in r.products],
        )
        for r in rows
    ]


@router.get("/{id}", response_model=OrderOut)
def get_order(id: str, db: Session = Depends(get_db)):
    r = db.query(models.Order).filter(models.Order.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    return OrderOut(
        id=r.id,
        price=r.price,
        status=r.status,
        paymentStatus=r.paymentStatus,
        products=[product_to_dict(p) for p in r.products],
    )


@router.patch("/{id}", response_model=OrderOut)
def patch_order(id: str, body: OrderPatch, db: Session = Depends(get_db)):
    r = db.query(models.Order).filter(models.Order.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    if body.paymentStatus is not None:
        r.paymentStatus = body.paymentStatus
    db.commit()
    db.refresh(r)
    return OrderOut(
        id=r.id,
        price=r.price,
        status=r.status,
        paymentStatus=r.paymentStatus,
        products=[product_to_dict(p) for p in r.products],
    )
