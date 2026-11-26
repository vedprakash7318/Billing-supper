import React, { useState, useEffect } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import {
  Sparkles,
  Smartphone,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  Save,
  AlertCircle,
  Tag,
  Zap,
} from 'lucide-react';
import api from '../../services/api';
import { toastSuccess, toastError, confirmDialog } from '../../utils/alerts';

export default function AddOnPacksManagement() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL | SMS | WHATSAPP
  const [showModal, setShowModal] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'SMS',
    credits: 500,
    price: 199,
    description: '',
    isPopular: false,
    isActive: true,
  });

  const fetchPacks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/super-admin/addons');
      if (res.data?.success) {
        setPacks(res.data.data || []);
      }
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to fetch booster packs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  const openCreateModal = () => {
    setEditingPack(null);
    setFormData({
      title: '',
      type: 'SMS',
      credits: 500,
      price: 199,
      description: 'Recharge booster pack for customer bill receipts',
      isPopular: false,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (pack) => {
    setEditingPack(pack);
    setFormData({
      title: pack.title,
      type: pack.type,
      credits: pack.credits,
      price: pack.price,
      description: pack.description || '',
      isPopular: Boolean(pack.isPopular),
      isActive: Boolean(pack.isActive),
    });
    setShowModal(true);
  };

  const handleSavePack = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        type: formData.type,
        credits: Number(formData.credits),
        price: Number(formData.price),
        description: formData.description.trim(),
        isPopular: Boolean(formData.isPopular),
        isActive: Boolean(formData.isActive),
      };

      if (editingPack) {
        await api.put(`/super-admin/addons/${editingPack.id || editingPack._id}`, payload);
        toastSuccess('Booster pack updated successfully');
      } else {
        await api.post('/super-admin/addons', payload);
        toastSuccess('New booster pack created successfully');
      }

      setShowModal(false);
      fetchPacks();
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to save pack');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePack = async (pack) => {
    const confirmed = await confirmDialog({
      title: `Delete Pack "${pack.title}"?`,
      text: 'This pack will no longer be available for stores to recharge.',
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#ef4444',
    });

    if (!confirmed) return;

    try {
      await api.delete(`/super-admin/addons/${pack.id || pack._id}`);
      toastSuccess('Booster pack deleted successfully');
      fetchPacks();
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to delete pack');
    }
  };

  const filteredPacks = packs.filter((p) => {
    if (activeTab === 'ALL') return true;
    return p.type === activeTab;
  });

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-indigo-600" />
              SMS & WhatsApp Booster Packs
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Create recharge packs so merchant store admins can top-up SMS or WhatsApp credits when free quota exhausts.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Booster Pack</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Booster Packs ({packs.length})
          </button>
          <button
            onClick={() => setActiveTab('SMS')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'SMS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>SMS Booster Packs</span>
          </button>
          <button
            onClick={() => setActiveTab('WHATSAPP')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'WHATSAPP' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Packs</span>
          </button>
        </div>

        {/* Packs Grid */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading booster packs...</p>
          </div>
        ) : filteredPacks.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Booster Packs Created</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Create the first SMS or WhatsApp top-up pack for merchant store admins.
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
            >
              Add First Pack
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPacks.map((pack) => (
              <div
                key={pack.id || pack._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {pack.isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-400 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-sm">
                    Most Popular
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-2xl ${
                        pack.type === 'SMS' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {pack.type === 'SMS' ? <Smartphone className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                    </div>
                    <div>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          pack.type === 'SMS' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {pack.type} Booster
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-1">{pack.title}</h3>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-slate-900 font-mono">+{pack.credits}</span>
                      <span className="text-xs font-bold text-slate-500 ml-1">Credits</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-slate-900 font-mono">₹{pack.price}</span>
                      <span className="text-[10px] text-slate-400 block">+ GST / Razorpay</span>
                    </div>
                  </div>

                  {pack.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">{pack.description}</p>
                  )}

                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${pack.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    />
                    <span className="text-xs font-medium text-slate-600">
                      {pack.isActive ? 'Active & Rechargeable' : 'Hidden from Stores'}
                    </span>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => openEditModal(pack)}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeletePack(pack)}
                    className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  {editingPack ? 'Edit Booster Pack' : 'Create New Booster Pack'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePack} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pack Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 SMS Booster Pack / 250 WhatsApp Receipts"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pack Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    >
                      <option value="SMS">SMS Credits</option>
                      <option value="WHATSAPP">WhatsApp Credits</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Credits Count *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 500"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹ INR) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      placeholder="e.g. 199"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full pl-8 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Short benefit or description for stores..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-6 pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="font-semibold text-slate-700">Most Popular Badge</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="font-semibold text-slate-700">Active & Listed</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : editingPack ? 'Update Pack' : 'Create Pack'}</span>
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
