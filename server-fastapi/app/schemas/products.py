from pydantic import BaseModel
from typing import Any, List, Optional

class ProductBase(BaseModel):
    title: str
    discountPrice: float
    salePrice: float
    description: Any
    colors: Any
    images: Any
    variants: Any
    category: dict

class ProductCreate(ProductBase):
    pass

class ProductOut(BaseModel):
    id: str
    title: str
    discountPrice: float
    salePrice: float
    description: Any
    colors: Any
    images: Any
    variants: Any
    category: dict

class ProductPatch(BaseModel):
    title: Optional[str] = None
    discountPrice: Optional[float] = None
    salePrice: Optional[float] = None
    description: Optional[Any] = None
    colors: Optional[Any] = None
    images: Optional[Any] = None
    variants: Optional[Any] = None
    category: Optional[dict] = None
