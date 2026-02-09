import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useTenant } from "./context/TenantContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Reviews from "./pages/Reviews";
import Coupons from "./pages/Coupons";
import Bookings from "./pages/Bookings";
import Staff from "./pages/Staff";
import ContactMessages from "./pages/ContactMessages";
import StoreSetupWizard from "./pages/StoreSetupWizard";
import Layout from "./components/Layout";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminStores from "./pages/SuperAdminStores";
import SuperAdminStoreConfig from "./pages/SuperAdminStoreConfig";
import SuperAdminUsers from "./pages/SuperAdminUsers";

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Super Admin Route wrapper
const SuperAdminRoute = ({ children }) => {
  const { user, loading, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [setupDismissed, setSetupDismissed] = useState(false);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/setup"
        element={
          <ProtectedRoute>
            <StoreSetupWizard onComplete={() => setSetupDismissed(true)} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/new" element={<ProductForm />} />
                <Route path="/products/:id/edit" element={<ProductForm />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/coupons" element={<Coupons />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/messages" element={<ContactMessages />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />

                {/* Super Admin Routes */}
                <Route
                  path="/super-admin"
                  element={
                    <SuperAdminRoute>
                      <SuperAdminDashboard />
                    </SuperAdminRoute>
                  }
                />
                <Route
                  path="/super-admin/stores"
                  element={
                    <SuperAdminRoute>
                      <SuperAdminStores />
                    </SuperAdminRoute>
                  }
                />
                <Route
                  path="/super-admin/stores/:id"
                  element={
                    <SuperAdminRoute>
                      <SuperAdminStoreConfig />
                    </SuperAdminRoute>
                  }
                />
                <Route
                  path="/super-admin/users"
                  element={
                    <SuperAdminRoute>
                      <SuperAdminUsers />
                    </SuperAdminRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
