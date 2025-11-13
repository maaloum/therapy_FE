import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import StarRating from "../../components/StarRating";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ClientTherapists = () => {
  const [therapists, setTherapists] = useState([]);
  const [allTherapists, setAllTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    specialization: "",
    language: "",
    search: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
  });
  const [sortBy, setSortBy] = useState("rating");
  const { t } = useTranslation();

  useEffect(() => {
    fetchTherapists();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortBy, allTherapists]);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/doctors?limit=100`);
      console.log("API Response:", response.data); // Debug log
      const fetchedTherapists = response.data.data?.doctors || [];
      console.log("Fetched therapists:", fetchedTherapists); // Debug log
      setAllTherapists(fetchedTherapists);
      setTherapists(fetchedTherapists);
      if (fetchedTherapists.length === 0) {
        toast.error(
          "No therapists found. Please check if doctors are registered."
        );
      }
    } catch (error) {
      console.error("Failed to load therapists:", error);
      console.error("Error details:", error.response?.data); // Debug log
      toast.error("Failed to load therapists");
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...allTherapists];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (therapist) =>
          `${therapist.firstName} ${therapist.lastName}`
            .toLowerCase()
            .includes(searchLower) ||
          therapist.doctorProfile?.bio?.toLowerCase().includes(searchLower) ||
          therapist.doctorProfile?.specialization?.some((spec) =>
            spec.toLowerCase().includes(searchLower)
          )
      );
    }

    // Apply specialization filter
    if (filters.specialization) {
      filtered = filtered.filter((therapist) =>
        therapist.doctorProfile?.specialization?.includes(
          filters.specialization
        )
      );
    }

    // Apply language filter
    if (filters.language) {
      filtered = filtered.filter((therapist) =>
        therapist.doctorProfile?.languages?.includes(filters.language)
      );
    }

    // Apply price filters
    if (filters.minPrice) {
      filtered = filtered.filter(
        (therapist) =>
          therapist.doctorProfile?.hourlyRate >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(
        (therapist) =>
          therapist.doctorProfile?.hourlyRate <= parseFloat(filters.maxPrice)
      );
    }

    // Apply rating filter
    if (filters.minRating) {
      filtered = filtered.filter(
        (therapist) =>
          therapist.doctorProfile?.rating >= parseFloat(filters.minRating)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (
            (b.doctorProfile?.rating || 0) - (a.doctorProfile?.rating || 0)
          );
        case "priceLow":
          return (
            (a.doctorProfile?.hourlyRate || 0) -
            (b.doctorProfile?.hourlyRate || 0)
          );
        case "priceHigh":
          return (
            (b.doctorProfile?.hourlyRate || 0) -
            (a.doctorProfile?.hourlyRate || 0)
          );
        case "name":
          return `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          );
        default:
          return 0;
      }
    });

    setTherapists(filtered);
  };

  const clearFilters = () => {
    setFilters({
      specialization: "",
      language: "",
      search: "",
      minPrice: "",
      maxPrice: "",
      minRating: "",
    });
    setSortBy("rating");
  };

  const hasActiveFilters =
    filters.specialization ||
    filters.language ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minRating;

  // Get unique specializations
  const specializations = useMemo(() => {
    const specs = new Set();
    allTherapists.forEach((therapist) => {
      therapist.doctorProfile?.specialization?.forEach((spec) =>
        specs.add(spec)
      );
    });
    return Array.from(specs).sort();
  }, [allTherapists]);

  return (
    <div className="space-y-6 pb-8 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 md:p-12 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              {t("client.browseTherapists")}
            </h1>
          </div>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl">
            {t("client.findPerfectTherapist") ||
              "Find the perfect therapist for your needs"}
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={t("common.search")}
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="lg:w-64">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white font-medium"
            >
              <option value="rating">{t("search.sortRating")}</option>
              <option value="priceLow">{t("search.sortPriceLow")}</option>
              <option value="priceHigh">{t("search.sortPriceHigh")}</option>
              <option value="name">{t("search.sortName")}</option>
            </select>
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`lg:w-auto px-6 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              showFilters
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {t("search.filters")}
            {hasActiveFilters && (
              <span className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {
                  [
                    filters.specialization,
                    filters.language,
                    filters.minPrice,
                    filters.maxPrice,
                    filters.minRating,
                  ].filter(Boolean).length
                }
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-6 mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-300">
            <div>
              <label className="flex text-sm font-semibold text-gray-700 mb-2.5 items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                {t("search.specialization")}
              </label>
              <select
                value={filters.specialization}
                onChange={(e) =>
                  setFilters({ ...filters, specialization: e.target.value })
                }
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
              >
                <option value="">{t("search.allSpecializations")}</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex text-sm font-semibold text-gray-700 mb-2.5 items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {t("common.language")}
              </label>
              <select
                value={filters.language}
                onChange={(e) =>
                  setFilters({ ...filters, language: e.target.value })
                }
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
              >
                <option value="">{t("common.language")}</option>
                <option value="ARABIC">العربية</option>
                <option value="FRENCH">Français</option>
              </select>
            </div>

            <div>
              <label className="flex text-sm font-semibold text-gray-700 mb-2.5 items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-600"
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
                {t("search.minPrice")} (MRU)
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters({ ...filters, minPrice: e.target.value })
                }
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="flex text-sm font-semibold text-gray-700 mb-2.5 items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-600"
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
                {t("search.maxPrice")} (MRU)
              </label>
              <input
                type="number"
                placeholder="1000"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({ ...filters, maxPrice: e.target.value })
                }
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="flex text-sm font-semibold text-gray-700 mb-2.5 items-center gap-2">
                <svg
                  className="w-4 h-4 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {t("search.rating")}
              </label>
              <select
                value={filters.minRating}
                onChange={(e) =>
                  setFilters({ ...filters, minRating: e.target.value })
                }
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
              >
                <option value="">{t("search.rating")}</option>
                <option value="4.5">4.5+ ⭐</option>
                <option value="4.0">4.0+ ⭐</option>
                <option value="3.5">3.5+ ⭐</option>
                <option value="3.0">3.0+ ⭐</option>
              </select>
            </div>

            {hasActiveFilters && (
              <div className="flex items-end md:col-span-2 lg:col-span-4">
                <button
                  onClick={clearFilters}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
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
                  {t("search.clearFilters")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-700">
            <span className="font-bold text-2xl text-gray-900">
              {therapists.length}
            </span>{" "}
            <span className="ml-2">{t("search.results")}</span>
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      ) : therapists.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600 text-lg mb-2">{t("search.noResults")}</p>
          <p className="text-gray-500 mb-4">
            {t("search.tryDifferentFilters")}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold"
            >
              {t("search.clearFilters")}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {therapists.map((therapist) => (
            <div
              key={therapist.id}
              className="group bg-white border-2 border-gray-100 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 flex flex-col hover:border-blue-200"
            >
              {/* Header with Image */}
              <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 blur-2xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 blur-xl -ml-12 -mb-12"></div>
                <div className="relative z-10 flex items-center gap-4">
                  {therapist.doctorProfile?.photo ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <img
                        src={`${API_URL.replace("/api", "")}${
                          therapist.doctorProfile.photo
                        }`}
                        alt={`${therapist.firstName} ${therapist.lastName}`}
                        className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            therapist.firstName + " " + therapist.lastName
                          )}&background=3b82f6&color=fff&size=128`;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300">
                        {therapist.firstName?.[0]}
                        {therapist.lastName?.[0]}
                      </div>
                    </div>
                  )}
                  <div className="flex-1 relative z-10">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {therapist.firstName} {therapist.lastName}
                    </h3>
                    {therapist.doctorProfile?.specialization &&
                      therapist.doctorProfile.specialization.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {therapist.doctorProfile.specialization
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
                    {therapist.doctorProfile?.rating && (
                      <div className="flex items-center gap-2">
                        <StarRating
                          rating={therapist.doctorProfile.rating}
                          size="sm"
                          showNumber={true}
                        />
                        {therapist.doctorProfile.totalReviews > 0 && (
                          <span className="text-xs text-gray-500">
                            ({therapist.doctorProfile.totalReviews}{" "}
                            {t("review.reviews") || "reviews"})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                {/* Years of Experience */}
                {therapist.doctorProfile?.yearsOfExperience !== undefined &&
                  therapist.doctorProfile.yearsOfExperience > 0 && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
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
                        {therapist.doctorProfile.yearsOfExperience}{" "}
                        {therapist.doctorProfile.yearsOfExperience === 1
                          ? "year"
                          : "years"}{" "}
                        of experience
                      </span>
                    </div>
                  )}

                {/* Description/Bio */}
                {therapist.doctorProfile?.bio ? (
                  <div className="mb-4 flex-1">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {therapist.doctorProfile.bio}
                    </p>
                  </div>
                ) : (
                  <div className="mb-4 flex-1">
                    <p className="text-gray-400 text-sm italic">
                      No description available
                    </p>
                  </div>
                )}

                {/* Languages */}
                {therapist.doctorProfile?.languages &&
                  therapist.doctorProfile.languages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        {t("doctor.languages")}:
                      </span>
                      {therapist.doctorProfile.languages.map((lang, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs rounded-full font-medium border border-blue-200"
                        >
                          {lang === "ARABIC"
                            ? "العربية"
                            : lang === "FRENCH"
                            ? "Français"
                            : lang}
                        </span>
                      ))}
                    </div>
                  )}

                {/* Footer with Price and Button */}
                <div className="pt-5 border-t-2 border-gray-100 mt-auto bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      {therapist.doctorProfile?.hourlyRate ? (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                            {t("payment.hourlyRate")}
                          </p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {therapist.doctorProfile.hourlyRate}{" "}
                            <span className="text-sm text-gray-600 font-normal">
                              MRU
                            </span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Price not set</p>
                      )}
                    </div>
                    <Link
                      to={`/client/bookings/new?doctorId=${therapist.id}`}
                      className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {t("booking.bookSession")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientTherapists;
