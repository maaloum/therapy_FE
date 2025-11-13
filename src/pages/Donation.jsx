import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Donation = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    amount: "",
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate donation processing
    setTimeout(() => {
      setLoading(false);
      toast.success(t("donation.successMessage"));
      setFormData({
        amount: "",
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    }, 2000);
  };

  const presetAmounts = [50, 100, 200, 500, 1000];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-emerald-50/20">
      {/* Decorative Elements */}
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
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-emerald-100/80 to-blue-100/80 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                  <svg
                    className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-500/70"
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
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-slate-700 mb-4 sm:mb-6 leading-relaxed tracking-wide">
              {t("donation.title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-light">
              {t("donation.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Why Donate Section */}
      <section className="section px-3 sm:px-4 bg-white/40 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-700 mb-4 sm:mb-6 tracking-wide">
              {t("donation.whyTitle")}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-slate-100/50 shadow-sm hover:shadow-lg transition-all duration-500 hover:scale-[1.02]">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100/80 to-blue-200/60 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner">
                <svg
                  className="w-8 h-8 text-blue-500/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-light text-slate-700 mb-3 text-center tracking-wide">
                {t("donation.reason1Title")}
              </h3>
              <p className="text-slate-500 text-center text-sm leading-relaxed font-light">
                {t("donation.reason1Desc")}
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-slate-100/50 shadow-sm hover:shadow-lg transition-all duration-500 hover:scale-[1.02]">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100/80 to-emerald-200/60 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner">
                <svg
                  className="w-8 h-8 text-emerald-500/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-light text-slate-700 mb-3 text-center tracking-wide">
                {t("donation.reason2Title")}
              </h3>
              <p className="text-slate-500 text-center text-sm leading-relaxed font-light">
                {t("donation.reason2Desc")}
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-slate-100/50 shadow-sm hover:shadow-lg transition-all duration-500 hover:scale-[1.02] sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100/80 to-purple-200/60 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner">
                <svg
                  className="w-8 h-8 text-purple-500/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-light text-slate-700 mb-3 text-center tracking-wide">
                {t("donation.reason3Title")}
              </h3>
              <p className="text-slate-500 text-center text-sm leading-relaxed font-light">
                {t("donation.reason3Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Form Section */}
      <section className="section px-3 sm:px-4 bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-slate-100/50 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-light text-slate-700 mb-8 text-center tracking-wide">
              {t("donation.formTitle")}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Preset Amounts */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t("donation.selectAmount")}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {presetAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, amount: amount.toString() })
                      }
                      className={`px-4 py-3 rounded-lg font-medium transition-all border-2 ${
                        formData.amount === amount.toString()
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-white/80 text-gray-700 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {amount} MRU
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("donation.customAmount")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">MRU</span>
                  </div>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("donation.name")}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t("donation.namePlaceholder")}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("auth.email")}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("auth.phone")} <span className="text-gray-400 font-normal text-xs">({t("common.optional")})</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="+22212345678"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("donation.message")} <span className="text-gray-400 font-normal text-xs">({t("common.optional")})</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder={t("donation.messagePlaceholder")}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !formData.amount}
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-lg"
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
                    {t("donation.donateButton")}
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
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section px-3 sm:px-4 bg-white/40 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-light text-slate-700 mb-6 tracking-wide">
            {t("donation.contactTitle")}
          </h2>
          <p className="text-lg sm:text-xl text-slate-500 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            {t("donation.contactText")}
          </p>
          <Link
            to="/about"
            className="inline-block bg-white/80 backdrop-blur-sm text-slate-600 px-10 py-5 rounded-full text-lg font-light tracking-wide hover:bg-white/90 transition-all duration-300 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transform hover:scale-105 border border-slate-200/50"
          >
            {t("donation.learnMore")}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Donation;

