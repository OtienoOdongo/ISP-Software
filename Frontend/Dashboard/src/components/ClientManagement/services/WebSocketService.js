// /**
//  * WebSocket Service
//  * Handles real-time connections for live updates
//  */
// class WebSocketService {
//   constructor() {
//     this.socket = null;
//     this.listeners = new Map();
//     this.reconnectAttempts = 0;
//     this.maxReconnectAttempts = 5;
//     this.reconnectDelay = 3000;
//   }

//   /**
//    * Connect to WebSocket
//    */
//   connect(token) {
//     if (this.socket?.readyState === WebSocket.OPEN) return;

//     const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
//     this.socket = new WebSocket(`${wsUrl}/ws/user-management/?token=${token}`);

//     this.socket.onopen = () => {
//       console.log('WebSocket connected');
//       this.reconnectAttempts = 0;
//       this.emit('connected', {});
//     };

//     this.socket.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         this.emit(data.type, data.payload);
//       } catch (error) {
//         console.error('WebSocket message parse error:', error);
//       }
//     };

//     this.socket.onclose = () => {
//       console.log('WebSocket disconnected');
//       this.emit('disconnected', {});
//       this.reconnect();
//     };

//     this.socket.onerror = (error) => {
//       console.error('WebSocket error:', error);
//       this.emit('error', error);
//     };
//   }

//   /**
//    * Reconnect to WebSocket
//    */
//   reconnect() {
//     if (this.reconnectAttempts >= this.maxReconnectAttempts) {
//       console.log('Max reconnection attempts reached');
//       return;
//     }

//     setTimeout(() => {
//       console.log(`Reconnecting... Attempt ${this.reconnectAttempts + 1}`);
//       this.reconnectAttempts++;
//       const token = localStorage.getItem('access_token');
//       if (token) {
//         this.connect(token);
//       }
//     }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
//   }

//   /**
//    * Disconnect from WebSocket
//    */
//   disconnect() {
//     if (this.socket) {
//       this.socket.close();
//       this.socket = null;
//     }
//   }

//   /**
//    * Send message through WebSocket
//    */
//   send(type, payload) {
//     if (this.socket?.readyState === WebSocket.OPEN) {
//       this.socket.send(JSON.stringify({ type, payload }));
//     } else {
//       console.warn('WebSocket not connected');
//     }
//   }

//   /**
//    * Add event listener
//    */
//   on(event, callback) {
//     if (!this.listeners.has(event)) {
//       this.listeners.set(event, []);
//     }
//     this.listeners.get(event).push(callback);
//   }

//   /**
//    * Remove event listener
//    */
//   off(event, callback) {
//     if (!this.listeners.has(event)) return;
    
//     const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
//     if (callbacks.length > 0) {
//       this.listeners.set(event, callbacks);
//     } else {
//       this.listeners.delete(event);
//     }
//   }

//   /**
//    * Emit event to listeners
//    */
//   emit(event, payload) {
//     if (!this.listeners.has(event)) return;
    
//     this.listeners.get(event).forEach(callback => {
//       try {
//         callback(payload);
//       } catch (error) {
//         console.error(`Error in ${event} listener:`, error);
//       }
//     });
//   }

//   /**
//    * Subscribe to client updates
//    */
//   subscribeToClient(clientId) {
//     this.send('subscribe_client', { client_id: clientId });
//   }

//   /**
//    * Unsubscribe from client updates
//    */
//   unsubscribeFromClient(clientId) {
//     this.send('unsubscribe_client', { client_id: clientId });
//   }

//   /**
//    * Subscribe to dashboard updates
//    */
//   subscribeToDashboard() {
//     this.send('subscribe_dashboard', {});
//   }

//   /**
//    * Unsubscribe from dashboard updates
//    */
//   unsubscribeFromDashboard() {
//     this.send('unsubscribe_dashboard', {});
//   }

//   /**
//    * Request data refresh
//    */
//   requestRefresh(dataType) {
//     this.send('refresh_data', { type: dataType });
//   }
// }

// export default new WebSocketService();









/**
 * WebSocket Service
 * Handles real-time connections for live updates
 */
class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.token = null;
  }

  /**
   * Connect to WebSocket
   */
  connect(token) {
    if (!token) {
      console.error('No token provided for WebSocket connection');
      return;
    }

    this.token = token;
    
    if (this.socket?.readyState === WebSocket.OPEN) return;

    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
    this.socket = new WebSocket(`${wsUrl}/ws/user-management/?token=${token}`);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connected', {});
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data.payload);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected', {});
      this.reconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  /**
   * Reconnect to WebSocket
   */
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    setTimeout(() => {
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts + 1}`);
      this.reconnectAttempts++;
      if (this.token) {
        this.connect(this.token);
      }
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.token = null;
  }

  /**
   * Send message through WebSocket
   */
  send(type, payload) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket not connected');
    }
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
    if (callbacks.length > 0) {
      this.listeners.set(event, callbacks);
    } else {
      this.listeners.delete(event);
    }
  }

  /**
   * Emit event to listeners
   */
  emit(event, payload) {
    if (!this.listeners.has(event)) return;
    
    this.listeners.get(event).forEach(callback => {
      try {
        callback(payload);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  /**
   * Subscribe to client updates
   */
  subscribeToClient(clientId) {
    this.send('subscribe_client', { client_id: clientId });
  }

  /**
   * Unsubscribe from client updates
   */
  unsubscribeFromClient(clientId) {
    this.send('unsubscribe_client', { client_id: clientId });
  }

  /**
   * Subscribe to dashboard updates
   */
  subscribeToDashboard() {
    this.send('subscribe_dashboard', {});
  }

  /**
   * Unsubscribe from dashboard updates
   */
  unsubscribeFromDashboard() {
    this.send('unsubscribe_dashboard', {});
  }

  /**
   * Request data refresh
   */
  requestRefresh(dataType) {
    this.send('refresh_data', { type: dataType });
  }
}

export default new WebSocketService();