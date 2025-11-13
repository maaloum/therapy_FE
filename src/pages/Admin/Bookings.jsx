import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const { t } = useTranslation();

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (statusFilter) params.append("status", statusFilter);

      const response = await axios.get(`${API_URL}/admin/bookings?${params}`);
      setBookings(response.data.data.bookings || []);
      setPagination(response.data.data.pagination || { total: 0, pages: 1 });
    } catch {
      console.error("Failed to load bookings");
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100/80 text-green-700 border-green-200/50";
      case "CONFIRMED":
        return "bg-blue-100/80 text-blue-700 border-blue-200/50";
      case "PENDING":
        return "bg-amber-100/80 text-amber-700 border-amber-200/50";
      case "CANCELLED":
        return "bg-rose-100/80 text-rose-700 border-rose-200/50";
      default:
        return "bg-slate-100/80 text-slate-700 border-slate-200/50";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
                  <svg
                    className="w-5 h-5 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-700 tracking-wide">
                    {t("admin.manageBookings")}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-500 font-light mt-1">
                    {t("admin.viewAllBookings")}
                  </p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-slate-100/50 shadow-sm mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-light text-slate-600 mb-2">
                    {t("booking.status")}
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl text-slate-700 font-light focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
                  >
                    <option value="">{t("common.filter")}</option>
                    <option value="PENDING">{t("booking.pending")}</option>
                    <option value="CONFIRMED">{t("booking.confirmed")}</option>
                    <option value="COMPLETED">{t("booking.completed")}</option>
                    <option value="CANCELLED">{t("booking.cancelled")}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-blue-400/60"></div>
              <p className="mt-6 text-slate-500 font-light">
                {t("common.loading")}
              </p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-100/50 shadow-sm">
              <p className="text-slate-500 text-lg font-light">
                {t("admin.noBookings")}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-100/50 shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-4 py-4 text-left text-sm font-light text-slate-600 tracking-wide">
                          {t("booking.client")}
                        </th>
                        <th className="px-4 py-4 text-left text-sm font-light text-slate-600 tracking-wide">
                          {t("booking.doctor")}
                        </th>
                        <th className="px-4 py-4 text-left text-sm font-light text-slate-600 tracking-wide">
                          {t("booking.sessionDate")}
                        </th>
                        <th className="px-4 py-4 text-left text-sm font-light text-slate-600 tracking-wide">
                          {t("booking.status")}
                        </th>
                        <th className="px-4 py-4 text-left text-sm font-light text-slate-600 tracking-wide">
                          {t("payment.amount")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                      {bookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className="hover:bg-slate-50/30 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <div className="font-light text-slate-700">
                              {booking.client?.user?.firstName}{" "}
                              {booking.client?.user?.lastName}
                            </div>
                            <div className="text-xs text-slate-400 font-light">
                              {booking.client?.user?.email}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-light text-slate-700">
                              {booking.doctor?.user?.firstName}{" "}
                              {booking.doctor?.user?.lastName}
                            </div>
                            <div className="text-xs text-slate-400 font-light">
                              {booking.doctor?.user?.email}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-slate-600 font-light">
                              {formatDate(booking.sessionDate)}
                            </div>
                            {booking.sessionType && (
                              <div className="text-xs text-slate-400 font-light">
                                {booking.sessionType}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-light border ${getStatusBadgeColor(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-light text-slate-700">
                              {booking.payment?.amount
                                ? `$${booking.payment.amount.toFixed(2)}`
                                : "-"}
                            </div>
                            {booking.payment?.status && (
                              <div className="text-xs text-slate-400 font-light">
                                {booking.payment.status}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 text-slate-600 font-light disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                  >
                    {t("common.previous")}
                  </button>
                  <span className="px-4 py-2 text-slate-600 font-light">
                    {t("common.page")} {page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(pagination.pages, p + 1))
                    }
                    disabled={page === pagination.pages}
                    className="px-4 py-2 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 text-slate-600 font-light disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                  >
                    {t("common.next")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
