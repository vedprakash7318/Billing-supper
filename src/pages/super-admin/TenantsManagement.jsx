import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import {
  Users,
  Search,
  Plus,
  Ban,
  ChevronLeft,
  ChevronRight,
  Store,
  RefreshCw,
  Edit,
  Trash2,
  Mail,
  Phone,
  Eye,
  Gift,
  Sparkles,
  Smartphone,
  MessageSquare,
  X,
} from 'lucide-react';
import { TENANT_STATUSES } from '../../constants';
import api from '../../services/api';
import { confirmDialog, toastSuccess, toastError } from '../../utils/alerts';

export default function TenantsManagement() {
  const [searchParams] = useSearchParams();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Server-side filters
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [plansList, setPlansList] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('ALL');

  // Booster Modal State
  const [boosterModalTenant, setBoosterModalTenant] = useState(null);
  const [boosterType, setBoosterType] = useState('SMS');
  const [boosterCredits, setBoosterCredits] = useState(100);
  const [boosterNote, setBoosterNote] = useState('');
  const [grantingBooster, setGrantingBooster] = useState(false);

  const openBoosterModal = (tenant) => {
    setBoosterModalTenant(tenant);
    setBoosterType('SMS');
    setBoosterCredits(100);
    setBoosterNote('');
  };

  const handleGrantBooster = async (e) => {
    e.preventDefault();
    if (!boosterModalTenant) return;
    if (!boosterCredits || Number(boosterCredits) <= 0) {
      toastError('Please enter a valid credit amount');
      return;
    }
    setGrantingBooster(true);
    try {
      const res = await api.post(`/super-admin/tenants/${boosterModalTenant.id || boosterModalTenant._id}/grant-booster`, {
        type: boosterType,
        credits: Number(boosterCredits),
        note: boosterNote.trim() || 'Complimentary booster gift by Super Admin',
      });
      if (res.data?.success) {
        toastSuccess(res.data.message || `Granted ${boosterCredits} free ${boosterType} credits!`);
        setBoosterModalTenant(null);
        fetchTenants();
      }
    } catch (err) {
      toastError(err.response?.data?.error || err.message || 'Failed to grant booster pack');
    } finally {
      setGrantingBooster(false);
    }
  };

  useEffect(() => {
    api.get('/super-admin/plans?limit=100')
      .then((res) => {
        if (res.data?.data) setPlansList(res.data.data);
      })
      .catch(() => {});
  }, []);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim(),
        status: statusFilter,
        planId: selectedPlanId,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const res = await api.get('/super-admin/tenants', { params });
      if (res.data?.success) {
        setTenants(res.data.data || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, selectedPlanId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTenants();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchTenants]);

  const toggleSuspend = async (tenant) => {
    const isCurrentlySuspended = tenant.status === 'SUSPENDED';
    const newStatus = isCurrentlySuspended ? 'ACTIVE' : 'SUSPENDED';
    const confirmed = await confirmDialog({
      title: isCurrentlySuspended ? 'Reactivate Client Access?' : 'Suspend Client Access?',
      text: isCurrentlySuspended
        ? `Reactivate account for "${tenant.businessName}". Client admin will be able to log in.`
        : `Suspend account for "${tenant.businessName}". Client admin will be blocked from accessing the system.`,
      confirmButtonText: isCurrentlySuspended ? 'Yes, Reactivate' : 'Yes, Suspend Account',
      isDangerous: !isCurrentlySuspended,
    });
    if (!confirmed) return;

    try {
      await api.put(`/super-admin/tenants/${tenant.id || tenant._id}`, { status: newStatus });
      toastSuccess(`Status updated to ${newStatus}`);
      fetchTenants();
    } catch (err) {
      toastError(err.response?.data?.error || err.message || 'Failed to update status');
    }
  };

  const handleDeleteTenant = async (tenant) => {
    const confirmed = await confirmDialog({
      title: 'Delete Client Admin & Business?',
      text: `Are you sure you want to permanently delete "${tenant.businessName}" and associated user credentials?`,
      confirmButtonText: 'Yes, Delete Client',
      isDangerous: true,
    });
    if (!confirmed) return;

    try {
      const res = await api.delete(`/super-admin/tenants/${tenant.id || tenant._id}`);
      toastSuccess(res.data?.message || 'Client account deleted successfully');
      fetchTenants();
    } catch (err) {
      toastError(err.response?.data?.error || err.message || 'Failed to delete client');
    }
  };

  return (
    <SuperAdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-7 h-7 text-indigo-600" />
              Admins & Business Clients
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage shop owners who purchased your billing app, adjust their dynamic subscriptions, and control server access.
            </p>
          </div>

          <Link
            to="/super-admin/tenants/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Admin</span>
          </Link>
        </div>

        {/* Server-Side Controls */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search business, owner, email, phone, GSTIN..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                {TENANT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedPlanId}
                onChange={(e) => {
                  setSelectedPlanId(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Subscription Plans</option>
                {plansList.map((p) => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.name} ({p.durationType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={pagination.limit}
                onChange={(e) => {
                  setPagination((p) => ({ ...p, limit: Number(e.target.value), page: 1 }));
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Fetching admins and subscriptions from server...</p>
            </div>
          ) : tenants.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No admins found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No business client matched your criteria.
              </p>
              <Link
                to="/super-admin/tenants/new"
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Admin</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Business & Slug</th>
                    <th className="py-3.5 px-5">Admin (Client) Account</th>
                    <th className="py-3.5 px-5">Active Plan</th>
                    <th className="py-3.5 px-5">Status & Validity</th>
                    <th className="py-3.5 px-5">Payment</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenants.map((tenant) => {
                    const tenantId = tenant.id || tenant._id;
                    const sub = tenant.subscriptions?.[0] || tenant.currentSubscription;
                    const now = new Date();
                    const endDate = sub?.endDate ? new Date(sub.endDate) : null;
                    const daysRemaining = endDate
                      ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                      : null;

                    const isExpired = tenant.status === 'EXPIRED' || (daysRemaining !== null && daysRemaining <= 0);
                    const isTrial = tenant.status === 'TRIAL';
                    const isSuspended = tenant.status === 'SUSPENDED';

                    return (
                      <tr key={tenantId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                              <Store className="w-5 h-5" />
                            </div>
                            <div>
                              <Link to={`/super-admin/tenants/${tenantId}`} className="group">
                                <p className="font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                                  <span>{tenant.businessName}</span>
                                </p>
                              </Link>
                              <p className="text-[11px] font-mono text-slate-400 mt-0.5">slug: {tenant.slug}</p>
                              {tenant.gstin && (
                                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                  GST: {tenant.gstin}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <p className="font-semibold text-slate-800 text-xs">{tenant.owner?.name}</p>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{tenant.owner?.email}</span>
                          </div>
                          {tenant.phone && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{tenant.phone}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-5">
                          {sub?.plan ? (
                            <div>
                              <span className="font-bold text-slate-900 text-xs">{sub.plan.name}</span>
                              <p className="text-[11px] text-slate-500">
                                {sub.plan.price === 0 ? 'Free' : `₹${sub.plan.price}`} • {sub.plan.durationType}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">No active plan</span>
                          )}
                        </td>

                        <td className="py-4 px-5">
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                isSuspended
                                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                                  : isExpired
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : isTrial
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {isSuspended ? 'Suspended' : isExpired ? 'Expired' : isTrial ? 'Free Trial' : 'Active'}
                            </span>

                            {endDate && (
                              <p className="text-[11px] text-slate-500 mt-1">
                                {daysRemaining !== null && daysRemaining > 0 ? (
                                  <span className="font-medium text-emerald-700">
                                    {daysRemaining} days left
                                  </span>
                                ) : (
                                  <span className="font-medium text-rose-600">
                                    Expired on {endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {sub?.paymentStatus || 'FREE'}
                          </span>
                          {sub?.amountPaid > 0 && (
                            <p className="text-[11px] font-bold text-slate-800 mt-1">
                              ₹{sub.amountPaid.toLocaleString('en-IN')}
                            </p>
                          )}
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openBoosterModal(tenant)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                              title="Gift Free SMS / WhatsApp Booster Credits"
                            >
                              <Gift className="w-3.5 h-3.5" />
                            </button>

                            <Link
                              to={`/super-admin/tenants/${tenantId}`}
                              className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors"
                              title="View Admin & Business Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            <Link
                              to={`/super-admin/tenants/${tenantId}/extend`}
                              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 flex items-center gap-1 transition-colors"
                              title="Extend / Change Subscription Plan"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Extend</span>
                            </Link>

                            <Link
                              to={`/super-admin/tenants/${tenantId}/edit`}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                              title="Edit Client & Password"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => toggleSuspend(tenant)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isSuspended
                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              }`}
                              title={isSuspended ? 'Activate Admin' : 'Suspend Admin Access'}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteTenant(tenant)}
                              className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                              title="Delete Tenant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium">
              Page <strong className="text-slate-800">{pagination.page}</strong> of{' '}
              <strong className="text-slate-800">{pagination.totalPages || 1}</strong> (Total{' '}
              <strong className="text-slate-800">{pagination.total}</strong> registered admins)
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-lg text-slate-700">
                {pagination.page} / {pagination.totalPages || 1}
              </span>

              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* FREE BOOSTER GRANT MODAL */}
        {boosterModalTenant && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Gift Free Booster Pack</h3>
                    <p className="text-[11px] text-slate-500">Credit free quota to {boosterModalTenant.businessName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBoosterModalTenant(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleGrantBooster} className="space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Booster Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBoosterType('SMS')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        boosterType === 'SMS'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>SMS Credits</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBoosterType('WHATSAPP')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        boosterType === 'WHATSAPP'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp Credits</span>
                    </button>
                  </div>
                </div>

                {/* Credits amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Number of Credits *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={boosterCredits}
                    onChange={(e) => setBoosterCredits(e.target.value)}
                    placeholder="e.g. 100, 500, 1000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                  {/* Preset quick pills */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 font-bold mr-1">Quick:</span>
                    {[50, 100, 250, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setBoosterCredits(amt)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border cursor-pointer ${
                          Number(boosterCredits) === amt
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note / Reason */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Note (Optional)</label>
                  <input
                    type="text"
                    value={boosterNote}
                    onChange={(e) => setBoosterNote(e.target.value)}
                    placeholder="e.g. Complimentary gift / customer support offer"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setBoosterModalTenant(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={grantingBooster}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>{grantingBooster ? 'Granting...' : `Grant ${boosterCredits} Free Credits`}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
