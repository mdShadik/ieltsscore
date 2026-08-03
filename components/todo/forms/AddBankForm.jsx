'use client';
import { useState } from 'react';

const BANK_TYPES = [
  'Travel Expenses',
  'Grocery and other miscellaneous',
  'EMI',
  'Others',
];

export default function AddBankForm({ onBankAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    initialBalance: '',
    minMonthlyBalance: '',
    type: BANK_TYPES[0],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.initialBalance) return;
    
    onBankAdded({
      ...formData,
      initialBalance: parseFloat(formData.initialBalance),
      minMonthlyBalance: parseFloat(formData.minMonthlyBalance || '0'),
    });

    setFormData({ name: '', description: '', initialBalance: '', minMonthlyBalance: '', type: BANK_TYPES[0] });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#141414] p-4 sm:p-6 rounded-2xl shadow-lg border border-[#222] space-y-4">
      <h3 className="text-lg font-bold text-white">Add New Bank</h3>
      
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Bank Name *</label>
        <input
          type="text"
          required
          placeholder="e.g. HDFC Salary Account"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#333] bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Type *</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#333] bg-[#1a1a1a] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
        >
          {BANK_TYPES.map((t) => (
            <option key={t} value={t} className="bg-[#141414] text-white">{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Initial Balance ($) *</label>
        <input
          type="number"
          step="0.01"
          required
          placeholder="0.00"
          value={formData.initialBalance}
          onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#333] bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Minimum Monthly Balance ($)</label>
        <input
          type="number"
          step="0.01"
          placeholder="0.00 (Reserved minimum balance)"
          value={formData.minMonthlyBalance}
          onChange={(e) => setFormData({ ...formData, minMonthlyBalance: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#333] bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
        />
        <p className="text-[11px] text-gray-500 mt-1">This amount will be reserved/hidden unless enabled in Profile settings.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
        <textarea
          rows="2"
          placeholder="Optional notes about this account..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#333] bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-semibold rounded-xl shadow-md transition text-sm"
      >
        Save Bank
      </button>
    </form>
  );
}