import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import {
  Layers,
  AlertCircle,
  Clock,
  ChevronLeft,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { DURATION_TYPES, PLAN_TYPES, formatDurationLabel } from '../../constants';
import api from '../../services/api';
import { toastSuccess } from '../../utils/alerts';

export default function PlanForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    planType: 'PAID',
    durationType: 'MONTHLY',
    durationValue: 1,
    price: 999,
    currency: 'INR',
    isPopular: false,
    isActive: true,
  });

  useEffect(() => {
    if (!isEditing) return;
    setLoading(true);
    api
      .get(`/super-admin/plans/${id}`)
      .then((res) => {
        const plan = res.data?.data;
        if (plan) {
          setFormData({
            name: plan.name,
            slug: plan.slug,
            description: plan.description || '',
            planType: plan.planType,
            durationType: plan.durationType,
            durationValue: plan.durationValue,
            price: plan.price,
            currency: plan.currency || 'INR',
            isPopular: Boolean(plan.isPopular),
            isActive: Boolean(plan.isActive),
          });
        }
      })
      .catch((err) => {
        setFormError(err.response?.data?.error || 'Failed to load plan details');
      })
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const handleSavePlan = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        planType: formData.planType,
        durationType: formData.durationType,
        durationValue: Number(formData.durationValue) || 1,
        price:
          formData.planType === 'FREE_TRIAL' || formData.planType === 'FREE'
            ? 0
            : Number(formData.price),
        currency: formData.currency || 'INR',
        isPopular: Boolean(formData.isPopular),
        isActive: Boolean(formData.isActive),
        // All permissions / unlimited by default
        maxInvoices: -1,
        maxCustomers: -1,
        maxProducts: -1,
        maxUsers: -1,
        features: ['all_permissions'],
      };

      if (isEditing) {
        await api.put(`/super-admin/plans/${id}`, payload);
        toastSuccess('Subscription plan updated successfully!');
      } else {
        await api.post('/super-admin/plans', payload);
        toastSuccess('Dynamic subscription plan created successfully!');
      }

      navigate('/super-admin/plans');
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to="/super-admin/plans"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Subscription Plans</span>
        </Link>

        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-indigo-600" />
            {isEditing ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic plan with full permissions: day-wise, week-wise, month-wise, trial, custom days, or lifetime access.
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading plan details from server...</p>
          </div>
        ) : (
          <form onSubmit={handleSavePlan} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
            {formError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Permission Notice */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full System Access Included: All features, unlimited billing, staff accounts & invoices are enabled for this plan.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7-Days Trial / Monthly Starter / Yearly Pro"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Slug (URL code)</label>
                <input
                  type="text"
                  placeholder="auto-generated if empty"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Plan Description (Optional)</label>
              <textarea
                rows={2}
                placeholder="Brief description for billing clients..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* DYNAMIC DURATION & PLAN TYPE */}
            <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Dynamic Duration & Plan Type</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Plan Category</label>
                  <select
                    value={formData.planType}
                    onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  >
                    {PLAN_TYPES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Duration Unit</label>
                  <select
                    value={formData.durationType}
                    onChange={(e) => setFormData({ ...formData, durationType: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  >
                    {DURATION_TYPES.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {formData.durationType === 'DAILY'
                      ? 'Number of Days'
                      : formData.durationType === 'WEEKLY'
                      ? 'Number of Weeks'
                      : formData.durationType === 'MONTHLY'
                      ? 'Number of Months'
                      : formData.durationType === 'YEARLY'
                      ? 'Number of Years'
                      : formData.durationType === 'CUSTOM_DAYS'
                      ? 'Exact Custom Days'
                      : 'Duration Count'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.durationValue}
                    onChange={(e) => setFormData({ ...formData, durationValue: Number(e.target.value) })}
                    disabled={formData.durationType === 'LIFETIME'}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 disabled:bg-slate-100"
                  />
                </div>
              </div>

              <p className="text-[11px] text-indigo-700 font-medium">
                Calculated Term: <strong>{formatDurationLabel(formData.durationType, formData.durationValue)}</strong>
              </p>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹ INR) *</label>
              <div className="relative max-w-xs">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  disabled={formData.planType === 'FREE_TRIAL' || formData.planType === 'FREE'}
                  className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 disabled:bg-slate-100"
                />
              </div>
              {(formData.planType === 'FREE_TRIAL' || formData.planType === 'FREE') && (
                <p className="text-[11px] text-slate-500 mt-1">Free & Trial plans are automatically priced at ₹0.</p>
              )}
            </div>

            {/* Toggles */}
            <div className="pt-2 flex items-center gap-6 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="font-semibold text-slate-800">Highlight as Popular Plan</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="font-semibold text-slate-800">Plan is Active & Available</span>
              </label>
            </div>

            <div className="pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                to="/super-admin/plans"
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : isEditing ? 'Update Plan' : 'Create Plan'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </SuperAdminLayout>
  );
}
