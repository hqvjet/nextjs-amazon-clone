from pydantic import BaseModel
from typing import Optional


class CommentCreate(BaseModel):
    productId: str
    content: str


class CommentOut(BaseModel):
    id: str
    productId: str
    userId: str
    content: str
    createdAt: str
