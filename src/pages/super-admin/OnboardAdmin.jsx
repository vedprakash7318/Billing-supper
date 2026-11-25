import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import {
  UserPlus,
  Store,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronLeft,
  Copy,
  ExternalLink,
  X,
  KeyRound,
} from 'lucide-react';
import { formatDurationLabel } from '../../constants';
import api from '../../services/api';
import { toastSuccess } from '../../utils/alerts';

export default function OnboardAdmin() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdCreds, setCreatedCreds] = useState(null);

  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstin: '',
    planId: '',
    customDurationDays: '',
    paymentStatus: 'PAID',
    paymentMethod: 'UPI',
    amountPaid: '',
    notes: '',
  });

  useEffect(() => {
    api.get('/super-admin/plans?limit=100&status=active')
      .then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          const list = res.data.data;
          setPlans(list);
          const first = list[0];
          setFormData((prev) => ({
            ...prev,
            planId: first.id || first._id,
            amountPaid: first.price?.toString() || '0',
            paymentStatus: first.planType === 'FREE_TRIAL' || first.planType === 'FREE' ? 'FREE' : 'PAID',
          }));
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingPlans(false));
  }, []);

  const handlePlanChange = (planId) => {
    const selected = plans.find((p) => (p.id || p._id) === planId);
    setFormData((prev) => ({
      ...prev,
      planId,
      amountPaid: selected ? selected.price.toString() : '0',
      paymentStatus: selected?.planType === 'FREE_TRIAL' || selected?.planType === 'FREE' ? 'FREE' : 'PAID',
    }));
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pwd }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await api.post('/super-admin/tenants', formData);
      if (res.data?.success) {
        setSuccess(true);
        setCreatedCreds({
          businessName: formData.businessName,
          ownerName: formData.ownerName,
          email: formData.email,
          password: formData.password,
          loginUrl: 'http://localhost:3002/login',
        });
        toastSuccess('Client admin created & subscription activated!');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to onboard client');
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
            <UserPlus className="w-7 h-7 text-indigo-600" />
            Onboard Business & Create Admin
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create a new client account, assign a dynamic subscription plan in MongoDB, and issue software credentials.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>Admin account created and subscription activated! Redirecting to Admins directory...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: BUSINESS PROFILE */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Step 1: Business Profile Details</h2>
                <p className="text-xs text-slate-500">Shop or company information of the client purchasing the billing software</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Business / Store Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahavir Supermarket & Electronics"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Mobile / Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN / Tax ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 27AABCT3518Q1ZY"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  placeholder="e.g. Pune"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: ADMIN CREDENTIALS */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Step 2: Admin Login Account</h2>
                <p className="text-xs text-slate-500">Credentials the client will use to log into their billing dashboard</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Owner / Admin Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Client Login Email (Username) *</label>
                <input
                  type="email"
                  required
                  placeholder="client@store.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Login Password *</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Generate Secure Password
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: DYNAMIC PLAN ASSIGNMENT */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Step 3: Dynamic Subscription Plan & License Assignment</h2>
                <p className="text-xs text-slate-500">Select which day/week/month/custom plan to activate for this client</p>
              </div>
            </div>

            {loadingPlans ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading plans...</div>
            ) : plans.length === 0 ? (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>No Subscription Plans Found</span>
                </div>
                <p>
                  Please create at least one dynamic subscription plan (day/week/month/trial) before onboarding client admins.
                </p>
                <Link
                  to="/super-admin/plans/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm"
                >
                  Create Plan Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {plans.map((p) => {
                    const isSelected = formData.planId === (p.id || p._id);
                    return (
                      <div
                        key={p.id || p._id}
                        onClick={() => handlePlanChange(p.id || p._id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all select-none ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {formatDurationLabel(p.durationType, p.durationValue)}
                          </span>
                          <span className="font-extrabold text-xs text-slate-900">
                            {p.price === 0 ? 'Free' : `₹${p.price}`}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-2">{p.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Custom Days Override (Optional)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Want to give a special trial or custom duration? (e.g. 14 days, 45 days, 90 days). If set, this overrides the default plan duration.
                  </p>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter number of days (e.g. 15)"
                    value={formData.customDurationDays}
                    onChange={(e) => setFormData({ ...formData, customDurationDays: e.target.value })}
                    className="w-full sm:w-64 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Payment Status</label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    >
                      <option value="PAID">PAID</option>
                      <option value="PENDING">PENDING</option>
                      <option value="FREE">FREE / TRIAL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    >
                      <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                      <option value="CASH">Cash Collection</option>
                      <option value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</option>
                      <option value="ONLINE">Online Card / NetBanking</option>
                      <option value="MANUAL">Manual / Waived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Amount Collected (₹)</label>
                    <input
                      type="number"
                      value={formData.amountPaid}
                      onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              to="/super-admin/tenants"
              className="px-6 py-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? (
                <span>Onboarding Client...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Onboard Admin & Issue Software License</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Credentials Share Modal */}
        {createdCreds && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Store Account Created!</span>
                </div>
                <button
                  onClick={() => navigate('/super-admin/tenants')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Business Name:</span>
                  <span className="font-bold text-slate-800 text-sm">{createdCreds.businessName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Client App Login URL:</span>
                  <a
                    href={createdCreds.loginUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-indigo-600 underline font-bold"
                  >
                    {createdCreds.loginUrl}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Login Email:</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {createdCreds.email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Password:</span>
                  <span className="font-mono font-black text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {createdCreds.password}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const text = `🎉 Welcome to Billing POS!\n\nStore: ${createdCreds.businessName}\nOwner: ${createdCreds.ownerName}\n\nLogin URL: ${createdCreds.loginUrl}\nEmail: ${createdCreds.email}\nPassword: ${createdCreds.password}`;
                    navigator.clipboard.writeText(text);
                    toastSuccess('Credentials copied to clipboard!');
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Login Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/super-admin/tenants')}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
                >
                  View Directory
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
