from pydantic import BaseModel
from typing import Optional


class CommentCreate(BaseModel):
    productId: str
    content: str


class CommentOut(BaseModel):
    id: str
    productId: str
    userId: str
    username: str | None = None
    userDisplayName: str | None = None
    content: str
    createdAt: str
