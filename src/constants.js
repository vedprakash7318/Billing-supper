export const DURATION_TYPES = [
  { value: 'DAILY', label: 'Day-wise (Daily)', hint: 'e.g. 1 day, 7 days, 14 days trial' },
  { value: 'WEEKLY', label: 'Week-wise (Weekly)', hint: 'e.g. 1 week, 2 weeks, 4 weeks' },
  { value: 'MONTHLY', label: 'Month-wise (Monthly)', hint: 'e.g. 1 month, 3 months, 6 months' },
  { value: 'YEARLY', label: 'Year-wise (Annual)', hint: 'e.g. 1 year, 2 years, 3 years' },
  { value: 'CUSTOM_DAYS', label: 'Custom Days', hint: 'Specify exact number of days (e.g. 45 days, 90 days)' },
  { value: 'LIFETIME', label: 'Lifetime Access', hint: 'Perpetual license without recurring renewal' },
];

export const PLAN_TYPES = [
  { value: 'PAID', label: 'Paid Plan', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'FREE_TRIAL', label: 'Free Trial', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'FREE', label: '100% Free Forever', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'CUSTOM', label: 'Custom Enterprise', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300' },
];

export const SYSTEM_FEATURES = [
  { id: 'gst_billing', name: 'GST & Tax Invoicing', description: 'Generate GST compliant invoices with CGST/SGST/IGST' },
  { id: 'inventory', name: 'Inventory & Stock Tracking', description: 'Low stock alerts, batch numbers, item expiry' },
  { id: 'barcode', name: 'Barcode Scanner & Printing', description: 'Scan barcodes at point of sale and print labels' },
  { id: 'whatsapp_alerts', name: 'WhatsApp & SMS Invoicing', description: 'Send digital invoice links directly to customers' },
  { id: 'multi_user', name: 'Multi-User & Staff Roles', description: 'Cashier, Manager, Accountant permissions' },
  { id: 'reports_export', name: 'Advanced Reports & Excel Export', description: 'Sales, Profit & Loss, GST filing reports' },
  { id: 'custom_branding', name: 'Custom Branding & Logo', description: 'Add shop logo, signature, and terms to invoices' },
  { id: 'pos_terminal', name: 'Quick POS Cash Counter', description: 'Fast keyboard shortcut billing for retail shops' },
  { id: 'customer_ledger', name: 'Customer Credit & Udhar Ledger', description: 'Track pending payments, send payment reminders' },
  { id: 'multiple_payment_modes', name: 'Multi-Mode Payment Acceptance', description: 'Cash, UPI QR code, Cards, Split payments' },
];

export const TENANT_STATUSES = [
  { value: 'ACTIVE', label: 'Active', badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { value: 'TRIAL', label: 'Free Trial', badgeColor: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'EXPIRED', label: 'Subscription Expired', badgeColor: 'bg-rose-100 text-rose-700 border-rose-300' },
  { value: 'SUSPENDED', label: 'Suspended by Super Admin', badgeColor: 'bg-gray-200 text-gray-700 border-gray-400' },
];

export function formatDurationLabel(durationType, durationValue = 1) {
  const val = Number(durationValue) || 1;
  switch (durationType) {
    case 'DAILY':
      return `${val} ${val === 1 ? 'Day' : 'Days'}`;
    case 'WEEKLY':
      return `${val} ${val === 1 ? 'Week' : 'Weeks'}`;
    case 'MONTHLY':
      return `${val} ${val === 1 ? 'Month' : 'Months'}`;
    case 'YEARLY':
      return `${val} ${val === 1 ? 'Year' : 'Years'}`;
    case 'CUSTOM_DAYS':
      return `${val} Custom Days`;
    case 'LIFETIME':
      return 'Lifetime Access';
    default:
      return `${val} Days`;
  }
}
