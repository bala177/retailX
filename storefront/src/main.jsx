import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { StoreProvider } from "./context/StoreContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import AuthModal from "./components/AuthModal.jsx";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <StoreProvider>
          <AuthProvider>
            <CartProvider>
              <App />
              <AuthModal />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "#1f2937",
                    color: "#fff",
                    borderRadius: "0.5rem",
                  },
                }}
              />
            </CartProvider>
          </AuthProvider>
        </StoreProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
