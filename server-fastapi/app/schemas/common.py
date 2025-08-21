from pydantic import BaseModel
from typing import Any, Optional

class Message(BaseModel):
    message: str

class IdModel(BaseModel):
    id: str

class Meta(BaseModel):
    count: int

class JSONValue(BaseModel):
    __root__: Any

class UserRef(BaseModel):
    id: str
