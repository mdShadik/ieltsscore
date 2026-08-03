'use client';

import { useState, useEffect } from 'react';
import { getBanks, getTransactions } from '@/lib/db';
import TransactionFilter from '@/components/todo/history/TransactionFilter';
import TransactionList from '@/components/todo/history/TransactionList';
import { History, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const [banks, setBanks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    bankId: 'ALL',
    category: 'ALL',
  });

  useEffect(() => {
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
    loadData();
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesBank = filters.bankId === 'ALL' || Number(tx.bankId) === Number(filters.bankId);
    const matchesCategory = filters.category === 'ALL' || tx.bankType === filters.category;
    return matchesSearch && matchesBank && matchesCategory;
  });

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

      <TransactionFilter banks={banks} filters={filters} setFilters={setFilters} />

      {loading ? (
        <div className="bg-[#141414] border border-[#222] p-6 rounded-2xl text-xs text-gray-500 animate-pulse">
          Loading history...
        </div>
      ) : (
        <TransactionList transactions={filteredTransactions} />
      )}
    </div>
  );
}
