import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const AboutUs = () => {
  const { t } = useTranslation();

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
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100/80 to-emerald-100/80 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                  <img
                    src="/logo.jpeg"
                    alt="JAM Logo"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover"
                  />
                </div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-slate-700 mb-4 sm:mb-6 leading-relaxed tracking-wide">
              {t("about.title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-light">
              {t("about.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section px-3 sm:px-4 bg-white/40 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-slate-100/50 shadow-sm">
            <div className="text-center mb-8">
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-700 mb-4 tracking-wide">
                {t("about.missionTitle")}
              </h2>
            </div>
            <p className="text-slate-600 text-center text-base sm:text-lg leading-relaxed font-light max-w-3xl mx-auto">
              {t("about.missionText")}
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section px-3 sm:px-4 bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-700 mb-4 sm:mb-6 tracking-wide">
              {t("about.valuesTitle")}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-500 max-w-2xl mx-auto px-4 font-light leading-relaxed">
              {t("about.valuesSubtitle")}
            </p>
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
                {t("about.value1Title")}
              </h3>
              <p className="text-slate-500 text-center text-sm leading-relaxed font-light">
                {t("about.value1Desc")}
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-light text-slate-700 mb-3 text-center tracking-wide">
                {t("about.value2Title")}
              </h3>
              <p className="text-slate-500 text-center text-sm leading-relaxed font-light">
                {t("about.value2Desc")}
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-light text-slate-700 mb-3 text-center tracking-wide">
                {t("about.value3Title")}
              </h3>
              <p className="text-slate-500 text-center text-sm leading-relaxed font-light">
                {t("about.value3Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section px-3 sm:px-4 bg-white/40 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-slate-100/50 shadow-sm">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-700 mb-6 text-center tracking-wide">
              {t("about.storyTitle")}
            </h2>
            <div className="space-y-6 text-slate-600 leading-relaxed font-light">
              <p className="text-base sm:text-lg">
                {t("about.storyText1")}
              </p>
              <p className="text-base sm:text-lg">
                {t("about.storyText2")}
              </p>
              <p className="text-base sm:text-lg">
                {t("about.storyText3")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section px-3 sm:px-4 bg-gradient-to-br from-blue-100/40 via-emerald-100/30 to-purple-100/40 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-700 mb-6 tracking-wide">
            {t("about.ctaTitle")}
          </h2>
          <p className="text-lg sm:text-xl text-slate-500 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            {t("about.ctaSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/donation"
              className="inline-block bg-gradient-to-r from-blue-400/80 to-emerald-400/80 text-white px-10 py-5 rounded-full text-lg font-light tracking-wide shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              {t("about.donateButton")}
            </Link>
            <Link
              to="/register"
              className="inline-block bg-white/80 backdrop-blur-sm text-slate-600 px-10 py-5 rounded-full text-lg font-light tracking-wide hover:bg-white/90 transition-all duration-300 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transform hover:scale-105 border border-slate-200/50"
            >
              {t("about.joinButton")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;

