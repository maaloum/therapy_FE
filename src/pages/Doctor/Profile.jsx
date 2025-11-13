import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const DoctorProfile = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    specialization: [],
    languages: [],
    hourlyRate: "",
    yearsOfExperience: "",
    availableHours: {},
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAvailableHours, setShowAvailableHours] = useState(false);
  const { t } = useTranslation();
  const { fetchUser } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/doctors/profile/me`);
      const profileData = response.data.data.doctorProfile;
      setFormData({
        firstName: profileData.user?.firstName || "",
        lastName: profileData.user?.lastName || "",
        email: profileData.user?.email || "",
        phone: profileData.user?.phone || "",
        bio: profileData.bio || "",
        specialization: profileData.specialization || [],
        languages: profileData.languages || [],
        hourlyRate: profileData.hourlyRate || "",
        yearsOfExperience: profileData.yearsOfExperience || "",
        availableHours: profileData.availableHours || {},
      });
      if (profileData.photo) {
        setPhotoPreview(`${API_URL.replace("/api", "")}${profileData.photo}`);
      }
      // Show available hours section if there's existing data
      if (
        profileData.availableHours &&
        Object.keys(profileData.availableHours).length > 0
      ) {
        setShowAvailableHours(true);
      }
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLanguageToggle = (language) => {
    setFormData((prev) => {
      const currentLanguages = prev.languages || [];
      const isSelected = currentLanguages.includes(language);
      return {
        ...prev,
        languages: isSelected
          ? currentLanguages.filter((l) => l !== language)
          : [...currentLanguages, language],
      };
    });
  };

  const handleAvailableHoursChange = (day, index, field, value) => {
    setFormData((prev) => {
      const hours = { ...prev.availableHours };
      if (!hours[day]) hours[day] = [];
      if (!hours[day][index]) hours[day][index] = { start: "", end: "" };
      hours[day][index][field] = value;
      return { ...prev, availableHours: hours };
    });
  };

  const addTimeSlot = (day) => {
    setFormData((prev) => {
      const hours = { ...prev.availableHours };
      if (!hours[day]) hours[day] = [];
      hours[day].push({ start: "", end: "" });
      return { ...prev, availableHours: hours };
    });
  };

  const removeTimeSlot = (day, index) => {
    setFormData((prev) => {
      const hours = { ...prev.availableHours };
      if (hours[day]) {
        hours[day] = hours[day].filter((_, i) => i !== index);
        if (hours[day].length === 0) delete hours[day];
      }
      return { ...prev, availableHours: hours };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formDataToSend = new FormData();
      // Always send required fields
      if (formData.firstName && formData.firstName.trim()) {
        formDataToSend.append("firstName", formData.firstName.trim());
      }
      if (formData.lastName && formData.lastName.trim()) {
        formDataToSend.append("lastName", formData.lastName.trim());
      }

      // Only send email/phone if they have values (to preserve existing if not provided)
      if (formData.email && formData.email.trim()) {
        formDataToSend.append("email", formData.email.trim());
      }
      if (formData.phone && formData.phone.trim()) {
        formDataToSend.append("phone", formData.phone.trim());
      }
      formDataToSend.append("bio", formData.bio || "");
      formDataToSend.append(
        "specialization",
        JSON.stringify(formData.specialization)
      );
      formDataToSend.append("languages", JSON.stringify(formData.languages));
      // hourlyRate is required, so default to 0 if empty
      formDataToSend.append(
        "hourlyRate",
        formData.hourlyRate === "" ? "0" : String(formData.hourlyRate)
      );
      // yearsOfExperience is optional, send empty string to clear it
      formDataToSend.append(
        "yearsOfExperience",
        formData.yearsOfExperience === ""
          ? ""
          : String(formData.yearsOfExperience)
      );
      formDataToSend.append(
        "availableHours",
        JSON.stringify(formData.availableHours)
      );

      if (photoFile) {
        formDataToSend.append("photo", photoFile);
      }

      await axios.put(`${API_URL}/doctors/profile`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(t("doctor.profile_updated"));
      fetchProfile();
      fetchUser(); // Refresh user data to update photo in navbar
      setPhotoFile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        {t("doctor.myProfile")}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-6 space-y-6"
      >
        {/* Personal Information Section */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t("doctor.personalInformation") || "Personal Information"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("auth.firstName")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("auth.lastName")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("auth.phone")}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            {t("doctor.uploadPhoto")}
          </label>
          <div className="flex items-center gap-4">
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
            )}
            {!photoPreview && (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold border-4 border-gray-200">
                {formData.firstName?.[0]}
                {formData.lastName?.[0]}
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            {t("doctor.bio")}
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={5}
            placeholder={t("doctor.bio")}
          />
        </div>

        {/* Specialization */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            {t("doctor.specialization")}
          </label>
          <input
            type="text"
            value={formData.specialization.join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                specialization: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter((s) => s),
              })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Anxiety, Depression, PTSD"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple specializations with commas
          </p>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            {t("doctor.languages")}
          </label>
          <div className="flex gap-4">
            {["ARABIC", "FRENCH"].map((lang) => (
              <label
                key={lang}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.languages.includes(lang)}
                  onChange={() => handleLanguageToggle(lang)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">
                  {t(`common.${lang.toLowerCase()}`) || lang}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Hourly Rate and Years of Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t("doctor.hourlyRate")} (MRU)
            </label>
            <input
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  hourlyRate:
                    value === ""
                      ? ""
                      : isNaN(parseFloat(value))
                      ? ""
                      : parseFloat(value),
                });
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t("doctor.yearsOfExperience")}
            </label>
            <input
              type="number"
              value={formData.yearsOfExperience}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  yearsOfExperience:
                    value === ""
                      ? ""
                      : isNaN(parseInt(value))
                      ? ""
                      : parseInt(value),
                });
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              placeholder="0"
            />
          </div>
        </div>

        {/* Available Hours - Optional Section */}
        <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              <div>
                <label className="block text-base font-semibold text-gray-900">
                  {t("doctor.availableHours")}
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("doctor.availableHoursOptional")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAvailableHours(!showAvailableHours)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              {showAvailableHours ? (
                <>
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
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  {t("common.hide")}
                </>
              ) : (
                <>
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  {t("common.show")}
                </>
              )}
            </button>
          </div>

          {showAvailableHours && (
            <div className="mt-4 space-y-3">
              {daysOfWeek.map((day) => {
                const daySlots = formData.availableHours[day] || [];
                const hasSlots = daySlots.length > 0;
                return (
                  <div
                    key={day}
                    className={`border rounded-lg p-4 transition-all ${
                      hasSlots
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            hasSlots
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-gray-700 capitalize">
                          {t(`common.${day}`) || day}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => addTimeSlot(day)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium rounded-lg transition-all"
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        {t("common.add")}
                      </button>
                    </div>
                    {daySlots.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 mb-2 p-2 bg-white rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-2 flex-1">
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
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) =>
                                handleAvailableHoursChange(
                                  day,
                                  index,
                                  "start",
                                  e.target.value
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                          <span className="text-gray-400 font-medium">-</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) =>
                                handleAvailableHoursChange(
                                  day,
                                  index,
                                  "end",
                                  e.target.value
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(day, index)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                          title={t("common.delete")}
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
                        </button>
                      </div>
                    ))}
                    {daySlots.length === 0 && (
                      <div className="text-center py-3">
                        <p className="text-sm text-gray-400 italic">
                          {t("common.noTimeSlots")}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
          >
            {saving ? (
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
              t("common.save")
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorProfile;
