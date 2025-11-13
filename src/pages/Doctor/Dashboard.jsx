import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import toast from "react-hot-toast";
import StarRating from "../../components/StarRating";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const DoctorDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStatistics(),
        fetchRecentBookings(),
        fetchPendingPayments(),
        fetchDoctorProfile(),
      ]);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/doctors/statistics/me`);
      setStatistics(response.data.data.statistics);
    } catch (error) {
      console.error("Failed to load statistics:", error);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const response = await axios.get(`${API_URL}/bookings/me?limit=5`);
      const allBookings = response.data.data.bookings || [];
      const activeBookings = allBookings.filter(
        (b) => b.status !== "CANCELLED"
      );
      setRecentBookings(activeBookings.slice(0, 5));
    } catch (error) {
      console.error("Failed to load recent bookings:", error);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const response = await axios.get(`${API_URL}/payments/pending`);
      if (response.data.success) {
        setPendingPayments(response.data.data.payments || []);
      }
    } catch (error) {
      console.error("Failed to load pending payments:", error);
    }
  };

  const fetchDoctorProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/doctors/profile/me`);
      if (response.data.success) {
        setDoctorProfile(response.data.data.doctorProfile);
      }
    } catch (error) {
      console.error("Failed to load doctor profile:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {t("doctor.welcomeBack") || "Welcome Back"}
                {doctorProfile?.user && (
                  <span className="ml-2">
                    {doctorProfile.user.firstName} {doctorProfile.user.lastName}
                  </span>
                )}
              </h1>
              <p className="text-blue-100 text-lg">
                {t("doctor.dashboardSubtitle") ||
                  "Here's an overview of your practice"}
              </p>
            </div>
            {doctorProfile?.photo && (
              <div className="hidden md:block">
                <img
                  src={`${API_URL.replace("/api", "")}${doctorProfile.photo}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Sessions */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-blue-100 text-sm font-medium mb-1">
              {t("doctor.totalSessions") || "Total Sessions"}
            </p>
            <p className="text-3xl font-bold">
              {statistics.totalSessions || 0}
            </p>
          </div>

          {/* Completed Sessions */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-green-100 text-sm font-medium mb-1">
              {t("doctor.completedSessions") || "Completed"}
            </p>
            <p className="text-3xl font-bold">
              {statistics.completedSessions || 0}
            </p>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-purple-100 text-sm font-medium mb-1">
              {t("doctor.upcomingSessions") || "Upcoming"}
            </p>
            <p className="text-3xl font-bold">
              {statistics.upcomingSessions || 0}
            </p>
          </div>

          {/* Total Earnings */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-yellow-100 text-sm font-medium mb-1">
              {t("doctor.totalEarnings") || "Total Earnings"}
            </p>
            <p className="text-3xl font-bold">
              {statistics.totalEarnings?.toFixed(2) || "0.00"} MRU
            </p>
            {statistics.monthlyEarnings > 0 && (
              <p className="text-yellow-100 text-xs mt-1">
                {t("doctor.thisMonth") || "This month"}:{" "}
                {statistics.monthlyEarnings.toFixed(2)} MRU
              </p>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions & Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("doctor.quickActions") || "Quick Actions"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/doctor/bookings"
              className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100 hover:border-blue-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {t("doctor.manageBookings") || "Manage Bookings"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("doctor.viewAndManage") ||
                      "View and manage your bookings"}
                  </p>
                  {pendingPayments.length > 0 && (
                    <span className="inline-block mt-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {pendingPayments.length}{" "}
                      {t("payment.pendingPayments") || "pending payments"}
                    </span>
                  )}
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>

            <Link
              to="/doctor/profile"
              className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100 hover:border-purple-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {t("doctor.myProfile")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("doctor.updateProfile") ||
                      "Update your profile and schedule"}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>

            <Link
              to="/doctor/messages"
              className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100 hover:border-green-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    {t("messages.messages")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("doctor.chatWithClients") || "Chat with your clients"}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>

            {pendingPayments.length > 0 && (
              <Link
                to="/doctor/bookings"
                className="group bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-yellow-200 hover:border-yellow-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
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
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {t("payment.verifyPayments") || "Verify Payments"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {pendingPayments.length}{" "}
                      {t("payment.pendingVerification") ||
                        "payments pending verification"}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Profile Summary */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("doctor.profileSummary") || "Profile Summary"}
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            {doctorProfile ? (
              <div className="space-y-4">
                {doctorProfile.photo && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={`${API_URL.replace("/api", "")}${
                        doctorProfile.photo
                      }`}
                      alt="Profile"
                      className="w-20 h-20 rounded-full border-4 border-gray-200 object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("doctor.rating") || "Rating"}
                  </p>
                  <div className="flex items-center gap-2">
                    <StarRating
                      rating={doctorProfile.rating || 0}
                      size="lg"
                      showNumber={true}
                    />
                    {doctorProfile.totalReviews > 0 && (
                      <span className="text-sm text-gray-500">
                        ({doctorProfile.totalReviews})
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("doctor.hourlyRate")}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {doctorProfile.hourlyRate?.toFixed(2) || "0.00"} MRU
                  </p>
                </div>
                {doctorProfile.specialization?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      {t("doctor.specialization")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {doctorProfile.specialization
                        .slice(0, 3)
                        .map((spec, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold"
                          >
                            {spec}
                          </span>
                        ))}
                      {doctorProfile.specialization.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                          +{doctorProfile.specialization.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {doctorProfile.isVerified && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-green-600">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-semibold">
                        {t("doctor.verified") || "Verified Doctor"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                {t("doctor.noProfileData") || "No profile data available"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {t("doctor.recentBookings") || "Recent Bookings"}
          </h2>
          <Link
            to="/doctor/bookings"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
          >
            {t("doctor.viewAll") || "View All"}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t("booking.noBookingsFound")}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t("doctor.noBookingsYet")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {booking.client.user.firstName[0]}
                      {booking.client.user.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {booking.client.user.firstName}{" "}
                        {booking.client.user.lastName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {format(new Date(booking.sessionDate), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      booking.status === "CONFIRMED"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {t(`booking.${booking.status.toLowerCase()}`)}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      {format(new Date(booking.sessionDate), "h:mm a")} -{" "}
                      {booking.sessionDuration} {t("booking.minutes")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{t(`booking.${booking.sessionType}`)}</span>
                  </div>
                  {booking.payment && (
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <span
                        className={
                          booking.payment.status === "COMPLETED"
                            ? "text-green-600 font-semibold"
                            : booking.payment.status === "PENDING"
                            ? "text-yellow-600 font-semibold"
                            : "text-gray-600"
                        }
                      >
                        {booking.payment.status === "COMPLETED"
                          ? t("payment.paid")
                          : booking.payment.status === "PENDING"
                          ? t("payment.pending")
                          : t("payment.failed")}{" "}
                        - {booking.payment.amount.toFixed(2)} MRU
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
