import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import CartDrawer from "./components/cart/CartDrawer";

// Store pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import InfoPage from "./pages/InfoPage";
import NotFound from "./pages/NotFound";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Route guards
import ProtectedRoute from "./routes/ProtectedRoute";


// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Categories from "./pages/admin/Categories";
import Brands from "./pages/admin/Brands";
import ProductsAdmin from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Users from "./pages/admin/Users";
import Reviews from "./pages/admin/Reviews";
import AdminRoute from "./routes/AdminRoute";

export default function App() {
  return (
    <BrowserRouter>
      {/* Global Layout */}
      <Header />
      <CartDrawer />

      <Routes>
        {/* =======================
            PUBLIC STORE ROUTES
        ======================== */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<CartPage />} />

        {/* =======================
            AUTH ROUTES
        ======================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* =======================
            PROTECTED STORE ROUTES
        ======================== */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route path="/info/:slug" element={<InfoPage />} />

        {/* =======================
            ADMIN ROUTES (PROTECTED + ROLE)
        ======================== */}
        <Route path="/admin" element={
          <AdminRoute>
          <AdminLayout/>
          </AdminRoute>
          }>

          <Route index element={<Dashboard/>}/>
          <Route path="categories" element={<Categories/>}/>
          <Route path="brands" element={<Brands/>}/>
          <Route path="products" element={<ProductsAdmin/>}/>
          <Route path="orders" element={<Orders/>}/>
          <Route path="users" element={<Users/>}/>
          <Route path="reviews" element={<Reviews/>}/>

          </Route>

      
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
