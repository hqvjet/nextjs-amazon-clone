from pydantic import BaseModel, Field
from typing import List, Optional
from typing import Literal

class Credentials(BaseModel):
    username: str
    password: str

class SignupCredentials(Credentials):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    # Desired account type at signup: buyer (default) or seller
    accountType: Optional[Literal["buyer", "seller"]] = "buyer"
    # Optional seller display name (used when accountType == "seller")
    sellerDisplayName: Optional[str] = None

class UserInfo(BaseModel):
    accessToken: Optional[str] = None
    id: str
    roles: List[str]
    username: str

class User(BaseModel):
    id: str
    username: str
    isAdmin: Optional[bool] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    roles: List[str] = Field(default_factory=list)
