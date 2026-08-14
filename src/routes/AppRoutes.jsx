
// AppRoutes.js
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import { lazy } from 'react';
import RouteErrorFallback from '../components/ui/ErrorBoundary/RouteErrorFallback';
const Layout = lazy(() => import('../components/layout/RootLayout'));
const Landing = lazy(() => import('../pages/Landing'));
const SessionDetail = lazy(() => import('../pages/SessionDetail'));
const Login = lazy(() => import('../pages/Login'));
const Signup = lazy(() => import('../pages/Signup'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const NotFound = lazy(() => import('../pages/NotFound'));
const VoiceSession = lazy(() => import('../pages/VoiceSession'));

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route 
      path="/" 
      element={<Layout />}
      errorElement={<RouteErrorFallback />} // ✅ Premium error UI
    >
      <Route index element={<Landing />} />
      <Route path="session/:sessionId" element={<SessionDetail />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="profile" element={<Profile />} />
      <Route path="settings" element={<Settings />} />
      <Route path="session/new" element={<VoiceSession />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

export const AppRoutes = () => null;