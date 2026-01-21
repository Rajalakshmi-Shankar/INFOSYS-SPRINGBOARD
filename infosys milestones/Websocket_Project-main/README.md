# 🚀 Chatterbox - Real-time WebSocket Chat Application

A professional, full-featured real-time chat application built with **FastAPI** (Python) backend and **HTML/CSS/JavaScript** frontend.

![Chatterbox](https://img.shields.io/badge/WebSocket-Real--time-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![HTML5](https://img.shields.io/badge/HTML5-Frontend-orange)

## ✨ Features

### Milestone 1: Foundation
✅ WebSocket connection establishment  
✅ Persistent bidirectional communication  
✅ Message echo functionality  
✅ Connection handling  

### Milestone 2: Broadcasting
✅ Real-time message broadcasting  
✅ Username identification  
✅ Event-based communication  
✅ Multiple user support  
✅ Join/leave notifications  

### Milestone 3: Advanced Features
✅ Multiple chat rooms (General, Tech, Fun, Random)  
✅ Room isolation (messages stay within rooms)  
✅ Typing indicators  
✅ Online user count  
✅ Message timestamps  
✅ Room switching  

### UI/UX Enhancements
✅ Professional gradient design  
✅ Smooth animations and transitions  
✅ Responsive layout (mobile-friendly)  
✅ Avatar system  
✅ Modern, clean interface  
✅ Auto-scroll to latest messages  
✅ Connection status indicators  

## 🏗️ Project Structure

```
chatterbox/
├── backend/
│   ├── main.py              # FastAPI WebSocket server
│   ├── requirements.txt     # Python dependencies
│   └── README.md           # Backend documentation
├── index.html              # Main HTML file
├── styles.css              # All styling
├── app.js                  # Frontend JavaScript logic
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

#### 1. Backend Setup

Navigate to the backend folder:
```bash
cd backend
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Start the FastAPI server:
```bash
python main.py
```

The server will run on: **http://localhost:8000**  
WebSocket endpoint: **ws://localhost:8000/ws**

#### 2. Frontend Setup

Simply open `index.html` in your web browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

Or use a local development server:
```bash
# Using Python's built-in server
python -m http.server 3000

# Then visit: http://localhost:3000
```

## 🎯 How to Use

1. **Enter Your Name**: Type your username (max 20 characters)
2. **Select a Room**: Choose from General, Tech, Fun, or Random
3. **Click "Join Chat"**: Connect to the chat room
4. **Start Chatting**: Type messages and see them appear in real-time
5. **Switch Rooms**: Click the home icon to change rooms
6. **Leave Chat**: Click the exit icon to disconnect

## 🔧 Technical Details

### Backend (FastAPI + WebSocket)

**Key Components:**
- `ConnectionManager`: Manages all WebSocket connections, rooms, and broadcasting
- WebSocket endpoint (`/ws`): Handles all real-time communication
- Event types:
  - `chat` - Regular chat messages
  - `typing` - User typing indicator
  - `stop_typing` - User stopped typing
  - `system` - System notifications
  - `stats` - Room statistics

**Features:**
- Automatic reconnection handling
- Room-based message isolation
- Typing indicator management
- Online user tracking
- Error handling and graceful disconnection

### Frontend (HTML/CSS/JavaScript)

**Architecture:**
- Vanilla JavaScript (no frameworks)
- CSS3 with modern features (Grid, Flexbox, animations)
- WebSocket API for real-time communication
- Event-driven design pattern

**Key Features:**
- Responsive design (mobile-first approach)
- Smooth animations and transitions
- Auto-scroll functionality
- Connection status monitoring
- Typing indicator with debouncing
- Message timestamps

## 🎨 Design System

**Color Palette:**
- Primary: `#6366f1` (Indigo)
- Secondary: `#8b5cf6` (Purple)
- Accent: `#06b6d4` (Cyan)
- Success: `#10b981` (Green)

**Typography:**
- Font Family: System fonts (San Francisco, Segoe UI, Roboto)
- Optimized for readability

**Animations:**
- Fade in/out effects
- Slide transitions
- Typing indicator bounce
- Pulse effects

## 🌐 API Endpoints

### HTTP Endpoints

**GET /**  
Returns server info and status
```json
{
  "status": "online",
  "message": "Chatterbox WebSocket Chat Server",
  "version": "1.0.0"
}
```

**GET /stats**  
Returns current server statistics
```json
{
  "total_connections": 5,
  "rooms": {
    "general": 3,
    "tech": 2
  }
}
```

### WebSocket Events

**Client → Server:**
```javascript
// Join room
{ "username": "John", "room": "general" }

// Send message
{ "type": "chat", "message": "Hello!" }

// Typing
{ "type": "typing" }

// Stop typing
{ "type": "stop_typing" }
```

**Server → Client:**
```javascript
// Chat message
{ "type": "chat", "username": "John", "message": "Hello!", "timestamp": "14:30" }

// System message
{ "type": "system", "message": "John joined the chat 👋" }

// Typing users
{ "type": "typing", "users": ["Alice", "Bob"] }

// Room stats
{ "type": "stats", "online": 5 }
```

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

## 🛠️ Development

### Running in Development Mode

Backend with auto-reload:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Testing

Open multiple browser tabs to simulate multiple users and test:
- Message broadcasting
- Typing indicators
- Room switching
- Join/leave notifications
- Online count updates

## 🎓 Educational Milestones

This project was built following a structured learning approach:

**Week 1-2 (Milestone 1):** WebSocket fundamentals  
**Week 3-4 (Milestone 2):** Broadcasting and events  
**Week 5-6 (Milestone 3):** Rooms and advanced features  

## 🐛 Troubleshooting

**Connection Issues:**
- Ensure backend server is running on port 8000
- Check browser console for errors
- Verify WebSocket URL is correct (`ws://localhost:8000/ws`)

**Messages Not Appearing:**
- Check that you're in the same room as other users
- Verify browser console for WebSocket messages
- Ensure backend server is processing events

**Styling Issues:**
- Clear browser cache
- Ensure `styles.css` is in the same directory as `index.html`
- Check browser compatibility

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

Built as a comprehensive learning project covering:
- Real-time communication
- WebSocket protocol
- FastAPI framework
- Modern web development
- UI/UX best practices

---

**Made with ❤️ for learning real-time web applications**
