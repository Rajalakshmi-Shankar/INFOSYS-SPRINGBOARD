from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import uvicorn

app = FastAPI()


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.usernames: dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, username: str):
        self.active_connections.append(websocket)
        self.usernames[websocket] = username
        await self.broadcast_system(f"{username} joined the chat 👋")

    def disconnect(self, websocket: WebSocket):
        username = self.usernames.get(websocket, "Someone")
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        self.usernames.pop(websocket, None)
        return username

    async def broadcast_chat(self, username: str, message: str):
        data = {
            "type": "chat",
            "username": username,
            "message": message
        }
        for conn in self.active_connections:
            await conn.send_json(data)

    async def broadcast_system(self, message: str):
        data = {
            "type": "system",
            "message": message
        }
        for conn in self.active_connections:
            await conn.send_json(data)


manager = ConnectionManager()


@app.get("/")
async def root():
    return {"status": "Chatterbox Milestone 2 running"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")

    username = "Anonymous"

    try:
        join_data = await websocket.receive_json()
        if join_data.get("type") == "join":
            username = join_data.get("username", "Anonymous")
            await manager.connect(websocket, username)

        while True:
            data = await websocket.receive_json()

            if data.get("type") == "chat":
                msg = data.get("message", "").strip()
                if msg:
                    print(f"{username}: {msg}")
                    await manager.broadcast_chat(username, msg)

    except WebSocketDisconnect:
        left_user = manager.disconnect(websocket)
        await manager.broadcast_system(f"{left_user} left the chat ❌")

    except Exception as e:
        left_user = manager.disconnect(websocket)
        print("Error:", e)
        await manager.broadcast_system(f"{left_user} disconnected unexpectedly ❌")



