import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import { AuthProvider, useAuth } from './context/AuthProvider';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  return user ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthContextWrapper>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="sales" element={<Sales />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthContextWrapper>
  );
}

const AuthContextWrapper = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

export default App;
