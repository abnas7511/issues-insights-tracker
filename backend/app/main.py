from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os

from app.api.v1 import auth, users, issues, files, stats, notifications
from app.core.websocket import WebSocketManager
from app.database import engine
from app.models import Base
from app.core.config import settings



app = FastAPI(
    title="Issues & Insights Tracker API",
    description="A comprehensive issue tracking and insights platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket manager
websocket_manager = WebSocketManager()

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(issues.router, prefix="/api/v1/issues", tags=["issues"])
app.include_router(files.router, prefix="/api/v1/files", tags=["files"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["statistics"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])

# Static files for uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket_manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket_manager.send_personal_message(f"Message received: {data}", client_id)
    except WebSocketDisconnect:
        websocket_manager.disconnect(client_id)

@app.get("/")
async def root():
    return {"message": "Issues & Insights Tracker API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    # Create database tables
    Base.metadata.create_all(bind=engine)
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )