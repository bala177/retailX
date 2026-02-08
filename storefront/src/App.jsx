import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ServiceHome from "./pages/ServiceHome";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import StoreSelector from "./pages/StoreSelector";
import { useStore } from "./context/StoreContext";

// Wrapper component to conditionally render home page
function HomePage() {
  const { isServiceBased } = useStore();
  return isServiceBased ? <ServiceHome /> : <Home />;
}

// Wrapper to require store selection
function RequireStore({ children }) {
  const { storeSlug, isLoading } = useStore();

  // If no store selected, redirect to store selector
  if (!storeSlug && !isLoading) {
    return <Navigate to="/select-store" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/select-store" element={<StoreSelector />} />
      <Route
        path="/"
        element={
          <RequireStore>
            <Layout />
          </RequireStore>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:slug" element={<ProductDetail />} />
        <Route path="category/:slug" element={<Products />} />
        <Route path="search" element={<Products />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-confirmation/:orderNumber" element={<OrderConfirmation />} />
      </Route>
    </Routes>
  );
}

export default App;
