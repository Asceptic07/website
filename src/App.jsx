// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';

// Vendor Pages
import VendorLogin from './pages/Auth/VendorLogin';
import VendorDashboard from './pages/Vendor/VendorDashboard';
import ProductsManagement from './pages/Vendor/ProductsManagement';
import AddProduct from './pages/Vendor/AddProduct';
import OrdersManagement from './pages/Vendor/OrdersManagement';
import EditProduct from './pages/Vendor/EditProduct';
import ProductDetails from './pages/Vendor/ProductDetails';

// Customer Pages
import Home from './pages/Home';
import Category from './pages/Category';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import HelpSupport from './pages/HelpSupport';
import ProductDetail from './pages/ProductDetail.jsx';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import EmailAction from './pages/Auth/EmailAction.jsx'; // FIXED PATH

// Protected Routes
import RequireAuth from './components/RequireAuth';
import RequireVendor from './components/RequireVendor';

import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Verification handler must be at top-level to catch email action redirects */}
        <Route path="/auth/action" element={<EmailAction />} />

        {/* ==================== VENDOR ROUTES ==================== */}
        <Route path="/vendor" element={<VendorLogin />} />

        <Route
          path="/vendor/products/add"
          element={
            <RequireVendor>
              <AddProduct />
            </RequireVendor>
          }
        />

        <Route
          path="/vendor/products/edit/:id"
          element={
            <RequireVendor>
              <EditProduct />
            </RequireVendor>
          }
        />

        <Route
          path="/vendor/products/:id"
          element={
            <RequireVendor>
              <ProductDetails />
            </RequireVendor>
          }
        />

        <Route
          path="/vendor/products"
          element={
            <RequireVendor>
              <ProductsManagement />
            </RequireVendor>
          }
        />

        <Route
          path="/vendor/dashboard"
          element={
            <RequireVendor>
              <VendorDashboard />
            </RequireVendor>
          }
        />

        <Route
          path="/vendor/orders"
          element={
            <RequireVendor>
              <OrdersManagement />
            </RequireVendor>
          }
        />

        {/* ==================== CUSTOMER ROUTES (wrapped by Layout) ==================== */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/category" element={<Category />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Checkout kept public if you intend guest checkout */}
                <Route path="/checkout" element={<Checkout />} />

                {/* Protected Customer Routes */}
                <Route
                  path="/profile"
                  element={
                    <RequireAuth>
                      <Profile />
                    </RequireAuth>
                  }
                />

                <Route path="/help" element={<HelpSupport />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;