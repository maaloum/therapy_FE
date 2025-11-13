import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ClientProfile = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    country: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();
  const { fetchUser } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/profile`);
      const profileData = response.data.data.profile;

      if (profileData) {
        setFormData({
          firstName: profileData.user?.firstName || "",
          lastName: profileData.user?.lastName || "",
          email: profileData.user?.email || "",
          phone: profileData.user?.phone || "",
          dateOfBirth: profileData.dateOfBirth
            ? new Date(profileData.dateOfBirth).toISOString().split("T")[0]
            : "",
          address: profileData.address || "",
          city: profileData.city || "",
          country: profileData.country || "",
        });
        if (profileData.photo) {
          setPhotoPreview(`${API_URL.replace("/api", "")}${profileData.photo}`);
        }
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
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
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formDataToSend = new FormData();
      // Always send required fields
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);

      // Only send email/phone if they have values (to preserve existing if not provided)
      if (formData.email && formData.email.trim()) {
        formDataToSend.append("email", formData.email.trim());
      }
      if (formData.phone && formData.phone.trim()) {
        formDataToSend.append("phone", formData.phone.trim());
      }

      // Send dateOfBirth if provided
      if (formData.dateOfBirth) {
        formDataToSend.append("dateOfBirth", formData.dateOfBirth);
      }

      // Always send address fields (allows clearing them by sending empty string)
      formDataToSend.append("address", formData.address || "");
      formDataToSend.append("city", formData.city || "");
      formDataToSend.append("country", formData.country || "");

      if (photoFile) {
        formDataToSend.append("photo", photoFile);
      }

      await axios.patch(`${API_URL}/users/profile`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(t("client.profileUpdated"));
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
        {t("client.myProfile")}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-6 space-y-6"
      >
        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            {t("client.profilePhoto") || "Profile Photo"}
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

        {/* Personal Information Section */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t("client.personalInformation") || "Personal Information"}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t("client.dateOfBirth")}
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) =>
                setFormData({ ...formData, dateOfBirth: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* Address Information Section */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t("client.addressInformation") || "Address Information"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t("client.address")}
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                  t("client.addressPlaceholder") ||
                  "Street address, apartment, suite, etc."
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  {t("client.city")}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("client.cityPlaceholder") || "City"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  {t("client.country")}
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("client.countryPlaceholder") || "Country"}
                />
              </div>
            </div>
          </div>
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
              t("client.updateProfile")
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientProfile;
