'use client';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function TransactionList({ transactions }) {
  if (!transactions.length) {
    return (
      <div className="bg-[#141414] p-8 rounded-2xl border border-[#222] text-center text-gray-500 text-sm shadow-md">
        No transactions found matching your criteria.
      </div>
    );
  }

  return (
    <div className="bg-[#141414] rounded-2xl shadow-lg border border-[#222] divide-y divide-[#222] overflow-hidden">
      {transactions.map((tx) => {
        const isDebit = tx.type === 'debit';
        return (
          <div key={tx.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-[#1c1c1c] transition">
            <div className="flex items-center space-x-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                isDebit 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}>
                {isDebit ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{tx.description}</p>
                <div className="flex items-center space-x-2 mt-0.5 text-xs text-gray-400">
                  <span className="text-gray-300 font-medium">{tx.bankName}</span>
                  <span className="text-gray-600">•</span>
                  <span className="bg-[#222] border border-[#333] px-2 py-0.5 rounded-full text-gray-400 font-medium text-[11px]">{tx.bankType}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className={`text-base font-extrabold ${isDebit ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isDebit ? '-' : '+'}Rs. {Number(tx.amount).toFixed(2)}
              </span>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}