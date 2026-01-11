import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Map of userId -> Set of WebSocket connections
  }

  initialize(server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection');

      // Handle authentication
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());

          if (data.type === 'auth') {
            this.handleAuth(ws, data.token);
          } else if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
        console.log('WebSocket connection closed');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send welcome message
      ws.send(JSON.stringify({ 
        type: 'connected', 
        message: 'WebSocket connection established',
        timestamp: Date.now()
      }));
    });

    console.log('WebSocket server initialized');
  }

  handleAuth(ws, token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      // Token payload uses 'id', not 'userId'
      const userId = decoded.id || decoded.userId;
      ws.userId = userId;
      ws.isAuthenticated = true;

      // Add to clients map
      if (!this.clients.has(userId)) {
        this.clients.set(userId, new Set());
      }
      this.clients.get(userId).add(ws);

      ws.send(JSON.stringify({ 
        type: 'auth_success', 
        userId: userId,
        timestamp: Date.now()
      }));

      console.log(`User ${userId} authenticated via WebSocket`);
    } catch (error) {
      ws.send(JSON.stringify({ 
        type: 'auth_error', 
        message: 'Authentication failed',
        timestamp: Date.now()
      }));
      console.error('WebSocket auth error:', error);
    }
  }

  handleDisconnect(ws) {
    if (ws.userId && this.clients.has(ws.userId)) {
      const userConnections = this.clients.get(ws.userId);
      userConnections.delete(ws);
      
      if (userConnections.size === 0) {
        this.clients.delete(ws.userId);
      }
    }
  }

  // Broadcast to all connected clients
  broadcast(event, data) {
    const message = JSON.stringify({
      type: 'broadcast',
      event,
      data,
      timestamp: Date.now()
    });

    this.wss?.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }

  // Send to specific user
  sendToUser(userId, event, data) {
    const userConnections = this.clients.get(userId);
    
    if (userConnections) {
      const message = JSON.stringify({
        type: 'message',
        event,
        data,
        timestamp: Date.now()
      });

      userConnections.forEach((ws) => {
        if (ws.readyState === 1) { // WebSocket.OPEN
          ws.send(message);
        }
      });
    }
  }

  // Send to all authenticated users
  broadcastToAuthenticated(event, data) {
    const message = JSON.stringify({
      type: 'broadcast',
      event,
      data,
      timestamp: Date.now()
    });

    this.clients.forEach((connections) => {
      connections.forEach((ws) => {
        if (ws.isAuthenticated && ws.readyState === 1) {
          ws.send(message);
        }
      });
    });
  }

  // Notify about booking changes
  notifyBookingCreated(booking, bookingType) {
    this.broadcastToAuthenticated('booking_created', {
      bookingType, // 'room' or 'restaurant'
      booking
    });
  }

  notifyBookingUpdated(booking, bookingType) {
    this.broadcastToAuthenticated('booking_updated', {
      bookingType,
      booking
    });
  }

  notifyBookingCancelled(bookingId, bookingType) {
    this.broadcastToAuthenticated('booking_cancelled', {
      bookingType,
      bookingId
    });
  }

  // Notify about availability changes
  notifyAvailabilityChanged(date, bookingType) {
    this.broadcastToAuthenticated('availability_changed', {
      bookingType,
      date
    });
  }

  // Get connection stats
  getStats() {
    return {
      totalConnections: this.wss?.clients.size || 0,
      authenticatedUsers: this.clients.size,
      timestamp: Date.now()
    };
  }
}

// Singleton instance
const websocketService = new WebSocketService();

export default websocketService;
