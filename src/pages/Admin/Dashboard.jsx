import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/analytics`);
      setAnalytics(response.data.data);
    } catch {
      console.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-emerald-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-blue-400/60"></div>
          <p className="mt-6 text-slate-500 font-light">
            {t("common.loading")}
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: t("admin.totalUsers"),
      value: analytics?.users?.total || 0,
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      gradient: "from-blue-400/80 to-blue-500/80",
      bgGradient: "from-blue-50/80 to-blue-100/60",
      textColor: "text-blue-600/70",
    },
    {
      title: t("admin.totalClients"),
      value: analytics?.users?.clients || 0,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      gradient: "from-emerald-400/80 to-emerald-500/80",
      bgGradient: "from-emerald-50/80 to-emerald-100/60",
      textColor: "text-emerald-600/70",
    },
    {
      title: t("admin.totalDoctors"),
      value: analytics?.users?.doctors || 0,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      gradient: "from-purple-400/80 to-purple-500/80",
      bgGradient: "from-purple-50/80 to-purple-100/60",
      textColor: "text-purple-600/70",
    },
    {
      title: t("admin.totalRevenue"),
      value: `$${(analytics?.revenue?.total || 0).toFixed(2)}`,
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      gradient: "from-amber-400/80 to-amber-500/80",
      bgGradient: "from-amber-50/80 to-amber-100/60",
      textColor: "text-amber-600/70",
    },
    {
      title: t("admin.monthlyRevenue"),
      value: `$${(analytics?.revenue?.monthly || 0).toFixed(2)}`,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      gradient: "from-indigo-400/80 to-indigo-500/80",
      bgGradient: "from-indigo-50/80 to-indigo-100/60",
      textColor: "text-indigo-600/70",
    },
    {
      title: t("admin.totalBookings"),
      value: analytics?.bookings?.total || 0,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      gradient: "from-rose-400/80 to-rose-500/80",
      bgGradient: "from-rose-50/80 to-rose-100/60",
      textColor: "text-rose-600/70",
    },
    {
      title: t("admin.completedBookings"),
      value: analytics?.bookings?.completed || 0,
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      gradient: "from-green-400/80 to-green-500/80",
      bgGradient: "from-green-50/80 to-green-100/60",
      textColor: "text-green-600/70",
    },
  ];

  const quickActions = [
    {
      title: t("admin.manageUsers"),
      description: t("admin.viewAllUsers"),
      icon: (
        <svg
          className="w-6 h-6"
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
      ),
      link: "/admin/users",
      gradient: "from-blue-400/80 to-emerald-400/80",
    },
    {
      title: t("admin.manageBookings"),
      description: t("admin.viewAllBookings"),
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      link: "/admin/bookings",
      gradient: "from-purple-400/80 to-pink-400/80",
    },
    {
      title: t("admin.viewAnalytics"),
      description: t("admin.analytics"),
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      link: "/admin/analytics",
      gradient: "from-emerald-400/80 to-teal-400/80",
    },
  ];

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

      <div className="section px-3 sm:px-4 pt-8 sm:pt-12">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100/80 to-emerald-100/80 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600/70"
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
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-700 tracking-wide">
                  {t("admin.adminPanel")}
                </h1>
                <p className="text-sm sm:text-base text-slate-500 font-light mt-1">
                  {t("admin.welcomeBack")}, {user?.firstName || "Admin"}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {analytics && (
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-light text-slate-700 mb-6 tracking-wide">
                {t("admin.overview")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {statCards.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-100/50 shadow-sm hover:shadow-xl transition-all duration-500 hover:scale-[1.02]"
                  >
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${stat.bgGradient} rounded-2xl flex items-center justify-center mb-4 shadow-inner`}
                    >
                      <div className={stat.textColor}>{stat.icon}</div>
                    </div>
                    <h3 className="text-sm font-light text-slate-500 mb-2 tracking-wide">
                      {stat.title}
                    </h3>
                    <p className="text-2xl sm:text-3xl font-light text-slate-700">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Stats Row */}
          {analytics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {statCards.slice(4).map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-100/50 shadow-sm hover:shadow-xl transition-all duration-500 hover:scale-[1.02]"
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${stat.bgGradient} rounded-2xl flex items-center justify-center mb-4 shadow-inner`}
                  >
                    <div className={stat.textColor}>{stat.icon}</div>
                  </div>
                  <h3 className="text-sm font-light text-slate-500 mb-2 tracking-wide">
                    {stat.title}
                  </h3>
                  <p className="text-2xl sm:text-3xl font-light text-slate-700">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-light text-slate-700 mb-6 tracking-wide">
              {t("admin.quickActions")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-100/50 shadow-sm hover:shadow-xl transition-all duration-500 hover:scale-[1.02] group"
                >
                  <div
                    className={`w-14 h-14 bg-gradient-to-r ${action.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all`}
                  >
                    <div className="text-white">{action.icon}</div>
                  </div>
                  <h3 className="text-lg font-light text-slate-700 mb-2 tracking-wide group-hover:text-slate-900 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-light leading-relaxed">
                    {action.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-slate-100/50 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100/80 to-emerald-100/80 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-600/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-light text-slate-700 mb-2 tracking-wide">
                  {t("admin.recentActivity")}
                </h3>
                <p className="text-sm text-slate-500 font-light leading-relaxed">
                  {t("common.loading")}...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
