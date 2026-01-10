from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from ..models import User, LoginRequest  # Added LoginRequest
import secrets

router = APIRouter()
security = HTTPBasic()

# Dummy users for RBAC (in production, use a real DB)
users_db = {
    "fedex_admin": {"password": "pass", "role": "fedex"},
    "dca_manager": {"password": "pass", "role": "dca"},
    "agent": {"password": "pass", "role": "agent"},
    "agent1": {"password": "pass", "role": "agent"},  # New
    "agent2": {"password": "pass", "role": "agent"}   # New
}

def authenticate(credentials: HTTPBasicCredentials = Depends(security)):
    username = credentials.username
    password = credentials.password
    if username not in users_db or users_db[username]["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"username": username, "role": users_db[username]["role"]}

@router.post("/login")
def login(request: LoginRequest):  # Changed to LoginRequest (no role)
    if request.username in users_db and users_db[request.username]["password"] == request.password:
        token = secrets.token_hex(16)  # Simple token (use JWT in production)
        return {"token": token, "role": users_db[request.username]["role"]}
    raise HTTPException(status_code=401, detail="Invalid username or password")