'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBanks, addTransaction } from '@/lib/db';
import AddExpenseForm from '@/components/todo/forms/AddExpenseForm';
import { ArrowDownRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ExpensePage() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadBanks = async () => {
      try {
        const b = await getBanks();
        setBanks(b);
      } finally {
        setLoading(false);
      }
    };
    loadBanks();
  }, []);

  const handleExpenseAdded = async (tx) => {
    await addTransaction(tx);
    router.push('/manage');
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
        <span className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          <ArrowDownRight className="w-3.5 h-3.5" /> Log Expense
        </span>
      </div>

      {loading ? (
        <div className="bg-[#141414] border border-[#222] p-6 rounded-2xl text-xs text-gray-500 animate-pulse">
          Loading accounts...
        </div>
      ) : (
        <AddExpenseForm banks={banks} onExpenseAdded={handleExpenseAdded} />
      )}
    </div>
  );
}
