# Chatterbox Backend - FastAPI WebSocket Server

## Installation

1. Install Python 3.8 or higher
2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Running the Server

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints

- `GET /` - Health check and server info
- `GET /stats` - Current server statistics
- `WebSocket /ws` - Main chat WebSocket endpoint

## Features

✅ Real-time bidirectional communication
✅ Multiple chat rooms (general, tech, fun, random)
✅ Typing indicators
✅ Join/leave notifications
✅ Online user count
✅ Message timestamps
✅ Room isolation (messages only within same room)

## Server will run on:

- HTTP: http://localhost:8000
- WebSocket: ws://localhost:8000/ws
