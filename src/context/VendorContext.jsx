import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const VendorContext = createContext(null);

// Hardcoded vendor credentials
const VENDOR_EMAIL = 'vendor@ajeethome.com';
const VENDOR_PASSWORD = 'Vendor@123';

export const VendorProvider = ({ children }) => {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signIn = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check hardcoded credentials
      if (email === VENDOR_EMAIL && password === VENDOR_PASSWORD) {
        const vendorData = {
          email: VENDOR_EMAIL,
          name: 'Ajeet Vendor',
          role: 'vendor'
        };
        setVendor(vendorData);
        // Store in localStorage for persistence
        localStorage.setItem('vendorAuth', JSON.stringify(vendorData));
        return vendorData;
      } else {
        throw new Error('Invalid vendor credentials');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setVendor(null);
      localStorage.removeItem('vendorAuth');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if vendor is already logged in (on app load)
  React.useEffect(() => {
    const storedVendor = localStorage.getItem('vendorAuth');
    if (storedVendor) {
      try {
        const vendorData = JSON.parse(storedVendor);
        setVendor(vendorData);
      } catch (error) {
        console.error('Error parsing vendor data:', error);
        localStorage.removeItem('vendorAuth');
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      vendor,
      isVendorLoggedIn: Boolean(vendor),
      isAuthenticated: Boolean(vendor), // For compatibility
      vendorLoading: loading,
      loading,
      error,
      signIn,
      signOut,
    }),
    [vendor, loading, error, signIn, signOut]
  );

  return <VendorContext.Provider value={value}>{children}</VendorContext.Provider>;
};

export const useVendor = () => {
  const ctx = useContext(VendorContext);
  if (!ctx) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return ctx;
};
