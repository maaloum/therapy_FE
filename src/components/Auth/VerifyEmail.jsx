import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Navbar from "../Layout/Navbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus("error");
      setMessage(t("auth.verification_token_required") || "Verification token is required");
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      setStatus("verifying");
      const response = await axios.get(`${API_URL}/auth/verify-email`, {
        params: { token },
      });

      if (response.data.success) {
        setStatus("success");
        setMessage(response.data.message || t("auth.email_verified") || "Email verified successfully!");
        toast.success(response.data.message || t("auth.email_verified") || "Email verified successfully!");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      setStatus("error");
      const errorMessage = error.response?.data?.message || 
        t("auth.verification_failed") || 
        "Failed to verify email. The link may be invalid or expired.";
      setMessage(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error(t("auth.email_required") || "Email is required");
      return;
    }

    setResending(true);
    try {
      const response = await axios.post(`${API_URL}/auth/resend-verification`, {
        email,
      });

      if (response.data.success) {
        toast.success(response.data.message || t("auth.verification_email_sent") || "Verification email sent!");
        setMessage(response.data.message || t("auth.verification_email_sent") || "Verification email sent!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          t("auth.failed_to_send_email") ||
          "Failed to send verification email"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {status === "verifying" && (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 border-t-transparent mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t("auth.verifying_email") || "Verifying your email..."}
                </h2>
                <p className="text-gray-600">
                  {t("auth.please_wait") || "Please wait while we verify your email address."}
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t("auth.email_verified_title") || "Email Verified!"}
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <p className="text-sm text-gray-500 mb-4">
                  {t("auth.redirecting_to_login") || "Redirecting to login page..."}
                </p>
                <Link
                  to="/login"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {t("auth.go_to_login") || "Go to Login"}
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t("auth.verification_failed_title") || "Verification Failed"}
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {t("auth.resend_verification") || "Resend Verification Email"}
                  </h3>
                  <form onSubmit={handleResendVerification} className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("auth.email") || "Email"}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      disabled={resending}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resending
                        ? t("common.sending") || "Sending..."
                        : t("auth.resend_email") || "Resend Email"}
                    </button>
                  </form>
                </div>

                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  {t("auth.back_to_login") || "Back to Login"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;

