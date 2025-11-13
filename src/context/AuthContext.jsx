import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();

  const fetchUser = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data.data.user);
      // Update language if user has preference in database
      if (response.data.data.user.preferredLanguage) {
        const lang = response.data.data.user.preferredLanguage.toLowerCase();
        const langCode = lang === "arabic" ? "ar" : "fr";
        i18n.changeLanguage(langCode);
        localStorage.setItem("preferredLanguage", langCode);
      } else {
        // Fallback to localStorage if no database preference
        const savedLanguage = localStorage.getItem("preferredLanguage");
        if (
          savedLanguage &&
          (savedLanguage === "ar" || savedLanguage === "fr")
        ) {
          i18n.changeLanguage(savedLanguage);
        }
      }
    } catch {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      // Load language from localStorage on auth error
      const savedLanguage = localStorage.getItem("preferredLanguage");
      if (savedLanguage && (savedLanguage === "ar" || savedLanguage === "fr")) {
        i18n.changeLanguage(savedLanguage);
      }
    } finally {
      setLoading(false);
    }
  }, [i18n]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Load language preference from localStorage if user is not authenticated
    if (!token) {
      const savedLanguage = localStorage.getItem("preferredLanguage");
      if (savedLanguage && (savedLanguage === "ar" || savedLanguage === "fr")) {
        i18n.changeLanguage(savedLanguage);
      }
      setLoading(false);
    } else {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    }
  }, [fetchUser, i18n]);

  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      const { user, token } = response.data.data;

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);

      // Update language
      if (user.preferredLanguage) {
        const lang = user.preferredLanguage.toLowerCase();
        i18n.changeLanguage(lang === "arabic" ? "ar" : "fr");
      }

      toast.success(response.data.message || "Login successful");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      const requiresVerification =
        error.response?.data?.requiresVerification || false;
      toast.error(message);
      return { success: false, error: message, requiresVerification };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      const { user, token } = response.data.data;
      const requiresVerification =
        response.data.data?.requiresVerification || false;

      // Only set token and user if verification is not required
      if (!requiresVerification && token) {
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser(user);

        // Update language
        if (user.preferredLanguage) {
          const lang = user.preferredLanguage.toLowerCase();
          i18n.changeLanguage(lang === "arabic" ? "ar" : "fr");
        }
      }

      return {
        success: true,
        message: response.data.message,
        requiresVerification,
      };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    toast.success("Logged out successfully");
  };

  const updateLanguage = async (language) => {
    try {
      const langCode = language === "ar" ? "ARABIC" : "FRENCH";

      // Always update the UI language immediately (works without auth)
      i18n.changeLanguage(language);

      // Store language preference in localStorage for persistence
      localStorage.setItem("preferredLanguage", language);

      // Only update user's preference in database if authenticated
      if (user) {
        try {
          await axios.patch(`${API_URL}/auth/language`, {
            preferredLanguage: langCode,
          });
          setUser({ ...user, preferredLanguage: langCode });
        } catch (error) {
          // If API call fails, language is still updated in UI
          console.log("Failed to update language in database:", error);
        }
      }
    } catch (error) {
      console.error("Failed to update language:", error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateLanguage,
    fetchUser,
    isAuthenticated: !!user,
    isClient: user?.role === "CLIENT",
    isDoctor: user?.role === "DOCTOR",
    isAdmin: user?.role === "ADMIN",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
