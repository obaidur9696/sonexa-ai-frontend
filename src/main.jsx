import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { router } from './routes/AppRoutes';
import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import ErrorBoundary from './components/ui/ErrorBoundary/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <ThemeProvider>
        <ErrorBoundary>
          <AuthProvider>

          <Toaster
            position="top-right"
            gutter={10}
            toastOptions={{
              duration: 5000,
              style: {
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: '0.8125rem',
                fontWeight: '500',
                borderRadius: '12px',
                padding: '8px 12px',
                maxWidth: '2000px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
              },
              success: {
                duration: 5000,
                style: {
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                },
                iconTheme: {
                  primary: '#16a34a',
                  secondary: '#f0fdf4',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#fef2f2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                },
                iconTheme: {
                  primary: '#dc2626',
                  secondary: '#fef2f2',
                },
              },
              loading: {
                style: {
                  background: '#f9fafb',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                },
              },
            }}
          />

          <RouterProvider router={router} />

          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>
);
