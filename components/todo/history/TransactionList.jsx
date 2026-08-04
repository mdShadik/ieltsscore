'use client';

import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Trash2, X, AlertTriangle } from 'lucide-react';
import { deleteTransactionOnly, deleteTransactionAndRestore } from '@/lib/db';
import { getFirstWord } from '@/lib/utils';

// ── Confirmation Modal ───────────────────────────────────────────────────────
function DeleteModal({ transaction, onConfirm, onCancel, loading }) {
  const [mode, setMode] = useState('history_only');

  if (!transaction) return null;

  const isDebit = transaction.type === 'debit';
  const restoreLabel = isDebit
    ? `Restore Rs. ${Number(transaction.amount).toFixed(2)} back to "${transaction.bankName}"`
    : `Deduct Rs. ${Number(transaction.amount).toFixed(2)} from "${transaction.bankName}"`;

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#161616] border border-[#2a2a2a] rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#222]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Delete Transaction</p>
              <p className="text-[11px] text-gray-400 truncate max-w-[180px]">{transaction.description}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-7 h-7 rounded-lg bg-[#222] hover:bg-[#2e2e2e] flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transaction Summary */}
        <div className="mx-5 mt-4 flex items-center gap-3 bg-[#1c1c1c] border border-[#282828] rounded-2xl p-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
            isDebit
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            {isDebit ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{transaction.description}</p>
            <p className="text-[11px] text-gray-400">{transaction.bankName} · {transaction.bankType}</p>
          </div>
          <span className={`text-sm font-extrabold shrink-0 ${isDebit ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isDebit ? '-' : '+'}Rs. {Number(transaction.amount).toFixed(2)}
          </span>
        </div>

        {/* Radio Options */}
        <div className="px-5 pt-4 pb-2 space-y-2.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Choose what to do</p>

          {/* Option 1 — History only */}
          <label
            htmlFor="mode_history"
            className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
              mode === 'history_only'
                ? 'border-indigo-500/50 bg-indigo-500/10'
                : 'border-[#2a2a2a] bg-[#1c1c1c] hover:border-[#3a3a3a]'
            }`}
          >
            <input
              id="mode_history"
              type="radio"
              name="deleteMode"
              value="history_only"
              checked={mode === 'history_only'}
              onChange={() => setMode('history_only')}
              className="mt-0.5 accent-indigo-500 shrink-0"
            />
            <div>
              <p className="text-xs font-bold text-white">Delete history only</p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Removes this entry from the statement. The bank balance stays unchanged.
              </p>
            </div>
          </label>

          {/* Option 2 — Restore amount */}
          <label
            htmlFor="mode_restore"
            className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
              mode === 'restore'
                ? 'border-amber-500/50 bg-amber-500/10'
                : 'border-[#2a2a2a] bg-[#1c1c1c] hover:border-[#3a3a3a]'
            }`}
          >
            <input
              id="mode_restore"
              type="radio"
              name="deleteMode"
              value="restore"
              checked={mode === 'restore'}
              onChange={() => setMode('restore')}
              className="mt-0.5 accent-amber-400 shrink-0"
            />
            <div>
              <p className="text-xs font-bold text-white">Delete &amp; restore amount</p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                {restoreLabel}
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] text-xs font-semibold text-gray-300 hover:bg-[#252525] transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(mode)}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'restore'
                ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30'
                : 'bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30'
            }`}
          >
            {loading ? 'Deleting…' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main TransactionList ─────────────────────────────────────────────────────
export default function TransactionList({ transactions, onDeleted }) {
  const [target, setTarget] = useState(null);   // transaction pending deletion
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (mode) => {
    if (!target) return;
    setLoading(true);
    try {
      if (mode === 'restore') {
        await deleteTransactionAndRestore(target.id);
      } else {
        await deleteTransactionOnly(target.id);
      }
      setTarget(null);
      onDeleted?.();   // notify parent to re-fetch
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!transactions.length) {
    return (
      <div className="bg-[#141414] p-8 rounded-2xl border border-[#222] text-center text-gray-500 text-sm shadow-md">
        No transactions found matching your criteria.
      </div>
    );
  }

  return (
    <>
      <DeleteModal
        transaction={target}
        onConfirm={handleConfirm}
        onCancel={() => setTarget(null)}
        loading={loading}
      />

      <div className="bg-[#141414] rounded-2xl shadow-lg border border-[#222] divide-y divide-[#222] overflow-hidden">
        {transactions.map((tx) => {
          const isDebit = tx.type === 'debit';
          return (
            <div
              key={tx.id}
              className="p-4 sm:px-6 flex items-center justify-between hover:bg-[#1c1c1c] transition group"
            >
              {/* Left: icon + description */}
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isDebit
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  {isDebit ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{tx.description}</p>
                  <div className="flex gap-1 sm:gap-0 flex-col sm:flex-row sm:items-center space-x-2 mt-0.5 text-xs text-gray-400">
                    <span className="text-gray-300 font-medium pl-3 sm:pl-0">{getFirstWord(tx.bankName)}</span>
                    <span className="text-gray-600 hidden sm:flex">•</span>
                    <span className="bg-[#222] border border-[#333] px-2 py-0.5 rounded-full text-gray-400 font-medium text-[11px]">
                      {tx.bankType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: amount + date + delete */}
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <div className="text-right">
                  <span className={`text-base font-extrabold ${isDebit ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isDebit ? '-' : '+'}Rs. {Number(tx.amount).toFixed(2)}
                  </span>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                    {new Date(tx.date).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Delete button — subtle until hover */}
                <button
                  onClick={() => setTarget(tx)}
                  title="Delete transaction"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}