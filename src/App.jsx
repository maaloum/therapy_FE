import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import VerifyEmail from "./components/Auth/VerifyEmail";
import VerifyEmailPending from "./components/Auth/VerifyEmailPending";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Donation from "./pages/Donation";
import ClientDashboard from "./pages/Client/Dashboard";
import ClientTherapists from "./pages/Client/Therapists";
import ClientBookings from "./pages/Client/Bookings";
import NewBooking from "./pages/Client/NewBooking";
import BookingDetail from "./pages/Client/BookingDetail";
import ClientMessages from "./pages/Client/Messages";
import ClientProfile from "./pages/Client/Profile";
import DoctorDashboard from "./pages/Doctor/Dashboard";
import DoctorBookings from "./pages/Doctor/Bookings";
import DoctorProfile from "./pages/Doctor/Profile";
import DoctorMessages from "./pages/Doctor/Messages";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminUsers from "./pages/Admin/Users";
import AdminBookings from "./pages/Admin/Bookings";
import AdminAnalytics from "./pages/Admin/Analytics";
import NotFound from "./pages/NotFound";
import "./i18n/config";
import "./App.css";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="/verify-email-pending"
              element={<VerifyEmailPending />}
            />

            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<AboutUs />} />
              <Route path="donation" element={<Donation />} />

              {/* Client Routes */}
              <Route
                path="client/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["CLIENT"]}>
                    <ClientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="client/therapists"
                element={
                  <ProtectedRoute allowedRoles={["CLIENT"]}>
                    <ClientTherapists />
                  </ProtectedRoute>
                }
              />
              <Route
                path="client/bookings"
                element={
                  <ProtectedRoute allowedRoles={["CLIENT"]}>
                    <ClientBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="client/bookings/new"
                element={
                  <ProtectedRoute allowedRoles={["CLIENT"]}>
                    <NewBooking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="client/bookings/:id"
                element={
                  <ProtectedRoute allowedRoles={["CLIENT"]}>
                    <BookingDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="client/messages"
                element={
                  <ProtectedRoute allowedRoles={["CLIENT"]}>
                    <ClientMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="client/profile"
                element={
                  <ProtectedRoute allowedRoles={["CLIENT"]}>
                    <ClientProfile />
                  </ProtectedRoute>
                }
              />

              {/* Doctor Routes */}
              <Route
                path="doctor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["DOCTOR"]}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="doctor/bookings"
                element={
                  <ProtectedRoute allowedRoles={["DOCTOR"]}>
                    <DoctorBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="doctor/profile"
                element={
                  <ProtectedRoute allowedRoles={["DOCTOR"]}>
                    <DoctorProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="doctor/messages"
                element={
                  <ProtectedRoute allowedRoles={["DOCTOR"]}>
                    <DoctorMessages />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/bookings"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminAnalytics />
                  </ProtectedRoute>
                }
              />

              {/* 404 - Catch all unmatched routes */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
