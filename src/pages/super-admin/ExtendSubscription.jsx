import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import {
  RefreshCw,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { formatDurationLabel } from '../../constants';
import api from '../../services/api';
import { toastSuccess } from '../../utils/alerts';

export default function ExtendSubscription() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState(null);
  const [plansList, setPlansList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [extendForm, setExtendForm] = useState({
    planId: '',
    customDays: '',
    paymentStatus: 'PAID',
    paymentMethod: 'UPI',
    amountPaid: '',
    notes: '',
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/super-admin/tenants/${id}`),
      api.get('/super-admin/plans?limit=100'),
    ])
      .then(([tenantRes, plansRes]) => {
        const t = tenantRes.data?.data;
        const pList = plansRes.data?.data || [];
        setTenant(t);
        setPlansList(pList);

        const currentPlanId =
          t?.currentSubscription?.plan?._id ||
          t?.currentSubscription?.plan ||
          pList[0]?.id ||
          pList[0]?._id ||
          '';

        const matchedPlan = pList.find((p) => (p.id || p._id) === currentPlanId);
        setExtendForm({
          planId: currentPlanId,
          customDays: '',
          paymentStatus:
            matchedPlan?.planType === 'FREE_TRIAL' || matchedPlan?.planType === 'FREE'
              ? 'FREE'
              : 'PAID',
          paymentMethod: 'UPI',
          amountPaid: matchedPlan?.price?.toString() || '0',
          notes: `Extension for ${t?.businessName || ''}`,
        });
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load subscription details');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveExtension = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await api.post(`/super-admin/tenants/${id}/subscription`, {
        planId: extendForm.planId,
        customDays: extendForm.customDays ? Number(extendForm.customDays) : undefined,
        paymentStatus: extendForm.paymentStatus,
        paymentMethod: extendForm.paymentMethod,
        amountPaid: Number(extendForm.amountPaid) || 0,
        notes: extendForm.notes,
      });

      if (res.data?.success) {
        toastSuccess('Subscription renewed & activated successfully!');
        navigate('/super-admin/tenants');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to extend subscription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/super-admin/tenants"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Admins List</span>
        </Link>

        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <RefreshCw className="w-7 h-7 text-indigo-600" />
            Extend / Renew Subscription
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign a new dynamic plan or extend validity for <strong>{tenant?.businessName || 'this business'}</strong>.
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading subscription details...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleSaveExtension} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-5">
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Dynamic Plan *</label>
                <select
                  required
                  value={extendForm.planId}
                  onChange={(e) => {
                    const selected = plansList.find((p) => (p.id || p._id) === e.target.value);
                    setExtendForm({
                      ...extendForm,
                      planId: e.target.value,
                      amountPaid: selected?.price?.toString() || '0',
                      paymentStatus:
                        selected?.planType === 'FREE_TRIAL' || selected?.planType === 'FREE'
                          ? 'FREE'
                          : 'PAID',
                    });
                  }}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 bg-white"
                >
                  {plansList.length === 0 ? (
                    <option value="">No plans available — create a plan first</option>
                  ) : (
                    plansList.map((p) => (
                      <option key={p.id || p._id} value={p.id || p._id}>
                        {p.name} - ₹{p.price} ({formatDurationLabel(p.durationType, p.durationValue)})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Duration Days (Optional override)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 15 or 45 days (leave empty to use plan default)"
                  value={extendForm.customDays}
                  onChange={(e) => setExtendForm({ ...extendForm, customDays: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={extendForm.paymentStatus}
                    onChange={(e) => setExtendForm({ ...extendForm, paymentStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white"
                  >
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FREE">FREE / TRIAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={extendForm.paymentMethod}
                    onChange={(e) => setExtendForm({ ...extendForm, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="CASH">Cash Collection</option>
                    <option value="BANK_TRANSFER">Bank IMPS / NEFT</option>
                    <option value="ONLINE">Online Gateway</option>
                    <option value="MANUAL">Manual / Free</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount Collected (₹)</label>
                  <input
                    type="number"
                    value={extendForm.amountPaid}
                    onChange={(e) => setExtendForm({ ...extendForm, amountPaid: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={extendForm.notes}
                  onChange={(e) => setExtendForm({ ...extendForm, notes: e.target.value })}
                  placeholder="Internal reference or transaction ID"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Link
                  to="/super-admin/tenants"
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving || plansList.length === 0}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saving ? 'Activating...' : 'Save & Activate Subscription'}</span>
                </button>
              </div>
            </form>

            {/* Subscription History */}
            {tenant?.subscriptions?.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Subscription History ({tenant.subscriptions.length})
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                        <th className="py-2.5 px-3">Plan</th>
                        <th className="py-2.5 px-3">Start Date</th>
                        <th className="py-2.5 px-3">End Date</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tenant.subscriptions.map((sub) => (
                        <tr key={sub._id}>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{sub.plan?.name || 'Plan'}</td>
                          <td className="py-2.5 px-3 text-slate-600">{new Date(sub.startDate).toLocaleDateString('en-IN')}</td>
                          <td className="py-2.5 px-3 text-slate-600">{new Date(sub.endDate).toLocaleDateString('en-IN')}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">₹{sub.amountPaid || 0}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                              {sub.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
