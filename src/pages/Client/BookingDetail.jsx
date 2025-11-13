import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import StarRating from "../../components/StarRating";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReview, setHasReview] = useState(false);

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/bookings/${id}`);
      if (response.data.success) {
        setBooking(response.data.data.booking);
        // Check if booking has a review
        if (response.data.data.booking.review) {
          setHasReview(true);
        }
      } else {
        throw new Error("Failed to load booking");
      }
    } catch (error) {
      console.error("Failed to load booking:", error);
      toast.error("Failed to load booking details");
      navigate("/client/bookings");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  useEffect(() => {
    // Set payment phone number to doctor's phone when modal opens
    if (showPaymentModal && booking?.doctor?.user?.phone) {
      setPaymentPhone(booking.doctor.user.phone);
    } else if (showPaymentModal && booking) {
      // Fallback if doctor phone is not available
      setPaymentPhone("+222 45 25 25 25");
    }
  }, [showPaymentModal, booking]);

  const handlePayment = () => {
    if (!booking) return;
    setShowPaymentModal(true);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!booking || !screenshot) {
      toast.error(
        t("payment.screenshot_required") || "Please upload a payment screenshot"
      );
      return;
    }

    try {
      setUploading(true);

      // Calculate amount based on duration and hourly rate
      const hourlyRate = booking.doctor?.hourlyRate || 0;
      const duration = booking.sessionDuration || 60;
      const amount = (hourlyRate * duration) / 60;

      if (amount <= 0) {
        toast.error("Invalid booking amount. Please contact support.");
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("screenshot", screenshot);
      formData.append("bookingId", booking.id);
      formData.append("amount", amount.toString());
      formData.append("currency", "MRU");

      const response = await axios.post(
        `${API_URL}/payments/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success(
          response.data.message ||
            t("payment.submitted_successfully") ||
            "Payment submitted successfully. We will verify your payment and update the booking status."
        );
        setShowPaymentModal(false);
        setScreenshot(null);
        setScreenshotPreview(null);
        // Refresh booking data
        await fetchBooking();
      }
    } catch (error) {
      console.error("Failed to submit payment:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to submit payment";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;

    try {
      setCancelling(true);
      const response = await axios.patch(
        `${API_URL}/bookings/${booking.id}/status`,
        {
          status: "CANCELLED",
        }
      );

      if (response.data.success) {
        toast.success(
          response.data.message || t("booking.cancelledSuccessfully")
        );
        // Refresh booking data
        await fetchBooking();
        setShowCancelConfirm(false);
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to cancel booking";
      toast.error(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-green-100 text-green-800",
      COMPLETED: "bg-blue-100 text-blue-800",
      CANCELLED: "bg-red-100 text-red-800",
      DECLINED: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          statusColors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {t(`booking.${status.toLowerCase()}`) || status}
      </span>
    );
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

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Booking not found</p>
          <Link to="/client/bookings" className="text-blue-600 hover:underline">
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  // Get doctor info
  const doctor = booking.doctor?.user || {};
  const hourlyRate = booking.doctor?.hourlyRate || 0;
  const duration = booking.sessionDuration || 60;
  const totalAmount = (hourlyRate * duration) / 60;
  // Check if payment exists (could be null, undefined, or an object)
  const hasPayment = booking.payment !== null && booking.payment !== undefined;

  // Check if booking can be cancelled
  const canCancel =
    booking &&
    booking.status !== "CANCELLED" &&
    booking.status !== "COMPLETED" &&
    booking.status !== "DECLINED";

  // Check if booking can be reviewed
  const canReview = booking && booking.status === "COMPLETED" && !hasReview;

  const handleSubmitReview = async () => {
    if (!reviewRating) {
      toast.error(t("review.ratingRequired") || "Please select a rating");
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await axios.post(`${API_URL}/reviews`, {
        bookingId: booking.id,
        rating: reviewRating,
        comment: reviewComment || null,
      });

      if (response.data.success) {
        toast.success(t("review.created") || "Review submitted successfully");
        setShowReviewModal(false);
        setReviewRating(0);
        setReviewComment("");
        setHasReview(true);
        fetchBooking(); // Refresh booking data
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error(
        error.response?.data?.message ||
          t("review.failed") ||
          "Failed to submit review"
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <Link
          to="/client/bookings"
          className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4"
        >
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
          Back to Bookings
        </Link>
        <h1 className="text-4xl font-bold mb-2">
          {t("booking.bookingDetails")}
        </h1>
        <p className="text-blue-100">Booking ID: {booking.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
              <h2 className="text-2xl font-bold text-gray-900">
                {t("booking.sessionInfo")}
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-gray-600 font-medium">
                    {t("booking.status")}
                  </span>
                </div>
                {getStatusBadge(booking.status)}
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
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
                  <span className="text-gray-600 font-medium">
                    {t("booking.date")}
                  </span>
                </div>
                <span className="text-gray-900 font-semibold">
                  {formatDate(booking.sessionDate)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
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
                  <span className="text-gray-600 font-medium">
                    {t("booking.duration")}
                  </span>
                </div>
                <span className="text-gray-900 font-semibold">
                  {duration} {t("booking.minutes")}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
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
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-600 font-medium">
                    {t("booking.sessionType")}
                  </span>
                </div>
                <span className="text-gray-900 font-semibold capitalize">
                  {t(`booking.${booking.sessionType}`) || booking.sessionType}
                </span>
              </div>
              {booking.notes && (
                <div className="py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span className="text-gray-600 font-medium">
                      {t("booking.notes")}
                    </span>
                  </div>
                  <p className="text-gray-900 pl-7">{booking.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
              <h2 className="text-2xl font-bold text-gray-900">
                {t("booking.therapist")}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              {booking.doctor?.user && (
                <>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white">
                    {doctor.firstName?.[0]}
                    {doctor.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {doctor.firstName} {doctor.lastName}
                    </h3>
                    {booking.doctor?.specialization && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Array.isArray(booking.doctor.specialization) ? (
                          booking.doctor.specialization
                            .slice(0, 3)
                            .map((spec, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full"
                              >
                                {spec}
                              </span>
                            ))
                        ) : (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                            {booking.doctor.specialization}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {(canCancel || canReview) && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {t("booking.actions")}
              </h3>
              <div className="space-y-3">
                {canCancel && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={cancelling}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    {t("booking.cancelBooking")}
                  </button>
                )}
                {canReview && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {t("review.rateSession") || "Rate This Session"}
                  </button>
                )}
                {hasReview && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
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
                      <span className="font-semibold">
                        {t("review.alreadyReviewed") ||
                          "You have already reviewed this session"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Payment Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
              <h2 className="text-2xl font-bold text-gray-900">
                {t("payment.payment")}
              </h2>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400"
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
                  <span className="text-gray-600 font-medium">
                    {t("payment.hourlyRate")}
                  </span>
                </div>
                <span className="text-gray-900 font-semibold">
                  {hourlyRate.toFixed(2)} MRU
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400"
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
                  <span className="text-gray-600 font-medium">
                    {t("payment.duration")}
                  </span>
                </div>
                <span className="text-gray-900 font-semibold">
                  {duration} {t("booking.minutes")}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">
                  {t("payment.total")}
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {totalAmount.toFixed(2)} MRU
                </span>
              </div>
            </div>

            {/* Payment Status */}
            {hasPayment && booking.payment && (
              <div
                className={`mb-6 p-4 rounded-lg border ${
                  booking.payment.status === "COMPLETED"
                    ? "bg-green-50 border-green-200"
                    : booking.payment.status === "PENDING"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div
                  className={`flex items-center gap-2 ${
                    booking.payment.status === "COMPLETED"
                      ? "text-green-800"
                      : booking.payment.status === "PENDING"
                      ? "text-yellow-800"
                      : "text-gray-800"
                  }`}
                >
                  {booking.payment.status === "COMPLETED" ? (
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
                  ) : booking.payment.status === "PENDING" ? (
                    <svg
                      className="w-5 h-5 animate-spin"
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
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="font-semibold">
                    {booking.payment.status === "COMPLETED"
                      ? t("payment.paid")
                      : booking.payment.status === "PENDING"
                      ? t("payment.pending") || "Payment Pending"
                      : t("payment.failed") || "Payment Failed"}{" "}
                    - {booking.payment.amount.toFixed(2)} MRU
                  </span>
                </div>
                {booking.payment.status === "PENDING" && (
                  <p className="text-sm text-yellow-700 mt-2">
                    {t("payment.verificationInProgress") ||
                      "Your payment is being verified. We will update the status soon."}
                  </p>
                )}
              </div>
            )}

            {/* Payment Button */}
            {booking.status === "CONFIRMED" && !hasPayment && (
              <button
                onClick={handlePayment}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
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
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                {t("payment.payNow")}
              </button>
            )}

            {booking.status !== "CONFIRMED" &&
              booking.status !== "CANCELLED" && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                  {t("payment.waitingConfirmation")}
                </div>
              )}

            {booking.status === "CANCELLED" && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">
                    {t("booking.cancelled")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
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
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {t("payment.payNow")}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("payment.uploadScreenshot") ||
                      "Send payment and upload screenshot"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setScreenshot(null);
                  setScreenshotPreview(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Payment Instructions */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {t("payment.sendToPhone") || "Send payment to this number"}
                  </h4>
                  <div className="flex items-center gap-3 mb-3">
                    <a
                      href={`tel:${paymentPhone.replace(/\s/g, "")}`}
                      className="text-2xl font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      {paymentPhone || "+222 45 25 25 25"}
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
                    </a>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 font-medium">
                        {t("payment.amountToPay") || "Amount to pay"}
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {booking &&
                          (
                            ((booking.doctor?.hourlyRate || 0) *
                              (booking.sessionDuration || 60)) /
                            60
                          ).toFixed(2)}{" "}
                        MRU
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t("payment.afterSending") ||
                        "After sending the money, please upload a screenshot of the transaction"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshot Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {t("payment.uploadScreenshot") || "Upload Payment Screenshot"} *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-all">
                {screenshotPreview ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={screenshotPreview}
                        alt="Screenshot preview"
                        className="w-full h-auto rounded-lg border border-gray-200 max-h-64 object-contain mx-auto"
                      />
                      <button
                        onClick={() => {
                          setScreenshot(null);
                          setScreenshotPreview(null);
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                      >
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      {screenshot.name}
                    </p>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="hidden"
                    />
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium mb-1">
                        {t("payment.clickToUpload") ||
                          "Click to upload screenshot"}
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setScreenshot(null);
                  setScreenshotPreview(null);
                }}
                disabled={uploading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handlePaymentSubmit}
                disabled={uploading || !screenshot}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {uploading ? (
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
                    {t("common.uploading") || "Uploading..."}
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {t("payment.submit") || "Submit Payment"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {t("review.rateSession") || "Rate This Session"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("review.shareExperience") ||
                      "Share your experience with this therapist"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewRating(0);
                  setReviewComment("");
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Doctor Info */}
            {booking.doctor?.user && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                    {doctor.firstName?.[0]}
                    {doctor.lastName?.[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {doctor.firstName} {doctor.lastName}
                    </h4>
                    {booking.doctor?.specialization && (
                      <p className="text-sm text-gray-600">
                        {Array.isArray(booking.doctor.specialization)
                          ? booking.doctor.specialization.join(", ")
                          : booking.doctor.specialization}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Rating Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {t("review.yourRating") || "Your Rating"} *
              </label>
              <div className="flex justify-center">
                <StarRating
                  rating={reviewRating}
                  size="xl"
                  interactive={true}
                  onRatingChange={setReviewRating}
                />
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("review.comment") || "Your Review (Optional)"}
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={
                  t("review.commentPlaceholder") ||
                  "Share your experience with this therapist..."
                }
                rows={5}
                maxLength={500}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all resize-none"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {reviewComment.length}/500
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewRating(0);
                  setReviewComment("");
                }}
                disabled={submittingReview}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || !reviewRating}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {submittingReview ? (
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
                    {t("common.submitting") || "Submitting..."}
                  </>
                ) : (
                  <>
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
                    {t("review.submit") || "Submit Review"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {t("booking.confirmCancel")}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              {t("booking.cancelConfirmationMessage")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cancelling ? (
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
                  t("booking.confirmCancelButton")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetail;
