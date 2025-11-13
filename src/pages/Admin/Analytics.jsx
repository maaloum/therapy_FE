import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/analytics`);
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: t('admin.totalUsers'),
      value: analytics?.users?.total || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      bgGradient: 'from-blue-50/80 to-blue-100/60',
      textColor: 'text-blue-600/70',
      detail: `${analytics?.users?.clients || 0} ${t('admin.totalClients')}, ${analytics?.users?.doctors || 0} ${t('admin.totalDoctors')}`
    },
    {
      title: t('admin.totalRevenue'),
      value: `$${(analytics?.revenue?.total || 0).toFixed(2)}`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGradient: 'from-amber-50/80 to-amber-100/60',
      textColor: 'text-amber-600/70',
      detail: `${t('admin.monthlyRevenue')}: $${(analytics?.revenue?.monthly || 0).toFixed(2)}`
    },
    {
      title: t('admin.totalBookings'),
      value: analytics?.bookings?.total || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      bgGradient: 'from-rose-50/80 to-rose-100/60',
      textColor: 'text-rose-600/70',
      detail: `${analytics?.bookings?.completed || 0} ${t('admin.completedBookings')}`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-emerald-50/20">
      {/* Peaceful Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="section px-3 sm:px-4 pt-8 sm:pt-12">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Link
                  to="/admin/dashboard"
                  className="w-10 h-10 bg-white/70 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-slate-100/50 shadow-sm hover:shadow-lg transition-all"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-700 tracking-wide">
                    {t('admin.analytics')}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-500 font-light mt-1">
                    {t('admin.viewAnalytics')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-blue-400/60"></div>
              <p className="mt-6 text-slate-500 font-light">{t('common.loading')}</p>
            </div>
          ) : (
            <>
              {/* Main Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
                {statCards.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-slate-100/50 shadow-sm hover:shadow-xl transition-all duration-500 hover:scale-[1.02]"
                  >
                    <div className={`w-20 h-20 bg-gradient-to-br ${stat.bgGradient} rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>
                      <div className={stat.textColor}>
                        {stat.icon}
                      </div>
                    </div>
                    <h3 className="text-sm font-light text-slate-500 mb-2 tracking-wide">
                      {stat.title}
                    </h3>
                    <p className="text-3xl sm:text-4xl font-light text-slate-700 mb-3">
                      {stat.value}
                    </p>
                    {stat.detail && (
                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        {stat.detail}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Users Breakdown */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-slate-100/50 shadow-sm">
                  <h3 className="text-xl font-light text-slate-700 mb-6 tracking-wide">
                    {t('admin.users')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-slate-600">{t('admin.totalClients')}</span>
                      <span className="text-lg font-light text-slate-700">{analytics?.users?.clients || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-slate-600">{t('admin.totalDoctors')}</span>
                      <span className="text-lg font-light text-slate-700">{analytics?.users?.doctors || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Bookings Breakdown */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-slate-100/50 shadow-sm">
                  <h3 className="text-xl font-light text-slate-700 mb-6 tracking-wide">
                    {t('admin.bookings')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-slate-600">{t('admin.completedBookings')}</span>
                      <span className="text-lg font-light text-slate-700">{analytics?.bookings?.completed || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-slate-600">{t('admin.totalBookings')}</span>
                      <span className="text-lg font-light text-slate-700">{analytics?.bookings?.total || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

