import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import {
  Store,
  User,
  Layers,
  Calendar,
  CreditCard,
  ChevronLeft,
  Edit,
  RefreshCw,
  Ban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  FileText,
  IndianRupee,
} from 'lucide-react';
import { formatDurationLabel } from '../../constants';
import api from '../../services/api';
import { confirmDialog, toastSuccess, toastError } from '../../utils/alerts';

export default function TenantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTenant = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/super-admin/tenants/${id}`);
      if (res.data?.success) {
        setTenant(res.data.data);
      } else {
        setError('Failed to load admin details');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error fetching client details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, [id]);

  const toggleSuspend = async () => {
    if (!tenant) return;
    const isCurrentlySuspended = tenant.status === 'SUSPENDED';
    const newStatus = isCurrentlySuspended ? 'ACTIVE' : 'SUSPENDED';
    const confirmed = await confirmDialog({
      title: isCurrentlySuspended ? 'Reactivate Client Access?' : 'Suspend Client Access?',
      text: isCurrentlySuspended
        ? `Reactivate account for "${tenant.businessName}". Client admin and staff will regain system access.`
        : `Suspend account for "${tenant.businessName}". Client admin will be blocked from accessing the billing engine.`,
      confirmButtonText: isCurrentlySuspended ? 'Yes, Reactivate' : 'Yes, Suspend Account',
      isDangerous: !isCurrentlySuspended,
    });
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await api.put(`/super-admin/tenants/${tenant.id || tenant._id}`, { status: newStatus });
      toastSuccess(`Status updated to ${newStatus}`);
      fetchTenant();
    } catch (err) {
      toastError(err.response?.data?.error || err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="max-w-6xl mx-auto py-24 text-center">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-slate-500 font-semibold tracking-wide">
            Loading business profile & subscription data...
          </p>
        </div>
      </SuperAdminLayout>
    );
  }

  if (error || !tenant) {
    return (
      <SuperAdminLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <Link
            to="/super-admin/tenants"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Admins List</span>
          </Link>

          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">Admin Account Not Found</h2>
            <p className="text-xs text-slate-500">{error || 'This tenant does not exist or has been removed.'}</p>
            <button
              onClick={() => navigate('/super-admin/tenants')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Return to Admins Directory
            </button>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  const sub = tenant.currentSubscription;
  const now = new Date();
  const endDate = sub?.endDate ? new Date(sub.endDate) : null;
  const startDate = sub?.startDate ? new Date(sub.startDate) : null;
  const daysRemaining = endDate
    ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpired = tenant.status === 'EXPIRED' || (daysRemaining !== null && daysRemaining <= 0);
  const isTrial = tenant.status === 'TRIAL';
  const isSuspended = tenant.status === 'SUSPENDED';

  return (
    <SuperAdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/super-admin/tenants"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Admins Directory</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to={`/super-admin/tenants/${tenant.id || tenant._id}/extend`}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Extend / Renew Plan</span>
            </Link>

            <Link
              to={`/super-admin/tenants/${tenant.id || tenant._id}/edit`}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Details & Password</span>
            </Link>

            <button
              onClick={toggleSuspend}
              disabled={actionLoading}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all ${
                isSuspended
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{isSuspended ? 'Reactivate Access' : 'Suspend Access'}</span>
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-600/20 shrink-0">
                <Store className="w-8 h-8" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {tenant.businessName}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${
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
                    {isSuspended ? 'Account Suspended' : isExpired ? 'Subscription Expired' : isTrial ? 'Free Trial' : 'Active Client'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Tenant Slug: <span className="text-slate-800 font-bold">{tenant.slug}</span> • Onboarded: {new Date(tenant.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-6 divide-x divide-slate-100 text-right md:text-left">
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Active Plan</span>
                <span className="text-base font-black text-slate-900">
                  {sub?.plan?.name || 'No Plan'}
                </span>
              </div>
              <div className="pl-6">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Validity</span>
                <span className="text-base font-black text-slate-900">
                  {daysRemaining !== null && daysRemaining > 0 ? (
                    <span className="text-emerald-600">{daysRemaining} Days Left</span>
                  ) : (
                    <span className="text-rose-600">Expired</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Owner / Admin</p>
                <p className="text-xs font-bold text-slate-800 truncate">{tenant.owner?.name || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Login Email</p>
                <p className="text-xs font-bold text-slate-800 truncate">{tenant.owner?.email || tenant.email || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Contact Phone</p>
                <p className="text-xs font-bold text-slate-800 truncate">{tenant.phone || tenant.owner?.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Location</p>
                <p className="text-xs font-bold text-slate-800 truncate">
                  {[tenant.city, tenant.state].filter(Boolean).join(', ') || 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Subscription Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5 lg:col-span-1">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Subscription License</span>
              </div>
              <Link
                to={`/super-admin/tenants/${tenant.id || tenant._id}/extend`}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Change Plan
              </Link>
            </div>

            {sub ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                    {sub.plan?.planType || 'PAID'}
                  </span>
                  <h3 className="text-base font-black text-slate-900">{sub.plan?.name || 'Active Plan'}</h3>
                  <div className="flex items-baseline gap-1 text-slate-900 font-extrabold">
                    <span className="text-xl">₹{sub.amountPaid || sub.plan?.price || 0}</span>
                    <span className="text-xs text-slate-500 font-medium">
                      / {formatDurationLabel(sub.plan?.durationType, sub.plan?.durationValue)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Plan Duration:</span>
                    <span className="font-semibold text-slate-800">
                      {formatDurationLabel(sub.plan?.durationType, sub.plan?.durationValue)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Start Date:</span>
                    <span className="font-semibold text-slate-800">
                      {startDate ? startDate.toLocaleDateString('en-IN') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">End Date (Expiry):</span>
                    <span className="font-semibold text-slate-800">
                      {endDate ? endDate.toLocaleDateString('en-IN') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Payment Status:</span>
                    <span className="font-bold text-emerald-700 uppercase">{sub.paymentStatus || 'PAID'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Payment Method:</span>
                    <span className="font-semibold text-slate-800">{sub.paymentMethod || 'MANUAL'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Amount Collected:</span>
                    <span className="font-bold text-slate-900">₹{sub.amountPaid || 0}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Full Permissions & Unlimited Access</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No active subscription found. Click "Extend / Renew Plan" to assign one.
              </div>
            )}
          </div>

          {/* Business & Admin Account Specs */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6 lg:col-span-2">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-slate-900 text-sm">
                <Store className="w-4 h-4 text-indigo-600" />
                <span>Complete Business & Store Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Store / Company Name</span>
                  <span className="font-bold text-slate-800 text-sm">{tenant.businessName}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Software Slug</span>
                  <span className="font-mono font-bold text-indigo-600 text-sm">{tenant.slug}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">GSTIN / Tax ID</span>
                  <span className="font-mono font-bold text-slate-800">{tenant.gstin || 'Not registered / exempt'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Currency Code</span>
                  <span className="font-bold text-slate-800">{tenant.currency || 'INR (₹)'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl sm:col-span-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Address / City / State</span>
                  <span className="font-medium text-slate-700">
                    {[tenant.address, tenant.city, tenant.state, tenant.pincode].filter(Boolean).join(', ') || 'No address registered'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-slate-900 text-sm">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Admin Login Credentials & Security</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Client Admin Name</span>
                  <span className="font-bold text-slate-800 text-sm">{tenant.owner?.name}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Client Login Username</span>
                  <span className="font-bold text-slate-800 text-sm">{tenant.owner?.email}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">System Role</span>
                  <span className="font-mono font-bold text-purple-700">{tenant.owner?.role || 'ADMIN'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Account Security Status</span>
                  <span className="font-bold text-emerald-700">{tenant.owner?.status || 'ACTIVE'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription History Table */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Full Subscription History ({tenant.subscriptions?.length || 0})</span>
            </h2>
            <Link
              to={`/super-admin/tenants/${tenant.id || tenant._id}/extend`}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Add New Subscription Cycle</span>
            </Link>
          </div>

          {!tenant.subscriptions || tenant.subscriptions.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No previous subscription records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Plan Name</th>
                    <th className="py-3 px-4">Start Date</th>
                    <th className="py-3 px-4">End Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenant.subscriptions.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {s.plan?.name || 'Subscription Plan'}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {formatDurationLabel(s.plan?.durationType, s.plan?.durationValue)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {new Date(s.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {new Date(s.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{s.amountPaid?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {s.paymentMethod || 'MANUAL'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 italic text-[11px]">
                        {s.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
}
