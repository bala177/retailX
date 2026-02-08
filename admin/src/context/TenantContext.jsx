import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { tenantAPI, createStoreAPI } from "../services/api";

const TenantContext = createContext(null);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const { user, isPlatformOwner, isAuthenticated } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storeAPI, setStoreAPI] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadTenants();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (currentTenant) {
      setStoreAPI(createStoreAPI(currentTenant.slug));
      localStorage.setItem("currentTenant", JSON.stringify(currentTenant));
    }
  }, [currentTenant]);

  const loadTenants = async () => {
    setLoading(true);
    try {
      if (isPlatformOwner) {
        // Platform owner can see all tenants
        const response = await tenantAPI.getAll();
        const allTenants = response.data.data.tenants;
        setTenants(allTenants);

        // Restore or set default tenant
        const saved = localStorage.getItem("currentTenant");
        if (saved) {
          const savedTenant = JSON.parse(saved);
          const found = allTenants.find((t) => t._id === savedTenant._id);
          setCurrentTenant(found || allTenants[0]);
        } else if (allTenants.length > 0) {
          setCurrentTenant(allTenants[0]);
        }
      } else if (user?.tenant) {
        // Store owner/staff can only see their tenant
        const response = await tenantAPI.getById(user.tenant);
        const tenant = response.data.data.tenant;
        setTenants([tenant]);
        setCurrentTenant(tenant);
      }
    } catch (error) {
      console.error("Failed to load tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const switchTenant = (tenant) => {
    setCurrentTenant(tenant);
  };

  const value = {
    tenants,
    currentTenant,
    loading,
    switchTenant,
    storeAPI,
    refreshTenants: loadTenants,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};
