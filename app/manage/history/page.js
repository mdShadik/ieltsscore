'use client';

import { useState, useEffect } from 'react';
import { getBanks, getTransactions, resetBankBalances } from '@/lib/db';
import TransactionFilter from '@/components/todo/history/TransactionFilter';
import TransactionList from '@/components/todo/history/TransactionList';
import { History, ChevronLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const [banks, setBanks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    bankId: 'ALL',
    category: 'ALL',
    month: 'ALL',
    date: '',
  });

  const loadData = async () => {
    try {
      const b = await getBanks();
      const t = await getTransactions();
      setBanks(b);
      setTransactions(t);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Derive unique months from transactions
  const availableMonths = (() => {
    const monthSet = new Set();
    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthSet.add(key);
    });
    return Array.from(monthSet)
      .sort((a, b) => b.localeCompare(a))
      .map((key) => {
        const [year, month] = key.split('-');
        const label = new Date(Number(year), Number(month) - 1, 1).toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        });
        return { value: key, label };
      });
  })();

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes((filters.search || '').toLowerCase());
    const matchesBank = (filters.bankId || 'ALL') === 'ALL' || Number(tx.bankId) === Number(filters.bankId);
    const matchesCategory = (filters.category || 'ALL') === 'ALL' || tx.bankType === filters.category;

    const txDate = new Date(tx.date);
    const txMonthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
    const matchesMonth = (filters.month || 'ALL') === 'ALL' || txMonthKey === filters.month;

    const matchesDate = !filters.date || (() => {
      const filterDay = new Date(filters.date);
      return (
        txDate.getFullYear() === filterDay.getFullYear() &&
        txDate.getMonth() === filterDay.getMonth() &&
        txDate.getDate() === filterDay.getDate()
      );
    })();

    return matchesSearch && matchesBank && matchesCategory && matchesMonth && matchesDate;
  });

  const handleReset = async () => {
    if (!confirm(
      'Reset Monthly Tracker?\n\n' +
      'This will restore ALL bank balances back to their original Initial Balance. ' +
      'Your full transaction history will be preserved for review.\n\n' +
      'Are you sure you want to start tracking fresh?'
    )) return;

    setResetting(true);
    try {
      await resetBankBalances();
      await loadData();
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/manage"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <span className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          <History className="w-3.5 h-3.5" /> Statement History
        </span>
      </div>

      {/* Reset Monthly Tracker Banner */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-amber-300">Reset Monthly Tracker</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Restores all bank balances to their initial amounts. Transaction history is kept for your records.
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          {resetting ? 'Resetting…' : 'Reset Now'}
        </button>
      </div>

      <TransactionFilter
        banks={banks}
        filters={filters}
        setFilters={setFilters}
        availableMonths={availableMonths}
      />

      {loading ? (
        <div className="bg-[#141414] border border-[#222] p-6 rounded-2xl text-xs text-gray-500 animate-pulse">
          Loading history...
        </div>
      ) : (
        <>
          {!loading && transactions.length > 0 && (
            <p className="text-xs text-gray-500 text-right font-medium">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
          )}
          <TransactionList transactions={filteredTransactions} onDeleted={loadData} />
        </>
      )}
    </div>
  );
}
