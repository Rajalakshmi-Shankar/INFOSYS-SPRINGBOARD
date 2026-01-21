/**
 * CHATTERBOX - Real-time WebSocket Chat Application
 * Frontend JavaScript Logic
 */

// ============================================
// STATE MANAGEMENT
// ============================================
let socket = null;
let currentUsername = '';
let currentRoom = 'general';
let isTyping = false;
let typingTimeout = null;

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    // Login Screen
    loginScreen: document.getElementById('loginScreen'),
    usernameInput: document.getElementById('usernameInput'),
    roomSelect: document.getElementById('roomSelect'),
    joinBtn: document.getElementById('joinBtn'),
    
    // Chat Screen
    chatScreen: document.getElementById('chatScreen'),
    currentRoomEl: document.getElementById('currentRoom'),
    onlineCount: document.getElementById('onlineCount'),
    messagesList: document.getElementById('messagesList'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    typingIndicator: document.getElementById('typingIndicator'),
    typingText: document.getElementById('typingText'),
    
    // Actions
    roomSwitchBtn: document.getElementById('roomSwitchBtn'),
    leaveBtn: document.getElementById('leaveBtn'),
    
    // Modal
    roomModal: document.getElementById('roomModal'),
    closeModal: document.querySelector('.close-modal'),
    
    // Connection Status
    connectionStatus: document.getElementById('connectionStatus'),
    statusText: document.getElementById('statusText')
};

// ============================================
// ROOM CONFIGURATION
// ============================================
const roomConfig = {
    general: { name: 'General Chat', emoji: '💬' },
    tech: { name: 'Tech Talk', emoji: '💻' },
    fun: { name: 'Fun & Games', emoji: '🎮' },
    random: { name: 'Random', emoji: '🎲' }
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    elements.usernameInput.focus();
});

function initializeEventListeners() {
    // Login
    elements.joinBtn.addEventListener('click', handleJoin);
    elements.usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleJoin();
    });
    
    // Chat Input
    elements.messageInput.addEventListener('input', handleTyping);
    elements.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    elements.sendBtn.addEventListener('click', sendMessage);
    
    // Actions
    elements.roomSwitchBtn.addEventListener('click', openRoomModal);
    elements.leaveBtn.addEventListener('click', handleLeave);
    
    // Modal
    elements.closeModal.addEventListener('click', closeRoomModal);
    elements.roomModal.addEventListener('click', (e) => {
        if (e.target === elements.roomModal) closeRoomModal();
    });
    
    // Room Selection
    document.querySelectorAll('.room-item').forEach(item => {
        item.addEventListener('click', () => {
            const room = item.dataset.room;
            if (room !== currentRoom) {
                switchRoom(room);
            }
            closeRoomModal();
        });
    });
}

// ============================================
// LOGIN / JOIN
// ============================================
function handleJoin() {
    const username = elements.usernameInput.value.trim();
    const room = elements.roomSelect.value;
    
    if (!username) {
        elements.usernameInput.focus();
        elements.usernameInput.style.borderColor = 'var(--danger)';
        setTimeout(() => {
            elements.usernameInput.style.borderColor = '';
        }, 1000);
        return;
    }
    
    if (username.length > 20) {
        alert('Username must be 20 characters or less');
        return;
    }
    
    currentUsername = username;
    currentRoom = room;
    
    // Hide login, show chat
    elements.loginScreen.classList.add('hidden');
    elements.chatScreen.classList.remove('hidden');
    
    // Update UI
    updateRoomUI();
    
    // Connect to WebSocket
    connectWebSocket();
}

// ============================================
// WEBSOCKET CONNECTION
// ============================================
function connectWebSocket() {
    showConnectionStatus('Connecting...', true);
    
    // Create WebSocket connection
    socket = new WebSocket('wss://websocket-project-3-gmii.onrender.com/ws');
    
    socket.onopen = () => {
        console.log('✓ WebSocket connected');
        
        // Send join message
        socket.send(JSON.stringify({
            username: currentUsername,
            room: currentRoom
        }));
        
        showConnectionStatus('Connected', false);
        setTimeout(() => {
            elements.connectionStatus.classList.add('hidden');
        }, 2000);
    };
    
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleMessage(data);
    };
    
    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        showConnectionStatus('Connection error', false);
    };
    
    socket.onclose = () => {
        console.log('✗ WebSocket disconnected');
        showConnectionStatus('Disconnected - Reconnecting...', true);
        
        // Auto-reconnect after 2 seconds
        setTimeout(() => {
            if (!elements.chatScreen.classList.contains('hidden')) {
                connectWebSocket();
            }
        }, 2000);
    };
}

// ============================================
// MESSAGE HANDLING
// ============================================
function handleMessage(data) {
    switch (data.type) {
        case 'chat':
            addChatMessage(data.username, data.message, data.timestamp);
            break;
            
        case 'system':
            addSystemMessage(data.message);
            break;
            
        case 'typing':
            updateTypingIndicator(data.users);
            break;
            
        case 'stats':
            updateOnlineCount(data.online);
            break;
    }
}

function addChatMessage(username, message, timestamp) {
    const isOwn = username === currentUsername;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwn ? 'own' : ''}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = username.charAt(0);
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const header = document.createElement('div');
    header.className = 'message-header';
    
    const usernameEl = document.createElement('div');
    usernameEl.className = 'message-username';
    usernameEl.textContent = isOwn ? 'You' : username;
    
    const timeEl = document.createElement('div');
    timeEl.className = 'message-time';
    timeEl.textContent = timestamp || getCurrentTime();
    
    header.appendChild(usernameEl);
    header.appendChild(timeEl);
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = message;
    
    content.appendChild(header);
    content.appendChild(bubble);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    elements.messagesList.appendChild(messageDiv);
    scrollToBottom();
}

function addSystemMessage(message) {
    const systemDiv = document.createElement('div');
    systemDiv.className = 'system-message';
    
    const content = document.createElement('div');
    content.className = 'system-message-content';
    content.textContent = message;
    
    systemDiv.appendChild(content);
    elements.messagesList.appendChild(systemDiv);
    scrollToBottom();
}

// ============================================
// TYPING INDICATOR
// ============================================
function handleTyping() {
    const message = elements.messageInput.value.trim();
    
    // Enable/disable send button
    elements.sendBtn.disabled = !message;
    
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    
    if (message && !isTyping) {
        // Started typing
        isTyping = true;
        socket.send(JSON.stringify({ type: 'typing' }));
    }
    
    // Clear previous timeout
    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeout = setTimeout(() => {
        if (isTyping) {
            isTyping = false;
            socket.send(JSON.stringify({ type: 'stop_typing' }));
        }
    }, 1000);
}

function updateTypingIndicator(users) {
    if (!users || users.length === 0) {
        elements.typingIndicator.classList.add('hidden');
        return;
    }
    
    elements.typingIndicator.classList.remove('hidden');
    
    let text;
    if (users.length === 1) {
        text = `${users[0]} is typing...`;
    } else if (users.length === 2) {
        text = `${users[0]} and ${users[1]} are typing...`;
    } else {
        text = `${users[0]}, ${users[1]} and ${users.length - 2} others are typing...`;
    }
    
    elements.typingText.textContent = text;
}

// ============================================
// SENDING MESSAGES
// ============================================
function sendMessage() {
    const message = elements.messageInput.value.trim();
    
    if (!message || !socket || socket.readyState !== WebSocket.OPEN) {
        return;
    }
    
    // Send message
    socket.send(JSON.stringify({
        type: 'chat',
        message: message
    }));
    
    // Add own message to UI immediately
    addChatMessage(currentUsername, message, getCurrentTime());
    
    // Clear input
    elements.messageInput.value = '';
    elements.sendBtn.disabled = true;
    elements.messageInput.focus();
    
    // Stop typing indicator
    if (isTyping) {
        isTyping = false;
        socket.send(JSON.stringify({ type: 'stop_typing' }));
    }
    
    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }
}

// ============================================
// ROOM MANAGEMENT
// ============================================
function openRoomModal() {
    elements.roomModal.classList.remove('hidden');
    
    // Highlight current room
    document.querySelectorAll('.room-item').forEach(item => {
        if (item.dataset.room === currentRoom) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function closeRoomModal() {
    elements.roomModal.classList.add('hidden');
}

function switchRoom(newRoom) {
    if (newRoom === currentRoom) return;
    
    currentRoom = newRoom;
    
    // Clear messages
    elements.messagesList.innerHTML = '';
    
    // Update UI
    updateRoomUI();
    
    // Close and reconnect WebSocket
    if (socket) {
        socket.close();
    }
    
    connectWebSocket();
}

function updateRoomUI() {
    const config = roomConfig[currentRoom];
    elements.currentRoomEl.textContent = config.name;
}

// ============================================
// LEAVE CHAT
// ============================================
function handleLeave() {
    if (confirm('Are you sure you want to leave the chat?')) {
        if (socket) {
            socket.close();
        }
        
        // Clear everything
        elements.messagesList.innerHTML = '';
        elements.messageInput.value = '';
        elements.usernameInput.value = '';
        currentUsername = '';
        
        // Show login screen
        elements.chatScreen.classList.add('hidden');
        elements.loginScreen.classList.remove('hidden');
        elements.usernameInput.focus();
    }
}

// ============================================
// UI HELPERS
// ============================================
function updateOnlineCount(count) {
    const plural = count === 1 ? '' : 's';
    elements.onlineCount.textContent = `${count} user${plural} online`;
}

function scrollToBottom() {
    const container = elements.messagesList.parentElement;
    container.scrollTop = container.scrollHeight;
}

function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function showConnectionStatus(message, showSpinner) {
    elements.statusText.textContent = message;
    elements.connectionStatus.classList.remove('hidden');
    
    const spinner = elements.connectionStatus.querySelector('.spinner');
    if (showSpinner) {
        spinner.style.display = 'block';
    } else {
        spinner.style.display = 'none';
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Prevent multiple spaces
elements.messageInput?.addEventListener('input', function() {
    this.value = this.value.replace(/\s{2,}/g, ' ');
});

// Username validation
elements.usernameInput?.addEventListener('input', function() {
    this.value = this.value.replace(/[^a-zA-Z0-9_\s]/g, '');
});

// Auto-focus message input when chat screen is visible
const observer = new MutationObserver(() => {
    if (!elements.chatScreen.classList.contains('hidden')) {
        elements.messageInput?.focus();
    }
});

if (elements.chatScreen) {
    observer.observe(elements.chatScreen, {
        attributes: true,
        attributeFilter: ['class']
    });
}

console.log('✓ Chatterbox initialized');
