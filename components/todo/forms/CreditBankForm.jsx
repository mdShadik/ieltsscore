'use client';
import { useState } from 'react';

export default function CreditBankForm({ banks, onCreditAdded }) {
  const [bankId, setBankId] = useState(banks[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bankId || !amount || !description) return;

    const selectedBank = banks.find((b) => Number(b.id) === Number(bankId));

    onCreditAdded({
      bankId: Number(bankId),
      bankName: selectedBank?.name || 'Unknown',
      bankType: selectedBank?.type || 'Others',
      type: 'credit',
      amount: parseFloat(amount),
      description,
    });

    setAmount('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#141414] p-4 sm:p-6 rounded-2xl shadow-lg border border-[#222] space-y-4">
      <h3 className="text-lg font-bold text-white">Credit Funds</h3>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Choose Bank *</label>
        <select
          value={bankId || (banks[0]?.id || '')}
          onChange={(e) => setBankId(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#333] bg-[#1a1a1a] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
        >
          {banks.length === 0 && (
            <option value="" className="bg-[#141414] text-gray-500">No banks available</option>
          )}
          {banks.map((b) => (
            <option key={b.id} value={b.id} className="bg-[#141414] text-white">
              {b.name} (Rs. {Number(b.currentBalance).toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Credit Amount (Rs) *</label>
        <input
          type="number"
          step="0.01"
          required
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#333] bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Credited From (Description) *</label>
        <input
          type="text"
          required
          placeholder="e.g. Monthly Salary, Refund, Bonus..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#333] bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
        />
      </div>

      <button
        type="submit"
        disabled={!banks.length}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
      >
        Add Credit
      </button>
    </form>
  );
}