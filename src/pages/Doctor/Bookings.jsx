import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const DoctorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingPayment, setVerifyingPayment] = useState(null);
  const [activeTab, setActiveTab] = useState("bookings"); // "bookings" or "payments"
  const { t } = useTranslation();

  useEffect(() => {
    fetchBookings();
    fetchPendingPayments();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/bookings/me`);
      // Filter out cancelled bookings
      const allBookings = response.data.data.bookings || [];
      const activeBookings = allBookings.filter(
        (b) => b.status !== "CANCELLED"
      );
      setBookings(activeBookings);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const response = await axios.get(`${API_URL}/payments/pending`);
      if (response.data.success) {
        setPendingPayments(response.data.data.payments || []);
      }
    } catch (err) {
      console.error("Failed to load pending payments:", err);
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await axios.patch(`${API_URL}/bookings/${bookingId}/status`, { status });
      toast.success(t("booking.status_updated") || "Booking status updated");
      fetchBookings();
    } catch (err) {
      console.error("Failed to update booking status:", err);
      toast.error(
        err.response?.data?.message || "Failed to update booking status"
      );
    }
  };

  const handleVerifyPayment = async (paymentId) => {
    try {
      setVerifyingPayment(paymentId);
      const response = await axios.patch(
        `${API_URL}/payments/${paymentId}/verify`
      );
      if (response.data.success) {
        toast.success(
          response.data.message ||
            t("payment.verified_successfully") ||
            "Payment verified successfully"
        );
        fetchPendingPayments();
        fetchBookings(); // Refresh bookings to show updated payment status
      }
    } catch (err) {
      console.error("Failed to verify payment:", err);
      toast.error(err.response?.data?.message || "Failed to verify payment");
    } finally {
      setVerifyingPayment(null);
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {t("doctor.manageBookings") || "Manage Bookings & Payments"}
        </h1>
        <p className="text-gray-600">
          {t("doctor.manageBookingsDesc") ||
            "View and manage your bookings, verify payments, and update schedules"}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "bookings"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {t("doctor.bookings") || "Bookings"}
            {bookings.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                {bookings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "payments"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {t("payment.pendingPayments") || "Pending Payments"}
            {pendingPayments.length > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-600 py-0.5 px-2 rounded-full text-xs">
                {pendingPayments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "schedule"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {t("doctor.schedule") || "Schedule"}
          </button>
        </nav>
      </div>

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
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
                {t("doctor.noBookingsYet") || "No bookings yet"}
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {booking.client.user.firstName[0]}
                        {booking.client.user.lastName[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {booking.client.user.firstName}{" "}
                          {booking.client.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {booking.client.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-gray-400"
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
                        <span className="text-gray-600">
                          {format(new Date(booking.sessionDate), "PPP p")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-gray-400"
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
                        <span className="text-gray-600">
                          {booking.sessionDuration} {t("booking.minutes")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            booking.status === "CONFIRMED"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : booking.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {t(`booking.${booking.status.toLowerCase()}`)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">
                          {t("booking.sessionType")}:{" "}
                          {t(`booking.${booking.sessionType}`)}
                        </span>
                      </div>
                    </div>

                    {booking.payment && (
                      <div
                        className={`p-3 rounded-lg mb-4 ${
                          booking.payment.status === "COMPLETED"
                            ? "bg-green-50 border border-green-200"
                            : booking.payment.status === "PENDING"
                            ? "bg-yellow-50 border border-yellow-200"
                            : "bg-gray-50 border border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <svg
                              className={`w-5 h-5 ${
                                booking.payment.status === "COMPLETED"
                                  ? "text-green-600"
                                  : booking.payment.status === "PENDING"
                                  ? "text-yellow-600"
                                  : "text-gray-600"
                              }`}
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
                              className={`font-semibold ${
                                booking.payment.status === "COMPLETED"
                                  ? "text-green-800"
                                  : booking.payment.status === "PENDING"
                                  ? "text-yellow-800"
                                  : "text-gray-800"
                              }`}
                            >
                              {booking.payment.status === "COMPLETED"
                                ? t("payment.paid")
                                : booking.payment.status === "PENDING"
                                ? t("payment.pending")
                                : t("payment.failed")}{" "}
                              - {booking.payment.amount.toFixed(2)} MRU
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {booking.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">
                            {t("booking.notes")}:
                          </span>{" "}
                          {booking.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {booking.status === "PENDING" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusUpdate(booking.id, "CONFIRMED")
                          }
                          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                          {t("booking.confirm")}
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(booking.id, "DECLINED")
                          }
                          className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                          {t("booking.decline")}
                        </button>
                      </>
                    )}
                    {booking.status === "CONFIRMED" && (
                      <>
                        {booking.payment?.status === "COMPLETED" ? (
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking.id, "COMPLETED")
                            }
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                          >
                            {t("booking.markAsCompleted") ||
                              "Marquer comme terminé"}
                          </button>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <p className="text-sm text-gray-600 italic">
                              {t("booking.waitingForPayment") ||
                                "En attente du paiement"}
                            </p>
                            {!booking.payment && (
                              <p className="text-xs text-gray-500">
                                {t("booking.noPaymentYet") ||
                                  "Aucun paiement n'a été soumis"}
                              </p>
                            )}
                            {booking.payment?.status === "PENDING" && (
                              <p className="text-xs text-yellow-600">
                                {t("booking.paymentPending") ||
                                  "Paiement en attente de vérification"}
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    {booking.status === "COMPLETED" && (
                      <span className="text-blue-600 font-semibold text-sm">
                        ✓ {t("booking.completed")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pending Payments Tab */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          {pendingPayments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t("payment.noPendingPayments") || "No Pending Payments"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t("payment.allPaymentsVerified") ||
                  "All payments have been verified"}
              </p>
            </div>
          ) : (
            pendingPayments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                        {payment.booking.client.user.firstName[0]}
                        {payment.booking.client.user.lastName[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {payment.booking.client.user.firstName}{" "}
                          {payment.booking.client.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {format(
                            new Date(payment.booking.sessionDate),
                            "PPP p"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-medium">
                            {t("payment.amount")}:
                          </span>
                          <span className="text-2xl font-bold text-yellow-600">
                            {payment.amount.toFixed(2)} MRU
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-medium">
                            {t("payment.duration")}:
                          </span>
                          <span className="text-lg font-semibold text-gray-900">
                            {payment.booking.sessionDuration}{" "}
                            {t("booking.minutes")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {payment.screenshot && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          {t("payment.screenshot")}:
                        </p>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={`${API_URL.replace("/api", "")}${
                              payment.screenshot
                            }`}
                            alt="Payment screenshot"
                            className="w-full h-auto max-h-64 object-contain bg-gray-50"
                            onError={(e) => {
                              e.target.src = "/placeholder-image.png";
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
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
                        {t("payment.submittedAt") || "Submitted"}:{" "}
                        {format(new Date(payment.createdAt), "PPP p")}
                      </span>
                    </div>
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => handleVerifyPayment(payment.id)}
                      disabled={verifyingPayment === payment.id}
                      className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {verifyingPayment === payment.id ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
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
                          {t("common.processing")}...
                        </>
                      ) : (
                        <>
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
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {t("payment.markAsPaid") || "Mark as Paid"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === "schedule" && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center py-12">
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
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {t("doctor.manageSchedule") || "Manage Your Schedule"}
            </h3>
            <p className="mt-1 text-sm text-gray-500 mb-6">
              {t("doctor.scheduleDesc") ||
                "Update your available hours in your profile"}
            </p>
            <Link
              to="/doctor/profile"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {t("doctor.goToProfile") || "Go to Profile"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorBookings;
