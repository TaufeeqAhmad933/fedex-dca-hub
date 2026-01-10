from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import cases, dcas, auth
from .utils.database import init_db
from fastapi import WebSocket
import asyncio

app = FastAPI(title="FedEx DCA Hub")

# Initialize dummy data on startup
@app.on_event("startup")
def startup_event():
    init_db()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(cases.router, tags=["Cases"])  # No prefix
app.include_router(dcas.router, tags=["DCAs"])  # Removed prefix="/dcas" so /dcas works directly

@app.get("/")
def root():
    return {"message": "FedEx DCA Hub API"}

# WebSocket for real-time updates and notifications (Feature 4: Real-Time Notifications)
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        await asyncio.sleep(30)  # Every 30 seconds for notifications
        cases_data = cases.get_cases()  # Fetch latest cases
        breaches = [c for c in cases_data if c['sla_breach']]
        if breaches:
            await websocket.send_json({"type": "notification", "message": f"SLA Breach Alert: {len(breaches)} cases overdue!"})
        else:
            await websocket.send_json({"type": "update", "data": cases_data})  # Regular update