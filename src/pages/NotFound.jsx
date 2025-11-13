import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center px-3 sm:px-4 py-12 safe-top safe-bottom">
      <div className="container mx-auto max-w-2xl text-center">
        {/* 404 Illustration */}
        <div className="mb-8 sm:mb-12">
          <div className="relative inline-block">
            <div className="text-8xl sm:text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 leading-none">
              404
            </div>
            <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse delay-300"></div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8 sm:mb-12">
          <h1 className="heading-responsive text-gray-900 mb-4 sm:mb-6">
            {t("notFound.title") || "Page Not Found"}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-xl mx-auto px-4">
            {t("notFound.description") ||
              "Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or the URL might be incorrect."}
          </p>
        </div>

        {/* Illustration Icon */}
        <div className="mb-8 sm:mb-12 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-8 h-8 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-md animate-bounce">
              <svg
                className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-900"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="btn-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto text-center tap-target"
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v11a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {t("notFound.goHome") || "Go to Home"}
            </div>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-outline px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto text-center tap-target"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {t("notFound.goBack") || "Go Back"}
            </div>
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-gray-200">
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            {t("notFound.helpfulLinks") || "You might be looking for:"}
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="px-4 py-2 text-sm sm:text-base text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all font-medium"
            >
              {t("common.home") || "Home"}
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 text-sm sm:text-base text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all font-medium"
            >
              {t("common.login") || "Login"}
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm sm:text-base text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all font-medium"
            >
              {t("common.register") || "Register"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
