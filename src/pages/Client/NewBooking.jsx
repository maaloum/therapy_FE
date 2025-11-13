import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import StarRating from "../../components/StarRating";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const NewBooking = () => {
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get("doctorId");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [fetchingDoctor, setFetchingDoctor] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [formData, setFormData] = useState({
    sessionDate: "",
    sessionTime: "",
    sessionDuration: 60,
    sessionType: "video",
    notes: "",
  });
  const [errors, setErrors] = useState({});

  const fetchDoctor = useCallback(async () => {
    if (!doctorId) {
      toast.error("No doctor selected");
      navigate("/client/therapists");
      return;
    }

    try {
      setFetchingDoctor(true);
      const response = await axios.get(`${API_URL}/doctors/${doctorId}`);
      if (response.data.success && response.data.data?.doctor) {
        setDoctor(response.data.data.doctor);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to load doctor:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to load doctor information";
      toast.error(errorMessage);
      navigate("/client/therapists");
    } finally {
      setFetchingDoctor(false);
    }
  }, [doctorId, navigate]);

  useEffect(() => {
    fetchDoctor();
  }, [fetchDoctor]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sessionDate) {
      newErrors.sessionDate = "Session date is required";
    } else {
      const selectedDate = new Date(
        `${formData.sessionDate}T${formData.sessionTime}`
      );
      if (selectedDate <= new Date()) {
        newErrors.sessionDate = "Session date must be in the future";
      }
    }

    if (!formData.sessionTime) {
      newErrors.sessionTime = "Session time is required";
    }

    if (
      !formData.sessionDuration ||
      formData.sessionDuration < 30 ||
      formData.sessionDuration > 180
    ) {
      newErrors.sessionDuration =
        "Session duration must be between 30 and 180 minutes";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const sessionDateTime = new Date(
        `${formData.sessionDate}T${formData.sessionTime}`
      );

      // Convert sessionType from camelCase to kebab-case for backend
      const sessionTypeMap = {
        video: "video",
        chat: "chat",
        inPerson: "in-person",
      };

      const bookingData = {
        doctorId: doctorId,
        sessionDate: sessionDateTime.toISOString(),
        sessionDuration: parseInt(formData.sessionDuration),
        sessionType:
          sessionTypeMap[formData.sessionType] || formData.sessionType,
        notes: formData.notes || null,
      };

      const bookingUrl = `${API_URL}/bookings`;
      console.log("Creating booking at:", bookingUrl);
      console.log("Booking data:", bookingData);

      const response = await axios.post(bookingUrl, bookingData);

      toast.success(response.data.message || "Booking created successfully!");
      navigate("/client/bookings");
    } catch (error) {
      console.error("Failed to create booking:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);

      let errorMessage = "Failed to create booking";

      // Check for specific error messages from backend
      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;
        if (
          backendMessage.includes("doctor_not_found") ||
          backendMessage.includes("Doctor not found")
        ) {
          errorMessage = "Doctor not found. Please select a valid therapist.";
        } else if (backendMessage.includes("client_profile_not_found")) {
          errorMessage = "Client profile not found. Please contact support.";
        } else {
          errorMessage = backendMessage;
        }
      } else if (error.response?.status === 404) {
        errorMessage = "Resource not found. Please check if the doctor exists.";
      } else if (error.response?.status === 401) {
        errorMessage = "Please log in to create a booking.";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to create bookings.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Minimum tomorrow
    return today.toISOString().split("T")[0];
  };

  if (fetchingDoctor || !doctor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Safety check - ensure doctor has required fields
  if (!doctor.firstName || !doctor.lastName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Invalid doctor data</p>
          <Link
            to="/client/therapists"
            className="text-blue-600 hover:underline"
          >
            Back to Therapists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl p-8 text-white shadow-2xl">
          <Link
            to="/client/therapists"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-all hover:gap-3"
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
            {t("common.back") || "Back to Therapists"}
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg
                className="w-8 h-8 text-white"
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
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {t("booking.bookSession")}
              </h1>
              <p className="text-blue-100 text-lg">
                {t("booking.bookWith") || "Book a session with"}{" "}
                <span className="font-semibold text-white">
                  {doctor.firstName} {doctor.lastName}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doctor Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4 border border-gray-100">
              <div className="text-center mb-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
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
                    {t("booking.therapist") || "Therapist"}
                  </h3>
                </div>
                {doctor.doctorProfile?.photo ? (
                  <img
                    src={`${API_URL.replace("/api", "")}${
                      doctor.doctorProfile.photo
                    }`}
                    alt={`${doctor.firstName} ${doctor.lastName}`}
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-blue-200 shadow-lg"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        doctor.firstName + " " + doctor.lastName
                      )}&background=3b82f6&color=fff&size=128`;
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 shadow-lg border-4 border-blue-200">
                    {doctor.firstName?.[0]}
                    {doctor.lastName?.[0]}
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {doctor.firstName} {doctor.lastName}
                </h3>
                {doctor.doctorProfile?.specialization &&
                  doctor.doctorProfile.specialization.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center mb-3">
                      {doctor.doctorProfile.specialization
                        .slice(0, 2)
                        .map((spec, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                    </div>
                  )}
                {doctor.doctorProfile?.rating && (
                  <div className="flex items-center justify-center mb-3">
                    <StarRating
                      rating={doctor.doctorProfile.rating}
                      size="md"
                      showNumber={true}
                    />
                    {doctor.doctorProfile.totalReviews > 0 && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({doctor.doctorProfile.totalReviews}{" "}
                        {t("review.reviews") || "reviews"})
                      </span>
                    )}
                  </div>
                )}
                {doctor.doctorProfile?.yearsOfExperience &&
                  doctor.doctorProfile.yearsOfExperience > 0 && (
                    <div className="flex items-center justify-center gap-2 mb-3 text-sm text-gray-600">
                      <svg
                        className="w-5 h-5 text-blue-600"
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
                      <span className="font-semibold text-gray-900">
                        {doctor.doctorProfile.yearsOfExperience}{" "}
                        {doctor.doctorProfile.yearsOfExperience === 1
                          ? "year"
                          : "years"}{" "}
                        experience
                      </span>
                    </div>
                  )}
                {doctor.doctorProfile?.hourlyRate && (
                  <div className="mb-4 p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
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
                      <p className="text-2xl font-bold text-gray-900">
                        {doctor.doctorProfile.hourlyRate} MRU
                        <span className="text-sm text-gray-500 font-normal ml-1">
                          /hour
                        </span>
                      </p>
                    </div>
                  </div>
                )}
                {doctor.doctorProfile?.bio && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 text-center leading-relaxed">
                      {doctor.doctorProfile.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t("booking.sessionDetails") || "Session Details"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("booking.fillDetails") ||
                      "Fill in the details for your session"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("booking.selectDate")} *
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <input
                        type="date"
                        value={formData.sessionDate}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            sessionDate: e.target.value,
                          });
                          if (errors.sessionDate)
                            setErrors({ ...errors, sessionDate: "" });
                        }}
                        min={getTodayDate()}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.sessionDate
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {errors.sessionDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.sessionDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("booking.selectTime")} *
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <input
                        type="time"
                        value={formData.sessionTime}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            sessionTime: e.target.value,
                          });
                          if (errors.sessionTime)
                            setErrors({ ...errors, sessionTime: "" });
                        }}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.sessionTime
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {errors.sessionTime && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.sessionTime}
                      </p>
                    )}
                  </div>
                </div>

                {/* Duration and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("booking.duration")} (minutes) *
                    </label>
                    <select
                      value={formData.sessionDuration}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          sessionDuration: parseInt(e.target.value),
                        });
                        if (errors.sessionDuration)
                          setErrors({ ...errors, sessionDuration: "" });
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.sessionDuration
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      required
                    >
                      <option value={30}>30 {t("booking.minutes")}</option>
                      <option value={60}>
                        60 {t("booking.minutes")} (Recommended)
                      </option>
                      <option value={90}>90 {t("booking.minutes")}</option>
                      <option value={120}>120 {t("booking.minutes")}</option>
                    </select>
                    {errors.sessionDuration && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.sessionDuration}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("booking.sessionType")} *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["video", "chat", "inPerson"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, sessionType: type });
                          }}
                          className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                            formData.sessionType === type
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-gray-200 text-gray-700 hover:border-blue-300"
                          }`}
                        >
                          {t(`booking.${type}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("booking.notes")} (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Any specific concerns or topics you'd like to discuss..."
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.notes.length}/500 characters
                  </p>
                </div>

                {/* Error Message */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                )}

                {/* Price Summary */}
                {doctor.doctorProfile?.hourlyRate && (
                  <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
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
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <span className="text-gray-700 font-semibold text-lg">
                            {t("payment.total") || "Estimated Cost"}
                          </span>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {t("payment.estimated") ||
                              "Based on hourly rate and duration"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-blue-600">
                          {(
                            (doctor.doctorProfile.hourlyRate *
                              formData.sessionDuration) /
                            60
                          ).toFixed(2)}{" "}
                          <span className="text-lg text-gray-600">MRU</span>
                        </span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-blue-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {doctor.doctorProfile.hourlyRate} MRU/hour ×{" "}
                          {formData.sessionDuration} min
                        </span>
                        <span className="text-gray-500">
                          ={" "}
                          {(
                            (doctor.doctorProfile.hourlyRate *
                              formData.sessionDuration) /
                            60
                          ).toFixed(2)}{" "}
                          MRU
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <Link
                    to="/client/therapists"
                    className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold text-center flex items-center justify-center gap-2"
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
                    {t("common.cancel")}
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-lg"
                  >
                    {loading ? (
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
                        {t("common.loading")}...
                      </>
                    ) : (
                      <>
                        {t("booking.bookSession")}
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
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBooking;
