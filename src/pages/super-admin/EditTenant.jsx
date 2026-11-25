import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import {
  Store,
  KeyRound,
  ChevronLeft,
  Save,
  AlertCircle,
} from 'lucide-react';
import { TENANT_STATUSES } from '../../constants';
import api from '../../services/api';
import { toastSuccess } from '../../utils/alerts';

export default function EditTenant() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

  const [editForm, setEditForm] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    city: '',
    state: '',
    gstin: '',
    status: 'ACTIVE',
    newPassword: '',
  });

  useEffect(() => {
    setLoading(true);
    api
      .get(`/super-admin/tenants/${id}`)
      .then((res) => {
        const tenant = res.data?.data;
        if (tenant) {
          setOwnerEmail(tenant.owner?.email || '');
          setEditForm({
            businessName: tenant.businessName || '',
            ownerName: tenant.owner?.name || '',
            phone: tenant.phone || '',
            city: tenant.city || '',
            state: tenant.state || '',
            gstin: tenant.gstin || '',
            status: tenant.status || 'ACTIVE',
            newPassword: '',
          });
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load admin details');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await api.put(`/super-admin/tenants/${id}`, editForm);
      if (res.data?.success) {
        toastSuccess('Client admin details updated successfully!');
        navigate('/super-admin/tenants');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update admin');
    } finally {
      setSaving(false);
    }
  };

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

        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-7 h-7 text-indigo-600" />
            Edit Admin & Business Details
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update business profile, account status, or reset login password for <strong>{ownerEmail || 'this admin'}</strong>.
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading admin details from server...</p>
          </div>
        ) : (
          <form onSubmit={handleSaveEdit} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-5">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Business / Store Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.businessName}
                  onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Owner / Admin Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.ownerName}
                  onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={editForm.state}
                  onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN</label>
                <input
                  type="text"
                  value={editForm.gstin}
                  onChange={(e) => setEditForm({ ...editForm, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium bg-white"
                >
                  {TENANT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <KeyRound className="w-4 h-4 text-amber-700" />
                <span>Reset Admin Password (Optional)</span>
              </div>
              <input
                type="password"
                placeholder="Enter new password (min 6 chars) or leave blank to keep unchanged"
                value={editForm.newPassword}
                onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs"
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
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Updating...' : 'Update Details'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </SuperAdminLayout>
  );
}
