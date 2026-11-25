import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { DURATION_TYPES, PLAN_TYPES, formatDurationLabel } from '../../constants';
import api from '../../services/api';
import { confirmDialog, toastSuccess, toastError } from '../../utils/alerts';

export default function PlansManagement() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
  });

  // Server-side filters
  const [search, setSearch] = useState('');
  const [selectedDurationType, setSelectedDurationType] = useState('ALL');
  const [selectedPlanType, setSelectedPlanType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim(),
        durationType: selectedDurationType,
        planType: selectedPlanType,
        status: selectedStatus,
        sortBy: 'sortOrder',
        sortOrder: 'asc',
      };

      const res = await api.get('/super-admin/plans', { params });
      if (res.data?.success) {
        setPlans(res.data.data || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, selectedDurationType, selectedPlanType, selectedStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlans();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchPlans]);

  const handleDeletePlan = async (id, name) => {
    const confirmed = await confirmDialog({
      title: 'Deactivate Subscription Plan?',
      text: `Are you sure you want to deactivate "${name}"? Existing subscribers will remain valid until expiration.`,
      confirmButtonText: 'Yes, Deactivate Plan',
      isDangerous: true,
    });
    if (!confirmed) return;

    try {
      const res = await api.delete(`/super-admin/plans/${id}`);
      toastSuccess(res.data?.message || 'Plan deactivated successfully');
      fetchPlans();
    } catch (err) {
      toastError(err.response?.data?.error || err.message || 'Failed to delete plan');
    }
  };

  return (
    <SuperAdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-7 h-7 text-indigo-600" />
              Dynamic Subscription Plans
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure flexible plans with full access: day-wise, week-wise, month-wise, free trials, custom days, or lifetime licenses.
            </p>
          </div>

          <Link
            to="/super-admin/plans/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
          </Link>
        </div>

        {/* Server-Side Controls Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search plan by name or slug..."
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
                value={selectedDurationType}
                onChange={(e) => {
                  setSelectedDurationType(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Duration Types</option>
                {DURATION_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedPlanType}
                onChange={(e) => {
                  setSelectedPlanType(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Plan Types</option>
                {PLAN_TYPES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive / Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Fetching subscription plans from server...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No subscription plans found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No plans matched your criteria. Click below to create a dynamic plan.
            </p>
            <Link
              to="/super-admin/plans/new"
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Dynamic Plan</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isTrial = plan.planType === 'FREE_TRIAL';
              const isFree = plan.planType === 'FREE';
              const planId = plan.id || plan._id;

              return (
                <div
                  key={planId}
                  className={`bg-white rounded-3xl p-6 border transition-all relative flex flex-col justify-between ${
                    plan.isPopular
                      ? 'border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/10'
                      : 'border-slate-200/80 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                            isTrial
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : isFree
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {plan.planType.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {formatDurationLabel(plan.durationType, plan.durationValue)}
                        </span>
                      </div>

                      {plan.isPopular && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Popular
                        </span>
                      )}
                    </div>

                    <div className="mt-2">
                      <h3 className="text-lg font-black text-slate-900 leading-tight">{plan.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {plan.description || 'Flexible billing plan for businesses.'}
                      </p>
                    </div>

                    <div className="mt-5 pb-5 border-b border-slate-100 flex items-baseline gap-1">
                      {isTrial || isFree || plan.price === 0 ? (
                        <div className="text-2xl font-black text-slate-900">
                          {isTrial ? 'Free Trial' : '₹0 Free'}
                        </div>
                      ) : (
                        <>
                          <span className="text-xs font-bold text-slate-400">₹</span>
                          <span className="text-3xl font-black text-slate-900">
                            {plan.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            / {formatDurationLabel(plan.durationType, plan.durationValue)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* All Permissions Badge */}
                    <div className="py-4">
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>All Permissions & Features Enabled</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      Subscribers: <strong className="text-slate-800">{plan.subscriberCount || 0}</strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/super-admin/plans/${planId}/edit`}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors"
                        title="Edit Plan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDeletePlan(planId, plan.name)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                        title="Delete / Deactivate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Server-Side Pagination Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Showing Page <strong className="text-slate-800">{pagination.page}</strong> of{' '}
            <strong className="text-slate-800">{pagination.totalPages || 1}</strong> (Total{' '}
            <strong className="text-slate-800">{pagination.total}</strong> dynamic plans)
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
    </SuperAdminLayout>
  );
}
