'use client';

import { useRouter } from 'next/navigation';
import { addBank } from '@/lib/db';
import AddBankForm from '@/components/todo/forms/AddBankForm';
import { Building2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddBankPage() {
  const router = useRouter();

  const handleBankAdded = async (newBank) => {
    await addBank(newBank);
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
        <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5" /> Add Bank
        </span>
      </div>

      <AddBankForm onBankAdded={handleBankAdded} />
    </div>
  );
}
