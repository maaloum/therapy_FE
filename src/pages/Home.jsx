import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import axios from "axios";
import toast from "react-hot-toast";
import StarRating from "../components/StarRating";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Home = () => {
  const { isAuthenticated, isClient } = useAuth();
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/doctors?limit=6`);
      setDoctors(response.data.data.doctors || []);
    } catch (error) {
      console.error("Failed to load doctors:", error);
      toast.error("Failed to load therapists");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-emerald-50/20">
      {/* Peaceful Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Hero Section */}
      <section className="relative section px-3 sm:px-4 pt-16 sm:pt-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            {/* Peaceful Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100/80 to-emerald-100/80 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm animate-float">
                  <svg
                    className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600/70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                {/* Floating particles */}
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-300/60 rounded-full animate-ping"></div>
                <div
                  className="absolute -bottom-1 -left-1 w-2 h-2 bg-emerald-300/60 rounded-full animate-ping"
                  style={{ animationDelay: "0.5s" }}
                ></div>
              </div>
            </div>
            <h1 className="heading-responsive text-slate-700 mb-4 sm:mb-6 leading-relaxed font-light tracking-wide">
              {t("home.heroTitle")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-500 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed font-light">
              {t("home.heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg w-full sm:w-auto text-center bg-gradient-to-r from-blue-400/80 to-emerald-400/80 text-white rounded-full font-light tracking-wide shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    {t("home.getStarted")}
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg w-full sm:w-auto text-center bg-white/60 backdrop-blur-sm text-slate-600 border border-slate-200/50 rounded-full font-light tracking-wide hover:bg-white/80 transition-all duration-300 hover:scale-105 shadow-sm"
                  >
                    {t("common.login")}
                  </Link>
                </>
              ) : (
                <>
                  {isClient && (
                    <Link
                      to="/client/therapists"
                      className="px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg bg-gradient-to-r from-blue-400/80 to-emerald-400/80 text-white rounded-full font-light tracking-wide shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                    >
                      {t("client.browseTherapists")}
                    </Link>
                  )}
                  <Link
                    to={isClient ? "/client/dashboard" : "/doctor/dashboard"}
                    className="px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg bg-white/60 backdrop-blur-sm text-slate-600 border border-slate-200/50 rounded-full font-light tracking-wide hover:bg-white/80 transition-all duration-300 hover:scale-105 shadow-sm"
                  >
                    {t("common.dashboard")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section px-3 sm:px-4 bg-white/40 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-slate-700 mb-4 sm:mb-6 tracking-wide">
              {t("home.featuresTitle")}
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto px-4 font-light leading-relaxed">
              {t("home.featuresSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-slate-100/50 shadow-sm hover:shadow-lg transition-all duration-500 hover:scale-[1.02]">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100/80 to-blue-200/60 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner">
                <svg
                  className="w-10 h-10 text-blue-500/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-light text-slate-700 mb-3 text-center tracking-wide">
                {t("home.feature1Title")}
              </h3>
              <p className="text-slate-500 text-center text-sm leading-relaxed font-light">
                {t("home.feature1Desc")}
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-slate-100/50 shadow-sm hover:shadow-lg transition-all duration-500 hover:scale-[1.02]">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100/80 to-purple-200/60 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner">
                <svg
                  className="w-10 h-10 text-purple-500/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-light text-slate-700 mb-3 text-center tracking-wide">
                {t("home.feature2Title")}
              </h3>
              <p className="text-slate-500 text-center text-sm leading-relaxed font-light">
                {t("home.feature2Desc")}
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-slate-100/50 shadow-sm hover:shadow-lg transition-all duration-500 hover:scale-[1.02]">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100/80 to-emerald-200/60 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner">
                <svg
                  className="w-10 h-10 text-emerald-500/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-light text-slate-700 mb-3 text-center tracking-wide">
                {t("home.feature3Title")}
              </h3>
              <p className="text-slate-500 text-center text-sm leading-relaxed font-light">
                {t("home.feature3Desc")}
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-slate-100/50 shadow-sm hover:shadow-lg transition-all duration-500 hover:scale-[1.02]">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100/80 to-amber-200/60 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner">
                <svg
                  className="w-10 h-10 text-amber-500/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-light text-slate-700 mb-3 text-center tracking-wide">
                {t("home.feature4Title")}
              </h3>
              <p className="text-slate-500 text-center text-sm leading-relaxed font-light">
                {t("home.feature4Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section px-3 sm:px-4 bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-slate-700 mb-4 sm:mb-6 tracking-wide">
              {t("home.howItWorksTitle")}
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto px-4 font-light leading-relaxed">
              {t("home.howItWorksSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 text-center relative border border-slate-100/50 shadow-sm hover:shadow-lg transition-all duration-500">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-200/80 to-blue-300/60 rounded-full flex items-center justify-center text-slate-600 font-light text-xl shadow-lg backdrop-blur-sm">
                  1
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl sm:text-2xl font-light text-slate-700 mb-4 tracking-wide">
                  {t("home.step1Title")}
                </h3>
                <p className="text-slate-500 leading-relaxed font-light">
                  {t("home.step1Desc")}
                </p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 text-center relative border border-slate-100/50 shadow-sm hover:shadow-lg transition-all duration-500">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-200/80 to-purple-300/60 rounded-full flex items-center justify-center text-slate-600 font-light text-xl shadow-lg backdrop-blur-sm">
                  2
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl sm:text-2xl font-light text-slate-700 mb-4 tracking-wide">
                  {t("home.step2Title")}
                </h3>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-light">
                  {t("home.step2Desc")}
                </p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 text-center relative sm:col-span-2 lg:col-span-1 border border-slate-100/50 shadow-sm hover:shadow-lg transition-all duration-500">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-200/80 to-emerald-300/60 rounded-full flex items-center justify-center text-slate-600 font-light text-xl shadow-lg backdrop-blur-sm">
                  3
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl sm:text-2xl font-light text-slate-700 mb-4 tracking-wide">
                  {t("home.step3Title")}
                </h3>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-light">
                  {t("home.step3Desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="section px-3 sm:px-4 bg-white/40 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-slate-700 mb-4 sm:mb-6 tracking-wide">
              {t("home.doctorsTitle")}
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto px-4 font-light leading-relaxed">
              {t("home.doctorsSubtitle")}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-blue-400/60"></div>
              <p className="mt-6 text-slate-500 font-light">
                {t("common.loading")}
              </p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500 text-lg font-light">
                {t("home.noDoctors")}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden border border-slate-100/50 shadow-sm hover:shadow-xl transition-all duration-500 hover:scale-[1.02] flex flex-col"
                  >
                    {/* Header with Image */}
                    <div className="relative bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-emerald-50/80 p-6 backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        {doctor.doctorProfile?.photo ? (
                          <img
                            src={`${API_URL.replace("/api", "")}${
                              doctor.doctorProfile.photo
                            }`}
                            alt={`${doctor.firstName} ${doctor.lastName}`}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white/80 shadow-lg"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                doctor.firstName + " " + doctor.lastName
                              )}&background=3b82f6&color=fff&size=128`;
                            }}
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400/70 to-emerald-400/70 flex items-center justify-center text-white text-3xl font-light border-4 border-white/80 shadow-lg">
                            {doctor.firstName?.[0]}
                            {doctor.lastName?.[0]}
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-light text-slate-700 mb-1 tracking-wide">
                            {doctor.firstName} {doctor.lastName}
                          </h3>
                          {doctor.doctorProfile?.specialization &&
                            doctor.doctorProfile.specialization.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {doctor.doctorProfile.specialization
                                  .slice(0, 2)
                                  .map((spec, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1 bg-blue-50/80 text-blue-600/80 text-xs font-light rounded-full border border-blue-100/50"
                                    >
                                      {spec}
                                    </span>
                                  ))}
                              </div>
                            )}
                          {doctor.doctorProfile?.rating && (
                            <StarRating
                              rating={doctor.doctorProfile.rating}
                              size="sm"
                              showNumber={true}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Years of Experience */}
                      {doctor.doctorProfile?.yearsOfExperience !== undefined &&
                        doctor.doctorProfile.yearsOfExperience > 0 && (
                          <div className="flex items-center gap-2 mb-4 text-sm text-slate-500">
                            <svg
                              className="w-5 h-5 text-blue-400/70"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="font-light text-slate-600">
                              {doctor.doctorProfile.yearsOfExperience}{" "}
                              {doctor.doctorProfile.yearsOfExperience === 1
                                ? "an"
                                : "ans"}{" "}
                              d'expérience
                            </span>
                          </div>
                        )}

                      {/* Languages */}
                      {doctor.doctorProfile?.languages &&
                        doctor.doctorProfile.languages.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="text-xs font-light text-slate-400 uppercase tracking-wide">
                              {t("doctor.languages")}:
                            </span>
                            {doctor.doctorProfile.languages.map((lang, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-gradient-to-r from-blue-50/60 to-purple-50/60 text-blue-600/70 text-xs rounded-full font-light border border-blue-100/50 backdrop-blur-sm"
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

                      {/* Description/Bio */}
                      {doctor.doctorProfile?.bio ? (
                        <div className="mb-5 flex-1">
                          <p className="text-slate-500 text-sm leading-relaxed font-light">
                            {doctor.doctorProfile.bio}
                          </p>
                        </div>
                      ) : (
                        <div className="mb-5 flex-1">
                          <p className="text-slate-300 text-sm italic font-light">
                            No description available
                          </p>
                        </div>
                      )}

                      {/* Footer with Price and Button */}
                      <div className="pt-5 border-t border-slate-100/50 mt-auto">
                        <div className="flex items-center justify-between">
                          <div>
                            {doctor.doctorProfile?.hourlyRate ? (
                              <p className="text-2xl font-light text-slate-700">
                                {doctor.doctorProfile.hourlyRate} MRU
                                <span className="text-sm text-slate-400 font-light ml-1">
                                  /hour
                                </span>
                              </p>
                            ) : (
                              <p className="text-sm text-slate-400 font-light">
                                Price not set
                              </p>
                            )}
                          </div>
                          {isAuthenticated && isClient ? (
                            <Link
                              to={`/client/bookings/new?doctorId=${doctor.id}`}
                              className="bg-gradient-to-r from-blue-400/80 to-emerald-400/80 text-white px-6 py-2.5 rounded-full hover:from-blue-500/90 hover:to-emerald-500/90 transition-all text-sm font-light tracking-wide shadow-md shadow-blue-200/30 hover:shadow-lg hover:shadow-blue-300/40 transform hover:scale-105 backdrop-blur-sm"
                            >
                              {t("booking.bookSession")}
                            </Link>
                          ) : (
                            <Link
                              to="/register"
                              className="bg-gradient-to-r from-blue-400/80 to-emerald-400/80 text-white px-6 py-2.5 rounded-full hover:from-blue-500/90 hover:to-emerald-500/90 transition-all text-sm font-light tracking-wide shadow-md shadow-blue-200/30 hover:shadow-lg hover:shadow-blue-300/40 transform hover:scale-105 backdrop-blur-sm"
                            >
                              {t("home.viewProfile")}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {isAuthenticated && isClient ? (
                <div className="text-center">
                  <Link
                    to="/client/therapists"
                    className="inline-block bg-gradient-to-r from-blue-400/80 to-emerald-400/80 text-white px-10 py-4 rounded-full hover:from-blue-500/90 hover:to-emerald-500/90 transition-all font-light tracking-wide shadow-lg shadow-blue-200/30 hover:shadow-xl hover:shadow-blue-300/40 transform hover:scale-105 backdrop-blur-sm"
                  >
                    {t("home.viewAll")}
                  </Link>
                </div>
              ) : (
                <div className="text-center">
                  <Link
                    to="/register"
                    className="inline-block bg-gradient-to-r from-blue-400/80 to-emerald-400/80 text-white px-10 py-4 rounded-full hover:from-blue-500/90 hover:to-emerald-500/90 transition-all font-light tracking-wide shadow-lg shadow-blue-200/30 hover:shadow-xl hover:shadow-blue-300/40 transform hover:scale-105 backdrop-blur-sm"
                  >
                    {t("home.viewAll")}
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="section px-3 sm:px-4 bg-gradient-to-br from-blue-100/40 via-emerald-100/30 to-purple-100/40 backdrop-blur-sm">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-slate-700 mb-6 tracking-wide">
              {t("home.ctaTitle")}
            </h2>
            <p className="text-lg sm:text-xl text-slate-500 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              {t("home.ctaSubtitle")}
            </p>
            <Link
              to="/register"
              className="inline-block bg-white/80 backdrop-blur-sm text-slate-600 px-10 py-5 rounded-full text-lg font-light tracking-wide hover:bg-white/90 transition-all duration-300 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transform hover:scale-105 border border-slate-200/50"
            >
              {t("home.ctaButton")}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
