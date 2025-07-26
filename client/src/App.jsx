import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';

// Import pages
import Dashboard from './pages/Dashboard';
import Guests from './pages/Guests';
import Rooms from './pages/Rooms';
import Reservations from './pages/Reservations';
import Reports from './pages/Reports';

// Import components
import Layout from './components/Layout';

// Import styles
import './styles/App.css';
import 'react-toastify/dist/ReactToastify.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className=\"app\">
          <Routes>
            <Route path=\"/\" element={<Layout />}>
              <Route index element={<Navigate to=\"/dashboard\" replace />} />
              <Route path=\"dashboard\" element={<Dashboard />} />
              <Route path=\"guests\" element={<Guests />} />
              <Route path=\"rooms\" element={<Rooms />} />
              <Route path=\"reservations\" element={<Reservations />} />
              <Route path=\"reports\" element={<Reports />} />
            </Route>
            <Route path=\"*\" element={<Navigate to=\"/dashboard\" replace />} />
          </Routes>
          
          <ToastContainer
            position=\"top-right\"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme=\"light\"
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;