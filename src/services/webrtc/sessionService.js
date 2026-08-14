/* ============================================================
   sessionService.js — Session ID Generator

   RESPONSIBILITY:
   Generates a unique roomId that ties one client's
   WebSocket + WebRTC session together on the server.

   Used once per session. Pass roomId in every outgoing
   WebSocket message so the server knows which room/client
   the message belongs to.
   ============================================================ */

class SessionService {
  constructor() {
    this.currentSessionId = null;
  }

  /* ─────────────────────────────────────────
     generateRoomId
     Creates a new unique ID each time.
     Format: session_<timestamp>_<random6chars>
     Example: session_1714000000000_k3f9az
     ───────────────────────────────────────── */
  generateRoomId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    this.currentSessionId = `session_${timestamp}_${random}`;
    console.log('[Session] New roomId:', this.currentSessionId);
    return this.currentSessionId;
  }

  /* ─────────────────────────────────────────
     getCurrentSessionId
     Returns the last generated ID, or null
     if no session has been started yet.
     ───────────────────────────────────────── */
  getCurrentSessionId() {
    return this.currentSessionId;
  }

  /* ─────────────────────────────────────────
     clear
     Called on session end to reset state.
     ───────────────────────────────────────── */
  clear() {
    this.currentSessionId = null;
  }
}

/* ── Single shared instance across the app ── */
export const sessionService = new SessionService();
export default SessionService;