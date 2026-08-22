# Sonexa AI architecture

- React/Vite UI. `main.jsx` composes Redux, the global error boundary, `AuthProvider`, toasts, and the data router.
- REST data follows `store/api` (RTK Query) -> `hooks` -> `providers`/pages/components. Preserve API tags, cache keys, optimistic updates, and the shared 401 refresh behaviour.
- Authentication is cookie-based. `AuthProvider` exposes current-user state; logout must clear all RTK Query slices.
- Landing loads project/WebRTC configuration (with local constants as fallbacks) and starts a voice session through router state. Session history/detail use `sessionApi` through `useSessions`.
- Voice lifecycle is coordinated by `useVoiceConnection`: create a room ID, connect WebSocket, join with form data, acquire microphone, negotiate WebRTC, process transcript/timer events, then clean up on end/failure/unmount. `websocketService` and `webrtcService` are singleton, session-scoped resources.
- Dark mode is currently owned by Landing via the `dark` class on `<html>` and `localStorage.theme`; retain this convention unless a task explicitly centralizes it.

# Change rules

- Read the affected API, hook, and consuming UI before editing; make focused changes, not redesigns.
- Do not bypass hooks to call REST from UI. Keep server state in RTK Query and keep view components presentation-oriented.
- Treat WebSocket/WebRTC listener registration, timers, media tracks, and singleton cleanup as high-risk. Preserve protocol message shapes and ensure every added listener/timer has matching cleanup.
- Keep session-list cache behavior consistent with its pagination/merge strategy and update both list/detail caches when needed.
- Reuse shared UI components and `index.css` tokens; retain light/dark styling and mobile behavior.
- Do not overwrite existing uncommitted changes outside the requested scope.
