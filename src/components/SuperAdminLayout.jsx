import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Users,
  UserPlus,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

export default function SuperAdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('saas_user') || 'null') || {
    name: 'Super Admin',
    email: 'admin@saasbilling.com',
  };

  const handleLogout = () => {
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
    navigate('/super-admin/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: '/super-admin',
      icon: LayoutDashboard,
      active: location.pathname === '/super-admin',
    },
    {
      label: 'Subscription Plans',
      href: '/super-admin/plans',
      icon: Layers,
      active: location.pathname === '/super-admin/plans',
      badge: 'Dynamic',
    },
    {
      label: 'Admins & Tenants',
      href: '/super-admin/tenants',
      icon: Users,
      active: location.pathname === '/super-admin/tenants',
    },
    {
      label: 'Create New Admin',
      href: '/super-admin/tenants/new',
      icon: UserPlus,
      active: location.pathname === '/super-admin/tenants/new',
      highlight: true,
    },
  ];

  const getPageTitle = () => {
    if (location.pathname === '/super-admin') return 'Overview & Analytics';
    if (location.pathname === '/super-admin/plans') return 'Dynamic Subscription Plans';
    if (location.pathname === '/super-admin/plans/new') return 'Create Subscription Plan';
    if (location.pathname.includes('/plans/') && location.pathname.endsWith('/edit')) return 'Edit Subscription Plan';
    if (location.pathname === '/super-admin/tenants') return 'Admins & Tenants Management';
    if (location.pathname === '/super-admin/tenants/new') return 'Create New Admin';
    if (location.pathname.includes('/tenants/') && location.pathname.endsWith('/edit')) return 'Edit Admin Details';
    if (location.pathname.includes('/tenants/') && location.pathname.endsWith('/extend')) return 'Extend Subscription';
    if (location.pathname.startsWith('/super-admin/tenants/')) return 'Admin Account & Business Details';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight tracking-tight flex items-center gap-1.5">
                BillFlow <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">SaaS</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Super Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Super Admin Controls
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  item.active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : item.highlight
                    ? 'bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {user.name?.charAt(0) || 'S'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Fixed Header */}
      <header className="fixed top-0 right-0 left-0 md:left-72 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-800 hidden sm:inline">Super Admin</span>
            <ChevronRight className="w-4 h-4 text-slate-400 hidden sm:inline" />
            <span className="text-indigo-600 font-semibold">{getPageTitle()}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Server Connected
          </div>

          <Link
            to="/super-admin/tenants/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Admin</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="md:pl-72 pt-16 min-h-screen">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
