import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../Layout/Navbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    requestType: "email", // 'email' or 'phone'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState(null);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.requestType === "email" && !formData.email) {
      toast.error(
        t("auth.email") + " " + t("common.required") || "Email is required"
      );
      return;
    }

    if (formData.requestType === "phone" && !formData.phone) {
      toast.error(
        t("auth.phone") + " " + t("common.required") || "Phone is required"
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        [formData.requestType]: formData[formData.requestType],
      });

      if (response.data.success) {
        setSubmitted(true);
        // In development, show the reset URL
        if (response.data.resetUrl) {
          setResetUrl(response.data.resetUrl);
        }
        toast.success(response.data.message || t("auth.forgot_password_sent"));
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(
        error.response?.data?.message ||
          t("auth.forgot_password_error") ||
          "Failed to send reset link"
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center px-3 sm:px-4 py-12 safe-top safe-bottom min-h-[calc(100vh-4rem)]">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 border border-gray-100 text-center">
              {/* Success Icon */}
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 sm:w-12 sm:h-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                {t("auth.checkYourEmail") || "Check Your Email"}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6">
                {t("auth.resetLinkSent") ||
                  "If an account exists, we've sent a password reset link to your email/phone."}
              </p>

              {/* Development: Show reset URL */}
              {resetUrl && import.meta.env.DEV && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2 font-semibold">
                    Development Mode - Reset Link:
                  </p>
                  <a
                    href={resetUrl}
                    className="text-sm text-blue-600 hover:text-blue-700 break-all"
                  >
                    {resetUrl}
                  </a>
                </div>
              )}

              <div className="space-y-3">
                <Link
                  to="/login"
                  className="btn-primary w-full tap-target block text-center"
                >
                  {t("common.backToLogin") || "Back to Login"}
                </Link>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ email: "", phone: "", requestType: "email" });
                  }}
                  className="btn-outline w-full tap-target"
                >
                  {t("auth.sendAnother") || "Send Another Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="flex items-center justify-center px-3 sm:px-4 py-12 safe-top safe-bottom min-h-[calc(100vh-4rem)]">
        <div className="max-w-md w-full">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JAM
              </span>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t("auth.forgotPassword")}
            </h2>
            <p className="text-gray-600">
              {t("auth.forgotPasswordDesc") ||
                "Enter your email or phone number to receive a password reset link"}
            </p>
          </div>

          {/* Forgot Password Form */}
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Request Type Toggle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t("auth.requestType") || "Request Type"}
                </label>
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, requestType: "email" });
                    }}
                    className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all ${
                      formData.requestType === "email"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      {t("auth.email")}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, requestType: "phone" });
                    }}
                    className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all ${
                      formData.requestType === "phone"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {t("auth.phone")}
                    </div>
                  </button>
                </div>
              </div>

              {/* Email/Phone Input */}
              {formData.requestType === "email" ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("auth.email")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="input pl-10"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("auth.phone")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="input pl-10"
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full tap-target"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white inline-block mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("common.loading")}...
                  </>
                ) : (
                  <>
                    {t("auth.sendResetLink") || "Send Reset Link"}
                    <svg
                      className="w-5 h-5 inline-block ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600">
                {t("auth.rememberPassword") || "Remember your password?"}{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  {t("common.login")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
