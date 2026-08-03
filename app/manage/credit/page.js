'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBanks, addTransaction } from '@/lib/db';
import CreditBankForm from '@/components/todo/forms/CreditBankForm';
import { ArrowUpRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreditPage() {
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

  const handleCreditAdded = async (tx) => {
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
        <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          <ArrowUpRight className="w-3.5 h-3.5" /> Credit Account
        </span>
      </div>

      {loading ? (
        <div className="bg-[#141414] border border-[#222] p-6 rounded-2xl text-xs text-gray-500 animate-pulse">
          Loading accounts...
        </div>
      ) : (
        <CreditBankForm banks={banks} onCreditAdded={handleCreditAdded} />
      )}
    </div>
  );
}
