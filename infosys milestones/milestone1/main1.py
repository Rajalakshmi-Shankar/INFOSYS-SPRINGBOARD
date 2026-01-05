from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import uvicorn

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "🎉 Milestone 1: FastAPI Server Running"}

@app.websocket("/websocket")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("✅ Client connected")

    try:
        while True:
            data = await websocket.receive_text()
            print("📩 Received:", data)
            await websocket.send_text(f"Server: You said → {data}")
    except WebSocketDisconnect:
        print("❌ Client disconnected")

if __name__ == "__main__":
    uvicorn.run("main1:app", host="127.0.0.1", port=8000, reload=True)
