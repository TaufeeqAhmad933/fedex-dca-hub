from pydantic import BaseModel
from typing import Optional

class Case(BaseModel):
    id: int
    account_age: int
    amount_owed: float
    payment_history: float
    location: str
    shipment_frequency: int
    pps: Optional[float] = None
    tier: Optional[str] = None

class DCA(BaseModel):
    id: int
    name: str
    recovery_rate: float
    sla_compliance: float
    closure_time: float
    feedback_score: float
    dps: Optional[float] = None
    tier: Optional[str] = None

class User(BaseModel):
    username: str
    password: str
    role: str  # 'fedex', 'dca', 'agent'

class LoginRequest(BaseModel):  # New model for login (no role needed)
    username: str
    password: str