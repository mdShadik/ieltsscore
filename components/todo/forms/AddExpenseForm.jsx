'use client';
import { useState, useEffect } from 'react';
import { getUseMinBalance } from '@/lib/client/managerSettings';

export default function AddExpenseForm({ banks, onExpenseAdded }) {
  const [bankId, setBankId] = useState(banks[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [useMinBalance, setUseMinBalanceState] = useState(false);

  useEffect(() => {
    setUseMinBalanceState(getUseMinBalance());

    const handleSettingsChange = () => setUseMinBalanceState(getUseMinBalance());
    window.addEventListener('ieltsscore:manager-settings-changed', handleSettingsChange);
    return () => window.removeEventListener('ieltsscore:manager-settings-changed', handleSettingsChange);
  }, []);

  useEffect(() => {
    if (banks.length > 0 && !bankId) {
      setBankId(banks[0].id);
    }
  }, [banks, bankId]);

  const activeBankId = bankId || banks[0]?.id;
  const selectedBank = banks.find((b) => Number(b.id) === Number(activeBankId)) || banks[0];
  const bankType = selectedBank?.type || '';

  const isTravel = bankType === 'Travel Expenses' || bankType.toLowerCase().includes('travel');
  const isGrocery = bankType === 'Grocery and other miscellaneous' || bankType.toLowerCase().includes('groc');
  const isEmi = bankType === 'EMI' || bankType.toLowerCase().includes('emi');

  const amountChips = isTravel
    ? ['80', '100', '125', '150', '175', '200']
    : isGrocery
    ? ['50', '75', '100', '150']
    : isEmi
    ? ['10000']
    : [];

  const descriptionChips = isTravel
    ? [
        'Rapido - tavel to office',
        'Rapido - Travel to home',
        'Rapido - travel to QLA mall',
        'Rapido - travel to zudio',
        'Rapido - Travel to Mall',
      ]
    : isGrocery
    ? [
        'bought vegetable',
        'bought rice',
        'bought water',
        'bought rice and egg',
        'bought egg',
        'bought kurkure',
        'bought kurkure and others',
      ]
    : [];

  const calculateUsable = (b) => {
    const current = Number(b.currentBalance || 0);
    const minReserve = Number(b.minMonthlyBalance || 0);
    return useMinBalance ? current : Math.max(0, current - minReserve);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeBankId || !amount || !description) return;

    onExpenseAdded({
      bankId: Number(activeBankId),
      bankName: selectedBank?.name || 'Unknown',
      bankType: selectedBank?.type || 'Others',
      type: 'debit',
      amount: parseFloat(amount),
      description,
    });

    setAmount('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#141414] p-4 sm:p-6 rounded-2xl shadow-lg border border-[#222] space-y-4">
      <h3 className="text-lg font-bold text-white">Log Expense</h3>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Select Bank *</label>
        <select
          value={activeBankId || ''}
          onChange={(e) => setBankId(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#333] bg-[#1a1a1a] text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition"
        >
          {banks.length === 0 && (
            <option value="" className="bg-[#141414] text-gray-500">No banks available</option>
          )}
          {banks.map((b) => {
            const usable = calculateUsable(b);
            return (
              <option key={b.id} value={b.id} className="bg-[#141414] text-white">
                {b.name} (Rs. {usable.toFixed(2)}) — {b.type}
              </option>
            );
          })}
        </select>
      </div>

      {/* Amount Input & Quick Suggestion Chips */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Amount (Rs.) *</label>
        <input
          type="number"
          step="0.01"
          required
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#333] bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition"
        />

        {amountChips.length > 0 && (
          <div className="space-y-1.5 mt-2">
            <span className="text-[10px] font-semibold text-rose-400/80 uppercase tracking-wider block">
              Quick Amounts
            </span>
            <div className="flex flex-wrap gap-1.5">
              {amountChips.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                    amount === val
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md scale-95'
                      : 'bg-[#1c1c1c] text-gray-300 border-[#333] hover:border-rose-500/50 hover:text-white hover:bg-rose-500/10'
                  }`}
                >
                  Rs. {val}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Description Input & Quick Suggestion Chips */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">For What? (Description) *</label>
        <input
          type="text"
          required
          placeholder="e.g. Flight ticket, Monthly groceries..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#333] bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition"
        />

        {descriptionChips.length > 0 && (
          <div className="space-y-1.5 mt-2">
            <span className="text-[10px] font-semibold text-rose-400/80 uppercase tracking-wider block">
              Quick Descriptions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {descriptionChips.map((desc) => (
                <button
                  key={desc}
                  type="button"
                  onClick={() => setDescription(desc)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                    description === desc
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md scale-95'
                      : 'bg-[#1c1c1c] text-gray-300 border-[#333] hover:border-rose-500/50 hover:text-white hover:bg-rose-500/10'
                  }`}
                >
                  {desc}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!banks.length}
        className="w-full py-3 bg-rose-600 hover:bg-rose-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
      >
        Deduct Expense
      </button>
    </form>
  );
}