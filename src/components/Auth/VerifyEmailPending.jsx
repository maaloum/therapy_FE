import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Navbar from "../Layout/Navbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const VerifyEmailPending = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const email = location.state?.email || "";
  const [resending, setResending] = useState(false);

  const handleResendVerification = async () => {
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
        toast.success(
          response.data.message ||
            t("auth.verification_email_sent") ||
            "Verification email sent!"
        );
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
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t("auth.checkYourEmail") || "Check Your Email"}
            </h2>
            <p className="text-gray-600 mb-6">
              {t("auth.verification_email_sent_message") ||
                "We've sent a verification link to your email address. Please click the link to verify your account."}
            </p>
            {email && (
              <p className="text-sm text-gray-500 mb-6">
                {t("auth.sent_to") || "Sent to:"} <strong>{email}</strong>
              </p>
            )}

            <div className="space-y-4">
              <button
                onClick={handleResendVerification}
                disabled={resending || !email}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending
                  ? t("common.sending") || "Sending..."
                  : t("auth.resend_verification_email") ||
                    "Resend Verification Email"}
              </button>
              <Link
                to="/login"
                className="block text-blue-600 hover:text-blue-700 font-semibold"
              >
                {t("auth.backToLogin") || "Back to Login"}
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {t("auth.didnt_receive_email") || "Didn't receive the email?"}
              </p>
              <ul className="text-xs text-gray-500 mt-2 space-y-1 text-left">
                <li>
                  • {t("auth.check_spam_folder") || "Check your spam folder"}
                </li>
                <li>
                  •{" "}
                  {t("auth.verify_email_correct") ||
                    "Make sure the email address is correct"}
                </li>
                <li>
                  •{" "}
                  {t("auth.wait_few_minutes") ||
                    "Wait a few minutes and try again"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmailPending;
