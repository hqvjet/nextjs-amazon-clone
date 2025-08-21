from pydantic import BaseModel
from typing import Any, List, Optional

class UserRef(BaseModel):
    id: str

class ProductRef(BaseModel):
    id: str

class ItemRef(BaseModel):
    id: str
    quantity: int = 1

class OrderCreate(BaseModel):
    # Back-compat shape
    products: Optional[dict] = None  # { connect: [{id:.., quantity?:1}, ...] }
    # Preferred shape
    items: Optional[List[ItemRef]] = None
    user: Optional[UserRef] = None
    status: dict  # { paymentMode: 'stripe' | 'cash-on-delivery' }
    paymentIntent: Optional[str] = None
    price: Optional[float] = None

class OrderOut(BaseModel):
    id: str
    price: float
    status: Any
    paymentStatus: Optional[bool] = None
    products: List[dict]

class OrderPatch(BaseModel):
    paymentStatus: Optional[bool] = None
