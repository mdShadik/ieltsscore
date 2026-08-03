'use client';

import { useState } from 'react';
import { Calculator, Plus, Trash2, RotateCcw, Wallet, ArrowDownRight } from 'lucide-react';

export default function CalculatorPage() {
  const [totalMoney, setTotalMoney] = useState('');
  const [expenses, setExpenses] = useState([
    { id: 1, label: 'Expense 1', amount: '' },
  ]);

  const handleAddExpense = () => {
    const nextNum = expenses.length + 1;
    setExpenses((prev) => [
      ...prev,
      { id: Date.now(), label: `Expense ${nextNum}`, amount: '' },
    ]);
  };

  const handleRemoveExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const handleExpenseAmountChange = (id, value) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, amount: value } : exp))
    );
  };

  const handleExpenseLabelChange = (id, value) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, label: value } : exp))
    );
  };

  const handleReset = () => {
    setTotalMoney('');
    setExpenses([{ id: Date.now(), label: 'Expense 1', amount: '' }]);
  };

  const parsedTotal = parseFloat(totalMoney) || 0;
  const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  const remaining = parsedTotal - totalExpenses;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" /> Expense Calculator
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Instant real-time scratchpad for calculating remaining budget
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-white bg-[#1a1a1a] hover:bg-[#222] border border-[#333] px-3 py-1.5 rounded-xl transition"
          title="Reset Calculator"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Summary Output Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#141414] border border-[#222] p-3.5 rounded-2xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
            Total Money
          </span>
          <span className="text-base sm:text-lg font-extrabold text-white mt-1 block truncate">
            Rs. {parsedTotal.toLocaleString()}
          </span>
        </div>

        <div className="bg-[#141414] border border-rose-500/20 p-3.5 rounded-2xl">
          <span className="text-[10px] text-rose-400/80 uppercase font-bold tracking-wider block">
            Expenses
          </span>
          <span className="text-base sm:text-lg font-extrabold text-rose-400 mt-1 block truncate">
            Rs. {totalExpenses.toLocaleString()}
          </span>
        </div>

        <div
          className={`bg-[#141414] border p-3.5 rounded-2xl transition ${
            remaining < 0
              ? 'border-rose-500/40 bg-rose-500/5'
              : 'border-emerald-500/30 bg-emerald-500/5'
          }`}
        >
          <span
            className={`text-[10px] uppercase font-bold tracking-wider block ${
              remaining < 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            Remaining
          </span>
          <span
            className={`text-base sm:text-lg font-black mt-1 block truncate ${
              remaining < 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            Rs. {remaining.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Total Money Input Section */}
      <div className="bg-[#141414] border border-indigo-500/30 p-5 rounded-3xl space-y-2 shadow-xl">
        <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-indigo-400" /> Total Money
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
            Rs.
          </span>
          <input
            type="number"
            value={totalMoney}
            onChange={(e) => setTotalMoney(e.target.value)}
            placeholder="0"
            className="w-full bg-[#1c1c1c] border border-[#333] focus:border-indigo-500 rounded-2xl pl-12 pr-4 py-3 text-white text-lg font-extrabold outline-none transition placeholder-gray-600"
          />
        </div>
      </div>

      {/* Dynamic Expenses List Section */}
      <div className="bg-[#141414] border border-[#222] p-5 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#222] pb-3">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <ArrowDownRight className="w-4 h-4 text-rose-400" /> Expenses Breakdown
          </h3>
          <span className="text-[11px] text-gray-500 font-medium">
            {expenses.length} {expenses.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="space-y-3">
          {expenses.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-2 bg-[#1a1a1a] border border-[#262626] focus-within:border-indigo-500/40 p-2.5 rounded-2xl transition"
            >
              <input
                type="text"
                value={item.label}
                onChange={(e) => handleExpenseLabelChange(item.id, e.target.value)}
                placeholder={`Expense ${index + 1}`}
                className="w-1/2 bg-transparent text-sm font-medium text-gray-200 focus:text-white outline-none px-2 placeholder-gray-600"
              />

              <div className="relative w-1/2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">
                  Rs.
                </span>
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => handleExpenseAmountChange(item.id, e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#121212] border border-[#333] focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-sm font-extrabold text-white outline-none text-right transition placeholder-gray-600"
                />
              </div>

              {expenses.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveExpense(item.id)}
                  className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition shrink-0"
                  title="Remove field"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddExpense}
          className="w-full py-3 border border-dashed border-indigo-500/40 hover:border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>
    </div>
  );
}
