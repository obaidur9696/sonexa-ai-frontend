/* ============================================================
   websocketService.js — WebSocket Singleton

   RESPONSIBILITY:
   - Owns the single WebSocket connection to the server
   - Delivers incoming messages to registered handlers
   - Auto-reconnects on unexpected drops (with backoff)
   - Exposes waitForConnection() so callers can await open

   KEY FIXES vs old version:
   1. Guards BOTH readyState OPEN and CONNECTING — old code
      only checked OPEN, so calling connect() while still
      connecting created a second socket → duplicate events.
   2. onStatus() supports MULTIPLE subscribers (old version
      used a single .onStatusChange property that got
      overwritten if two things subscribed).
   3. Duplicate listener guard in on() — same callback
      reference won't be added twice.
   4. clearListeners() separated from disconnect() so
      you can cleanly reset per-session listeners without
      fully tearing down the transport.
   ============================================================ */

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000/bot';

/* ── Reconnect config ── */
const MAX_RETRIES        = 5;
const BASE_RETRY_DELAY_MS = 2000; // 2s, 4s, 6s, 8s, 10s (linear backoff)

class WebSocketService {
  constructor() {
    this.socket         = null;   // the live WebSocket instance
    this.listeners      = {};     // { messageType: Set<callback> }
    this.statusSubs     = new Set(); // status change subscribers
    this.isConnected    = false;
    this.retryCount     = 0;
    this.retryTimer     = null;
    this.manualClose    = false;  // true = we closed intentionally, skip retry
  }

  /* ─────────────────────────────────────────
     connect()
     
     Call once to open the WebSocket.
     Safe to call multiple times — will not
     create a second socket if one is already
     OPEN or still CONNECTING.
     ───────────────────────────────────────── */
  connect() {
    // BUG FIX: old code only checked OPEN, not CONNECTING.
    // If connect() was called twice during startup, a second
    // socket was created → server received two join events.
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
       this.socket.readyState === WebSocket.CONNECTING)
    ) {
      console.log('[WS] Already connected or connecting — ignoring duplicate connect()');
      return;
    }

    this.manualClose = false;
    this._createSocket();
  }

  /* ─────────────────────────────────────────
     waitForConnection(timeoutMs)
     
     Returns a Promise that resolves when the
     socket is open, or rejects on timeout/error.
     
     Usage:
       await wsService.waitForConnection();
     ───────────────────────────────────────── */
  waitForConnection(timeoutMs = 10_000, signal) {
    // Already open — resolve immediately
    if (this.socket?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      let settled = false;
      let unsubscribe = () => {};
      let onAbort = () => {};
      const finish = (callback, value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        unsubscribe();
        signal?.removeEventListener('abort', onAbort);
        callback(value);
      };
      const timer = setTimeout(() => {
        finish(reject, new Error('[WS] Connection timeout'));
      }, timeoutMs);

      // Subscribe to status changes just for this promise
      const onStatus = (status) => {
        if (status === 'connected') {
          finish(resolve);
        } else if (status === 'error') {
          finish(reject, new Error('[WS] Connection failed'));
        }
      };

      onAbort = () => finish(reject, new DOMException('Connection cancelled', 'AbortError'));

      // onStatus() returns an unsubscribe fn (see below)
      unsubscribe = this.onStatus(onStatus);
      if (signal?.aborted) onAbort();
      else signal?.addEventListener('abort', onAbort, { once: true });
    });
  }

  /* ─────────────────────────────────────────
     send(data)
     
     Sends a plain JS object as JSON.
     Returns true if sent, false if not connected.
     
     Example:
       wsService.send({ type: 'join', roomId: '...' })
       wsService.send({ type: 'signal', payload: { ... } })
     ───────────────────────────────────────── */
  send(data) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      console.warn('[WS] Cannot send — socket not open. Dropped:', data?.type);
      return false;
    }
    try {
      this.socket.send(JSON.stringify(data));
      console.log('[WS] → Sent:', data.type, data);
      return true;
    } catch (err) {
      console.error('[WS] Send error:', err);
      return false;
    }
  }

  /* ─────────────────────────────────────────
     on(type, callback)
     
     Register a handler for a specific message type.
     Duplicate registrations of the same function
     reference are silently ignored (prevents the
     double-listener bug from StrictMode re-mounts).
     
     Use '*' to receive ALL messages (debug only).
     
     Example:
       wsService.on('bot-ready', (data) => { ... })
       wsService.on('signal',    (data) => { ... })
     ───────────────────────────────────────── */
  on(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = new Set();
    }
    // Set.add() is idempotent — same reference won't be added twice
    this.listeners[type].add(callback);
  }

  /* ─────────────────────────────────────────
     off(type, callback)
     
     Remove a previously registered handler.
     Always call this in cleanup to avoid leaks.
     ───────────────────────────────────────── */
  off(type, callback) {
    this.listeners[type]?.delete(callback);
  }

  /* ─────────────────────────────────────────
     onStatus(callback)
     
     Subscribe to connection status changes.
     Status values: 'connecting' | 'connected' |
                    'disconnected' | 'error'
     
     Returns an unsubscribe function:
       const unsub = wsService.onStatus(cb);
       unsub(); // stop listening
     ───────────────────────────────────────── */
  onStatus(callback) {
    this.statusSubs.add(callback);
    return () => this.statusSubs.delete(callback);
  }

  /* ─────────────────────────────────────────
     disconnect()
     
     Intentional close — stops reconnect retries.
     Call on session end.
     ───────────────────────────────────────── */
  disconnect() {
    console.log('[WS] Disconnecting...');
    this.manualClose = true;

    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    if (this.socket) {
      this.socket.close(1000, 'Session ended');
      this.socket = null;
    }

    this.isConnected = false;
    this.retryCount  = 0;
    this._notifyStatus('disconnected');
  }

  /* ─────────────────────────────────────────
     clearListeners()
     
     Removes all registered message handlers.
     Call after disconnect() to fully clean up
     a session without destroying the service.
     ───────────────────────────────────────── */
  clearListeners() {
    this.listeners = {};
    console.log('[WS] All listeners cleared');
  }

  /* ─────────────────────────────────────────
     get connected
     Quick boolean check for current state.
     ───────────────────────────────────────── */
  get connected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /* ══════════════════════════════════════════
     PRIVATE METHODS
     ══════════════════════════════════════════ */

  _createSocket() {
    console.log(`[WS] Connecting to ${WS_URL} (attempt ${this.retryCount + 1}/${MAX_RETRIES})`);
    this._notifyStatus('connecting');

    try {
      this.socket = new WebSocket(WS_URL);
    } catch (err) {
      console.error('[WS] Failed to create socket:', err);
      this._notifyStatus('error');
      this._scheduleRetry();
      return;
    }

    /* ── Socket opened ── */
    const socket = this.socket;

    socket.onopen = () => {
      if (socket !== this.socket) return;
      console.log('[WS] Connected ✓');
      this.isConnected = true;
      this.retryCount  = 0; // reset on success
      this._notifyStatus('connected');
    };

    /* ── Message arrived ── */
    socket.onmessage = (event) => {
      if (socket !== this.socket) return;
      try {
        const data = JSON.parse(event.data);
        console.log('[WS] ← Received:', data.type, data);
        this._dispatch(data);
      } catch {
        console.warn('[WS] Could not parse message:', event.data);
      }
    };

    /* ── Socket closed ── */
    socket.onclose = (event) => {
      if (socket !== this.socket && !this.manualClose) return;
      console.log(`[WS] Closed — code: ${event.code}, clean: ${event.wasClean}`);
      this.isConnected = false;
      this._notifyStatus('disconnected');

      // Only auto-retry if we didn't close intentionally
      if (!this.manualClose) {
        this._scheduleRetry();
      }
    };

    /* ── Socket error ── */
    socket.onerror = (err) => {
      if (socket !== this.socket) return;
      // Note: onclose always fires after onerror — retry is handled there
      console.error('[WS] Socket error:', err);
      this._notifyStatus('error');
    };
  }

  /* ─────────────────────────────────────────
     _dispatch — route incoming message to handlers
     ───────────────────────────────────────── */
  _dispatch(data) {
    const { type } = data;

    if (!type) {
      console.warn('[WS] Received message with no type field:', data);
      return;
    }

    // Call handlers registered for this specific type
    this.listeners[type]?.forEach(cb => {
      try {
        const result = cb(data);
        result?.catch?.((error) => {
          console.error(`[WS] Async handler error for type "${type}":`, error);
        });
      } catch (err) {
        console.error(`[WS] Handler error for type "${type}":`, err);
      }
    });

    // Call wildcard handlers (receives every message — useful for logging)
    this.listeners['*']?.forEach(cb => {
      try {
        const result = cb(data);
        result?.catch?.((error) => {
          console.error('[WS] Async wildcard handler error:', error);
        });
      } catch (err) {
        console.error('[WS] Wildcard handler error:', err);
      }
    });
  }

  /* ─────────────────────────────────────────
     _scheduleRetry — exponential-ish backoff
     ───────────────────────────────────────── */
  _scheduleRetry() {
    if (this.manualClose || this.retryTimer) return;
    if (this.retryCount >= MAX_RETRIES) {
      console.error(`[WS] Max retries (${MAX_RETRIES}) reached. Giving up.`);
      this._notifyStatus('error');
      return;
    }

    this.retryCount++;
    const delay = BASE_RETRY_DELAY_MS * this.retryCount; // 2s, 4s, 6s…
    console.log(`[WS] Retrying in ${delay / 1000}s... (${this.retryCount}/${MAX_RETRIES})`);

    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (!this.manualClose) this._createSocket();
    }, delay);
  }

  /* ─────────────────────────────────────────
     _notifyStatus — broadcast to all status subscribers
     ───────────────────────────────────────── */
  _notifyStatus(status) {
    this.statusSubs.forEach(cb => {
      try {
        cb(status);
      } catch (err) {
        console.error('[WS] Status subscriber error:', err);
      }
    });
  }
}

/* ── Single shared instance — import this everywhere ──
   One connection, shared across the whole app.
   
   Usage:
     import { wsService } from './websocketService';
     wsService.connect();
     wsService.send({ type: 'join', roomId: '...' });
     wsService.on('bot-ready', handler);
   ──────────────────────────────────────────────────── */
export const wsService = new WebSocketService();
export default WebSocketService;
