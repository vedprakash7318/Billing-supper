import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import {
  Users,
  Layers,
  CheckCircle2,
  Clock,
  IndianRupee,
  UserPlus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  Store,
} from 'lucide-react';
import api from '../../services/api';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/super-admin/stats');
      if (res.data?.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <SuperAdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                MERN SaaS Master Control
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Billing SaaS Operations Center
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-xl">
                Sell your billing software to shop owners, create dynamic day/week/month/custom subscription packages in MongoDB, and monitor clients server-side.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/super-admin/plans"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-slate-700 flex items-center gap-2 shadow-sm transition-all"
              >
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Manage Dynamic Plans</span>
              </Link>
              <Link
                to="/super-admin/tenants/new"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Onboard New Admin / Client</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Admins (Clients)
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900">
                {loading ? '...' : stats?.totalTenants ?? 0}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {stats?.activeTenants ?? 0} Active
                </span>
                <span>•</span>
                <span className="text-amber-600 font-medium">
                  {stats?.trialTenants ?? 0} In Trial
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Licenses
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900">
                {loading ? '...' : (stats?.activeTenants ?? 0) + (stats?.trialTenants ?? 0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Currently running billing instances
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Expired / Attention Needed
              </span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-rose-600">
                {loading ? '...' : (stats?.expiredTenants ?? 0) + (stats?.expiringSoon?.length ?? 0)}
              </div>
              <p className="text-xs text-rose-500/80 font-medium mt-1">
                {stats?.expiringSoon?.length ?? 0} expiring in next 7 days
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Collections
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900">
                ₹{loading ? '...' : (stats?.totalRevenue ?? 0).toLocaleString('en-IN')}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Across all dynamic plans</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Plan Categories & Urgent Renewals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Expiring in 7 Days
                  </h3>
                  <p className="text-xs text-slate-500">Requires renewal outreach</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {stats?.expiringSoon?.length || 0}
              </span>
            </div>

            <div className="mt-4 flex-1 space-y-3 overflow-y-auto max-h-80">
              {!stats?.expiringSoon || stats.expiringSoon.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No subscriptions expiring in the next 7 days.
                </div>
              ) : (
                stats.expiringSoon.map((sub) => {
                  const daysLeft = Math.ceil(
                    (new Date(sub.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {sub.tenant?.businessName}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{sub.plan?.name}</span>
                          <span>•</span>
                          <span className="text-amber-700 font-semibold">
                            {daysLeft <= 0 ? 'Expires today' : `${daysLeft} days left`}
                          </span>
                        </p>
                      </div>

                      <Link
                        to={`/super-admin/tenants?search=${encodeURIComponent(sub.tenant?.businessName || '')}`}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shrink-0"
                      >
                        Extend
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Dynamic Subscription Plans Active
                  </h3>
                  <p className="text-xs text-slate-500">
                    Day-wise, week-wise, month-wise, custom duration packages
                  </p>
                </div>

                <Link
                  to="/super-admin/plans"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>View All Plans ({stats?.totalPlans ?? 0})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stats?.plansWithCount?.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{plan.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {plan.price === 0 ? 'Free / Trial' : `₹${plan.price.toLocaleString('en-IN')}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs">
                        {plan._count?.subscriptions || 0} Subscribed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Supports infinite custom day, week, month, & lifetime durations</span>
              <Link to="/super-admin/plans" className="font-semibold text-indigo-600 hover:underline">
                + Create New Plan Type
              </Link>
            </div>
          </div>
        </div>

        {/* Recently Onboarded Admins */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recently Onboarded Businesses (Admins)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Software clients using the billing platform
              </p>
            </div>

            <Link
              to="/super-admin/tenants"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              <span>Manage All Admins</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Business & Owner</th>
                  <th className="py-3 px-4">Plan Assigned</th>
                  <th className="py-3 px-4">Subscription Status</th>
                  <th className="py-3 px-4">Duration & Expiry</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!stats?.recentTenants || stats.recentTenants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                      No admins created yet.
                    </td>
                  </tr>
                ) : (
                  stats.recentTenants.map((tenant) => {
                    const sub = tenant.subscriptions?.[0];
                    const isTrial = tenant.status === 'TRIAL';
                    const isActive = tenant.status === 'ACTIVE';
                    const isExpired = tenant.status === 'EXPIRED';

                    return (
                      <tr key={tenant.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                              <Store className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                              <Link to={`/super-admin/tenants/${tenant._id || tenant.id}`} className="hover:text-indigo-600 transition-colors">
                                <p className="font-bold text-slate-900 text-sm hover:text-indigo-600">{tenant.businessName}</p>
                              </Link>
                              <p className="text-xs text-slate-500">
                                {tenant.owner?.name} • {tenant.owner?.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 text-xs">
                            {sub?.plan?.name || 'No Plan'}
                          </span>
                          <p className="text-[11px] text-slate-500">
                            {sub?.plan?.durationType ? `${sub.plan.durationType} based` : ''}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isTrial
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : isExpired
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {tenant.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {sub?.endDate ? (
                            <div>
                              <p className="font-medium text-slate-800">
                                {new Date(sub.endDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                              <p className="text-[11px] text-slate-400">Valid until</p>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/super-admin/tenants/${tenant._id || tenant.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                          >
                            <span>View Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
