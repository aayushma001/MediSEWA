import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Receipt, Download, Trash2, Eye, EyeOff, Calendar,
  DollarSign, CreditCard, Building2, Check, X, Plus,
  FileText, Filter, RefreshCw, Clock
} from 'lucide-react';

// Types
interface ReceiptItem {
  id: number;
  receiptNumber: string;
  date: string;
  hospital: string;
  doctor: string;
  department: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'insurance' | 'online';
  status: 'paid' | 'pending' | 'insurance';
  notes: string;
  isPrivate: boolean;
  appointmentId?: number;
}

const MOCK_RECEIPTS: ReceiptItem[] = [
  {
    id: 1,
    receiptNumber: 'RCP-2024-001',
    date: '2024-01-15',
    hospital: 'Patan Hospital',
    doctor: 'Dr. Rajesh Kumar',
    department: 'Cardiology',
    items: [
      { name: 'Consultation Fee', quantity: 1, price: 500 },
      { name: 'ECG Test', quantity: 1, price: 300 },
      { name: 'Blood Test', quantity: 1, price: 250 },
    ],
    subtotal: 1050,
    tax: 52.5,
    discount: 0,
    total: 1102.5,
    paymentMethod: 'card',
    status: 'paid',
    notes: 'Regular cardiac checkup',
    isPrivate: false,
  },
  {
    id: 2,
    receiptNumber: 'RCP-2024-002',
    date: '2024-01-10',
    hospital: 'Grande International',
    doctor: 'Dr. Priya Sharma',
    department: 'Neurology',
    items: [
      { name: 'Consultation Fee', quantity: 1, price: 600 },
      { name: 'MRI Scan', quantity: 1, price: 2500 },
      { name: 'Prescription', quantity: 2, price: 150 },
    ],
    subtotal: 3250,
    tax: 162.5,
    discount: 200,
    total: 3212.5,
    paymentMethod: 'insurance',
    status: 'insurance',
    notes: 'MRI for headache evaluation - Insurance claim filed',
    isPrivate: true,
  },
  {
    id: 3,
    receiptNumber: 'RCP-2024-003',
    date: '2024-01-08',
    hospital: 'Kathmandu Medical College',
    doctor: 'Dr. Amit Patel',
    department: 'Orthopedics',
    items: [
      { name: 'Consultation Fee', quantity: 1, price: 550 },
      { name: 'X-Ray', quantity: 1, price: 400 },
    ],
    subtotal: 950,
    tax: 47.5,
    discount: 50,
    total: 947.5,
    paymentMethod: 'online',
    status: 'paid',
    notes: 'Follow-up for knee pain',
    isPrivate: false,
  },
];

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const ReceiptsPage: React.FC = () => {
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItem | null>(null);
  const [showPrivate, setShowPrivate] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const savedReceipts = localStorage.getItem('receipts');
    if (savedReceipts) {
      setReceipts(JSON.parse(savedReceipts));
    } else {
      setReceipts(MOCK_RECEIPTS);
      localStorage.setItem('receipts', JSON.stringify(MOCK_RECEIPTS));
    }
  }, []);

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = 
      receipt.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || receipt.status === filterStatus;
    const matchesPrivate = !showPrivate ? !receipt.isPrivate : true;
    return matchesSearch && matchesStatus && matchesPrivate;
  });

  const handleDeleteReceipt = (id: number) => {
    const updatedReceipts = receipts.filter(r => r.id !== id);
    setReceipts(updatedReceipts);
    localStorage.setItem('receipts', JSON.stringify(updatedReceipts));
  };

  const togglePrivate = (id: number) => {
    const updatedReceipts = receipts.map(r => 
      r.id === id ? { ...r, isPrivate: !r.isPrivate } : r
    );
    setReceipts(updatedReceipts);
    localStorage.setItem('receipts', JSON.stringify(updatedReceipts));
  };

  const downloadReceipt = (receipt: ReceiptItem) => {
    // Create receipt content
    const content = `
=======================================
           PAYMENT RECEIPT
=======================================
Receipt #: ${receipt.receiptNumber}
Date: ${receipt.date}
=======================================

Hospital: ${receipt.hospital}
Department: ${receipt.department}
Doctor: ${receipt.doctor}

---------------------------------------
ITEMS
---------------------------------------
${receipt.items.map(item => `${item.name} x${item.quantity}.....$${item.price}`).join('\n')}
---------------------------------------
Subtotal: $${receipt.subtotal.toFixed(2)}
Tax: $${receipt.tax.toFixed(2)}
Discount: -$${receipt.discount.toFixed(2)}
=======================================
TOTAL: $${receipt.total.toFixed(2)}
=======================================

Payment Method: ${receipt.paymentMethod.toUpperCase()}
Status: ${receipt.status.toUpperCase()}

${receipt.notes ? `Notes: ${receipt.notes}` : ''}

Thank you for choosing MediSewa!
=======================================
    `;

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${receipt.receiptNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'insurance': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return '💵';
      case 'card': return '💳';
      case 'insurance': return '🏥';
      case 'online': return '🌐';
      default: return '💰';
    }
  };

  const totalPaid = receipts.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.total, 0);
  const totalPending = receipts.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.total, 0);
  const totalInsurance = receipts.filter(r => r.status === 'insurance').reduce((sum, r) => sum + r.total, 0);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-between items-center"
            >
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Payment Receipts
                </h1>
                <p className="text-emerald-100">
                  View and manage your payment history
                </p>
              </div>
              <button className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-bold shadow-lg hover:bg-emerald-50 transition-all flex items-center gap-2">
                <Download size={20} />
                Export All
              </button>
            </motion.div>
          </div>

          {/* Stats Cards */}
          <div className="px-8 py-6 -mt-8">
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-slate-100 group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-5 flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Check size={26} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <motion.p 
                      className="text-3xl font-black text-slate-800"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    >
                      NPR {totalPaid.toFixed(0)}
                    </motion.p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Paid</p>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-tr from-green-100 to-emerald-100 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-slate-100 group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-5 flex items-center gap-4">
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Clock size={26} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <motion.p 
                      className="text-3xl font-black text-slate-800"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                    >
                      NPR {totalPending.toFixed(0)}
                    </motion.p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pending</p>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-tr from-amber-100 to-orange-100 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-slate-100 group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-5 flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Building2 size={26} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <motion.p 
                      className="text-3xl font-black text-slate-800"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                      NPR {totalInsurance.toFixed(0)}
                    </motion.p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Insurance</p>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-slate-100 group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-5 flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Receipt size={26} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <motion.p 
                      className="text-3xl font-black text-slate-800"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.25, type: "spring", stiffness: 200 }}
                    >
                      {receipts.length}
                    </motion.p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Receipts</p>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-tr from-emerald-100 to-teal-100 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-20">
            <div className="flex gap-4 flex-wrap items-center">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search receipts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 border-2 border-transparent rounded-xl focus:border-emerald-500 focus:outline-none font-semibold text-slate-800 transition-all"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 rounded-xl border-2 border-slate-200 font-semibold text-sm focus:border-emerald-500 outline-none bg-white cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="insurance">Insurance</option>
              </select>

              <button
                onClick={() => setShowPrivate(!showPrivate)}
                className={`px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all flex items-center gap-2 ${
                  showPrivate 
                    ? 'bg-slate-800 text-white border-slate-800' 
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {showPrivate ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPrivate ? 'Show Private' : 'Hide Private'}
              </button>

              <div className="flex border-2 border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}
                >
                  <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                    <div className="bg-current rounded-sm" />
                    <div className="bg-current rounded-sm" />
                    <div className="bg-current rounded-sm" />
                    <div className="bg-current rounded-sm" />
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}
                >
                  <div className="flex flex-col gap-0.5 w-5 h-5">
                    <div className="bg-current h-1 rounded-sm" />
                    <div className="bg-current h-1 rounded-sm" />
                    <div className="bg-current h-1 rounded-sm" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Receipts Grid/List */}
          <div className="p-8">
            {filteredReceipts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt size={40} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No receipts found</h3>
                <p className="text-slate-500">Your payment receipts will appear here</p>
              </div>
            ) : viewMode === 'grid' ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence mode="popLayout">
                  {filteredReceipts.map((receipt) => (
                    <motion.div
                      key={receipt.id}
                      layout
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-bold text-slate-800">{receipt.receiptNumber}</p>
                            <p className="text-xs text-slate-500">{receipt.date}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(receipt.status)}`}>
                            {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Building2 size={14} className="text-emerald-500" />
                          <span className="text-sm font-medium text-slate-700 truncate">{receipt.hospital}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-lg">{getPaymentIcon(receipt.paymentMethod)}</span>
                          <span className="text-sm text-slate-600 capitalize">{receipt.paymentMethod}</span>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3 mb-4">
                          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Items ({receipt.items.length})</p>
                          <p className="text-sm text-slate-700 truncate">
                            {receipt.items.map(i => i.name).join(', ')}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div>
                            <p className="text-xs text-slate-500">Total Amount</p>
                            <p className="text-xl font-bold text-emerald-600">NPR {receipt.total.toFixed(0)}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => togglePrivate(receipt.id)}
                              className={`p-2 rounded-lg transition-all ${
                                receipt.isPrivate 
                                  ? 'bg-red-100 text-red-600' 
                                  : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              {receipt.isPrivate ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button
                              onClick={() => downloadReceipt(receipt)}
                              className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-all"
                            >
                              <Download size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteReceipt(receipt.id)}
                              className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-100 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div 
                className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Receipt #</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Hospital</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence>
                      {filteredReceipts.map((receipt) => (
                        <motion.tr
                          key={receipt.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800">{receipt.receiptNumber}</p>
                            <p className="text-xs text-slate-500">{receipt.doctor}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{receipt.date}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{receipt.hospital}</td>
                          <td className="px-6 py-4 font-bold text-emerald-600">NPR {receipt.total.toFixed(0)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(receipt.status)}`}>
                              {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1">
                              <button
                                onClick={() => downloadReceipt(receipt)}
                                className="p-2 rounded-lg hover:bg-emerald-100 transition-all"
                              >
                                <Download size={16} className="text-emerald-600" />
                              </button>
                              <button
                                onClick={() => togglePrivate(receipt.id)}
                                className={`p-2 rounded-lg transition-all ${
                                  receipt.isPrivate 
                                    ? 'bg-red-100 text-red-600' 
                                    : 'hover:bg-slate-100'
                                }`}
                              >
                                {receipt.isPrivate ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                              <button
                                onClick={() => handleDeleteReceipt(receipt.id)}
                                className="p-2 rounded-lg hover:bg-red-100 transition-all"
                              >
                                <Trash2 size={16} className="text-red-600" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* View Receipt Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedReceipt(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Payment Receipt</h2>
                    <p className="text-slate-500">{selectedReceipt.receiptNumber}</p>
                  </div>
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-all"
                  >
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Date</p>
                      <p className="font-semibold text-slate-800">{selectedReceipt.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Hospital</p>
                      <p className="font-semibold text-slate-800">{selectedReceipt.hospital}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Doctor</p>
                      <p className="font-semibold text-slate-800">{selectedReceipt.doctor}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Department</p>
                      <p className="font-semibold text-slate-800">{selectedReceipt.department}</p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-slate-200 pb-4 mb-4">
                  <h3 className="font-bold text-slate-800 mb-3">Items</h3>
                  {selectedReceipt.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-2">
                      <span className="text-slate-600">{item.name} x{item.quantity}</span>
                      <span className="font-semibold text-slate-800">NPR {item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-semibold">NPR {selectedReceipt.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tax</span>
                    <span className="font-semibold">NPR {selectedReceipt.tax}</span>
                  </div>
                  {selectedReceipt.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-NPR {selectedReceipt.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="font-bold text-slate-800">Total</span>
                    <span className="font-bold text-emerald-600">NPR {selectedReceipt.total}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(selectedReceipt.status)}`}>
                    {selectedReceipt.status.charAt(0).toUpperCase() + selectedReceipt.status.slice(1)}
                  </span>
                  <span className="text-sm text-slate-500">
                    {getPaymentIcon(selectedReceipt.paymentMethod)} {selectedReceipt.paymentMethod.toUpperCase()}
                  </span>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => downloadReceipt(selectedReceipt)}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download
                  </button>
                  <button
                    onClick={() => handleDeleteReceipt(selectedReceipt.id)}
                    className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReceiptsPage;
