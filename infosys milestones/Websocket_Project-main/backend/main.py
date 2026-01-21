"""
Chatterbox - Real-time WebSocket Chat Application
FastAPI Backend with Room Support, Typing Indicators, and Broadcasting
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Dict, List
import uvicorn
import json

app = FastAPI(title="Chatterbox Chat Server")

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionManager:
    """Manages WebSocket connections, rooms, and message broadcasting"""
    
    def __init__(self):
        # WebSocket -> room mapping
        self.active_connections: Dict[WebSocket, str] = {}
        # WebSocket -> username mapping
        self.usernames: Dict[WebSocket, str] = {}
        # Room -> list of typing users
        self.typing_users: Dict[str, List[str]] = {}
    
    async def connect(self, websocket: WebSocket, username: str, room: str):
        """Register a new user connection to a specific room"""
        self.active_connections[websocket] = room
        self.usernames[websocket] = username
        
        # Broadcast join notification
        await self.broadcast_system(
            room, 
            f"{username} joined the chat 👋",
            websocket
        )
        
        # Send room stats
        await self.send_room_stats(room)
    
    def disconnect(self, websocket: WebSocket):
        """Remove user from all tracking structures"""
        room = self.active_connections.get(websocket)
        username = self.usernames.get(websocket, "Someone")
        
        # Remove from typing indicators
        if room and room in self.typing_users:
            if username in self.typing_users[room]:
                self.typing_users[room].remove(username)
        
        # Remove from connection maps
        self.active_connections.pop(websocket, None)
        self.usernames.pop(websocket, None)
        
        return username, room
    
    async def broadcast_room(self, room: str, data: dict, sender: WebSocket = None):
        """Send message to all users in a specific room (optionally excluding sender)"""
        for ws, user_room in self.active_connections.items():
            if user_room == room:
                # Exclude sender if specified
                if sender is None or ws != sender:
                    try:
                        await ws.send_json(data)
                    except:
                        pass  # Handle disconnected clients gracefully
    
    async def broadcast_system(self, room: str, message: str, sender: WebSocket = None):
        """Send system notification to all users in a room"""
        await self.broadcast_room(
            room,
            {
                "type": "system",
                "message": message,
                "timestamp": datetime.now().strftime("%H:%M")
            },
            sender
        )
    
    async def send_room_stats(self, room: str):
        """Send online user count to all users in a room"""
        count = sum(1 for r in self.active_connections.values() if r == room)
        await self.broadcast_room(
            room,
            {
                "type": "stats",
                "online": count
            }
        )
    
    async def handle_typing(self, room: str, username: str, is_typing: bool):
        """Manage typing indicator state"""
        if room not in self.typing_users:
            self.typing_users[room] = []
        
        if is_typing:
            if username not in self.typing_users[room]:
                self.typing_users[room].append(username)
        else:
            if username in self.typing_users[room]:
                self.typing_users[room].remove(username)
        
        # Broadcast current typing users
        typing_list = [u for u in self.typing_users[room] if u != username]
        
        # Send to all users in room
        for ws, user_room in self.active_connections.items():
            if user_room == room:
                current_user = self.usernames.get(ws)
                # Send list excluding current user
                display_list = [u for u in typing_list]
                await ws.send_json({
                    "type": "typing",
                    "users": display_list
                })


manager = ConnectionManager()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "message": "Chatterbox WebSocket Chat Server",
        "version": "1.0.0",
        "features": [
            "Real-time messaging",
            "Multiple chat rooms",
            "Typing indicators",
            "Join/leave notifications"
        ]
    }


@app.get("/stats")
async def get_stats():
    """Get current server statistics"""
    rooms = {}
    for ws, room in manager.active_connections.items():
        rooms[room] = rooms.get(room, 0) + 1
    
    return {
        "total_connections": len(manager.active_connections),
        "rooms": rooms,
        "active_rooms": len(rooms)
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Main WebSocket endpoint for chat communication"""
    await websocket.accept()
    print("✓ Client connected (WebSocket accepted)")
    
    username = "Anonymous"
    room = "general"
    
    try:
        # First message MUST contain join info
        join_data = await websocket.receive_json()
        username = join_data.get("username", "Anonymous").strip() or "Anonymous"
        room = join_data.get("room", "general").strip() or "general"
        
        print(f"✓ User '{username}' joined room '{room}'")
        
        # Register connection
        await manager.connect(websocket, username, room)
        
        # Main message loop
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")
            
            if event_type == "chat":
                # Broadcast chat message
                message_text = data.get("message", "").strip()
                if message_text:
                    print(f"[{room}] {username}: {message_text}")
                    await manager.broadcast_room(
                        room,
                        {
                            "type": "chat",
                            "username": username,
                            "message": message_text,
                            "timestamp": datetime.now().strftime("%H:%M")
                        },
                        websocket
                    )
            
            elif event_type == "typing":
                # User started typing
                await manager.handle_typing(room, username, True)
            
            elif event_type == "stop_typing":
                # User stopped typing
                await manager.handle_typing(room, username, False)
    
    except WebSocketDisconnect:
        # Clean disconnect
        left_user, left_room = manager.disconnect(websocket)
        print(f"✗ User '{left_user}' disconnected from '{left_room}'")
        
        if left_room:
            await manager.broadcast_system(
                left_room,
                f"{left_user} left the chat 👋"
            )
            await manager.send_room_stats(left_room)
    
    except Exception as e:
        # Unexpected error
        left_user, left_room = manager.disconnect(websocket)
        print(f"✗ Error with user '{left_user}': {e}")
        
        if left_room:
            await manager.broadcast_system(
                left_room,
                f"{left_user} left the chat (connection error) ⚠️"
            )
            await manager.send_room_stats(left_room)


if __name__ == "__main__":
    print("=" * 50)
    print("🚀 Starting Chatterbox WebSocket Server")
    print("=" * 50)
    print("Server: http://localhost:8000")
    print("WebSocket: ws://localhost:8000/ws")
    print("Stats: http://localhost:8000/stats")
    print("=" * 50)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
