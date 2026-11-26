import React, { useState, useEffect } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import {
  Sliders,
  MessageSquare,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  Save,
  RefreshCw,
  Power,
  ShieldAlert,
} from 'lucide-react';
import api from '../../services/api';
import { toastSuccess, toastError } from '../../utils/alerts';

export default function GlobalSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    isSmsGloballyEnabled: true,
    isWhatsAppGloballyEnabled: true,
    smsDisabledNotice: 'SMS service is temporarily paused by Super Admin for maintenance.',
    whatsAppDisabledNotice: 'WhatsApp messaging is temporarily paused by Super Admin for maintenance.',
    maintenanceMode: false,
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/super-admin/settings');
      if (res.data?.success && res.data?.data) {
        setSettings(res.data.data);
      }
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to load global settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/super-admin/settings', settings);
      if (res.data?.success) {
        toastSuccess('Global platform settings updated successfully!');
        setSettings(res.data.data);
      }
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sliders className="w-7 h-7 text-indigo-600" />
              Global Platform Control
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Temporarily enable or disable SMS and WhatsApp services across all tenant stores in real-time.
            </p>
          </div>
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="self-start sm:self-auto px-3.5 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading platform settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* SMS Service Global Switch */}
            <div className={`bg-white rounded-3xl p-6 md:p-8 border transition-all shadow-sm ${settings.isSmsGloballyEnabled ? 'border-indigo-100' : 'border-amber-200 bg-amber-50/20'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-2xl ${settings.isSmsGloballyEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-100 text-amber-700'}`}>
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-slate-900">SMS Gateway Global Service</h2>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${settings.isSmsGloballyEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {settings.isSmsGloballyEnabled ? 'Active / Online' : 'Temporarily Paused'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Controls whether any tenant store can send bill receipts or OTPs via SMS gateway.
                    </p>
                  </div>
                </div>

                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, isSmsGloballyEnabled: !settings.isSmsGloballyEnabled })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    settings.isSmsGloballyEnabled
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{settings.isSmsGloballyEnabled ? 'Temporarily Pause SMS' : 'Enable SMS Gateway'}</span>
                </button>
              </div>

              {/* Notice field if paused */}
              <div className="mt-5 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  SMS Temporary Maintenance Notice (Shown to Merchant Stores)
                </label>
                <textarea
                  rows={2}
                  value={settings.smsDisabledNotice}
                  onChange={(e) => setSettings({ ...settings, smsDisabledNotice: e.target.value })}
                  placeholder="e.g. SMS service is temporarily paused by Super Admin for maintenance."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 bg-slate-50"
                />
                {!settings.isSmsGloballyEnabled && (
                  <p className="text-[11px] text-amber-700 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    SMS sending will be blocked and this notice will appear inside billing without deducting credits.
                  </p>
                )}
              </div>
            </div>

            {/* WhatsApp Global Switch */}
            <div className={`bg-white rounded-3xl p-6 md:p-8 border transition-all shadow-sm ${settings.isWhatsAppGloballyEnabled ? 'border-emerald-100' : 'border-amber-200 bg-amber-50/20'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-2xl ${settings.isWhatsAppGloballyEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-100 text-amber-700'}`}>
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-slate-900">WhatsApp Messaging Global Service</h2>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${settings.isWhatsAppGloballyEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {settings.isWhatsAppGloballyEnabled ? 'Active / Online' : 'Temporarily Paused'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Controls whether any tenant store can send instant digital receipts via WhatsApp.
                    </p>
                  </div>
                </div>

                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, isWhatsAppGloballyEnabled: !settings.isWhatsAppGloballyEnabled })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    settings.isWhatsAppGloballyEnabled
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{settings.isWhatsAppGloballyEnabled ? 'Temporarily Pause WhatsApp' : 'Enable WhatsApp Messaging'}</span>
                </button>
              </div>

              {/* Notice field if paused */}
              <div className="mt-5 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  WhatsApp Temporary Maintenance Notice (Shown to Merchant Stores)
                </label>
                <textarea
                  rows={2}
                  value={settings.whatsAppDisabledNotice}
                  onChange={(e) => setSettings({ ...settings, whatsAppDisabledNotice: e.target.value })}
                  placeholder="e.g. WhatsApp messaging is temporarily paused by Super Admin for maintenance."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 bg-slate-50"
                />
                {!settings.isWhatsAppGloballyEnabled && (
                  <p className="text-[11px] text-amber-700 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    WhatsApp sending will be paused across the app without deducting credits from merchant quota.
                  </p>
                )}
              </div>
            </div>

            {/* Platform Emergency Maintenance Switch */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Platform Emergency Maintenance Mode</h3>
                  <p className="text-[11px] text-slate-500">Put SaaS APIs in read-only maintenance mode.</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span className="text-xs font-bold text-slate-700">Maintenance Active</span>
              </label>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Global Settings'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </SuperAdminLayout>
  );
}
