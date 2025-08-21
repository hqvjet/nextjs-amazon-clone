from pydantic import BaseModel
from typing import Optional

class CategoryIn(BaseModel):
    name: str

class CategoryOut(BaseModel):
    id: str
    name: str

class CategoryPatch(BaseModel):
    name: Optional[str] = None
