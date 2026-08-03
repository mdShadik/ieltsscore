'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBanks, getTransactions } from '@/lib/db';
import { getUseMinBalance } from '@/lib/client/managerSettings';
import TransactionList from '@/components/todo/history/TransactionList';
import { 
  Wallet, ArrowDownRight, ArrowUpRight, PlusCircle, 
  History, CheckSquare, ChevronRight, Building2, ArrowRight, ShieldAlert
} from 'lucide-react';

export default function ManageDashboard() {
  const [banks, setBanks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [useMinBalance, setUseMinBalanceState] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const b = await getBanks();
      const t = await getTransactions();
      setBanks(b);
      setTransactions(t);
      setUseMinBalanceState(getUseMinBalance());
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleSettingsChange = () => setUseMinBalanceState(getUseMinBalance());
    window.addEventListener('ieltsscore:manager-settings-changed', handleSettingsChange);
    return () => window.removeEventListener('ieltsscore:manager-settings-changed', handleSettingsChange);
  }, []);

  const calculateUsableBalance = (b) => {
    const current = Number(b.currentBalance || 0);
    const minReserve = Number(b.minMonthlyBalance || 0);
    return useMinBalance ? current : Math.max(0, current - minReserve);
  };

  const totalUsableBalance = banks.reduce((acc, b) => acc + calculateUsableBalance(b), 0);
  const recentTransactions = transactions.slice(0, 5);

  const quickActions = [
    {
      title: 'Log Expense',
      description: 'Record a new payout',
      href: '/manage/expense',
      icon: ArrowDownRight,
      color: 'from-rose-500/20 to-rose-600/10 text-rose-400 border-rose-500/30',
      iconBg: 'bg-rose-500/20 text-rose-400',
    },
    {
      title: 'Add Credit',
      description: 'Deposit funds to bank',
      href: '/manage/credit',
      icon: ArrowUpRight,
      color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      title: 'Add Bank',
      description: 'Create new account',
      href: '/manage/add-bank',
      icon: Building2,
      color: 'from-indigo-500/20 to-indigo-600/10 text-indigo-400 border-indigo-500/30',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
    },
    {
      title: 'History',
      description: 'All past statements',
      href: '/manage/history',
      icon: History,
      color: 'from-purple-500/20 to-purple-600/10 text-purple-400 border-purple-500/30',
      iconBg: 'bg-purple-500/20 text-purple-400',
    },
    {
      title: 'Tasks',
      description: 'Manage to-do items',
      href: '/manage/todos',
      icon: CheckSquare,
      color: 'from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/30',
      iconBg: 'bg-blue-500/20 text-blue-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Total Balance Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900/40 via-[#141414] to-indigo-950/60 border border-indigo-500/30 p-5 sm:p-6 rounded-3xl shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300/80 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-indigo-400" /> Usable Net Balance
          </span>
          <span className="text-[11px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-medium">
            {banks.length} {banks.length === 1 ? 'Account' : 'Accounts'}
          </span>
        </div>

        <div className="mt-3">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Rs. {totalUsableBalance.toFixed(2)}
          </h2>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            {useMinBalance ? (
              <span className="text-amber-400 font-medium">Includes minimum balance reserves</span>
            ) : (
              <span>Excludes reserved minimum monthly balances</span>
            )}
          </p>
        </div>
      </div>

      {/* Accounts Horizontal Scroll */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-400" /> Accounts & Cards
          </h3>
          <Link href="/manage/add-bank" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            + Add Bank
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {loading ? (
            <div className="w-full bg-[#141414] border border-[#222] p-4 rounded-2xl text-xs text-gray-500 animate-pulse">
              Loading accounts...
            </div>
          ) : banks.length === 0 ? (
            <div className="w-full bg-[#141414] border border-[#222] p-5 rounded-2xl text-center space-y-2">
              <p className="text-xs text-gray-400">No bank accounts added yet.</p>
              <Link
                href="/manage/add-bank"
                className="inline-flex items-center gap-1 text-xs text-indigo-400 font-semibold hover:underline"
              >
                Create your first account <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            banks.map((b) => {
              const usable = calculateUsableBalance(b);
              const hasMinReserve = Number(b.minMonthlyBalance || 0) > 0;

              return (
                <div
                  key={b.id}
                  className="min-w-[200px] sm:min-w-[220px] bg-[#141414] border border-indigo-500/20 hover:border-indigo-500/40 p-4 rounded-2xl shadow-md shrink-0 flex flex-col justify-between space-y-4 transition group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-semibold">
                        {b.type}
                      </span>
                      <h4 className="font-bold text-white text-sm mt-2 group-hover:text-indigo-300 transition truncate max-w-[140px]">
                        {b.name}
                      </h4>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                      {useMinBalance ? 'Total Balance' : 'Usable Balance'}
                    </span>
                    <span className="text-lg font-extrabold text-white">Rs. {usable.toFixed(2)}</span>
                    
                    {hasMinReserve && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {useMinBalance 
                          ? `(Min reserve: Rs. ${Number(b.minMonthlyBalance).toFixed(2)})`
                          : `(Reserves Rs. ${Number(b.minMonthlyBalance).toFixed(2)} hidden)`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PhonePe-Style Quick Action Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Quick Services
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="bg-[#141414] border border-[#222] hover:border-indigo-500/40 p-4 rounded-2xl shadow-md transition flex flex-col justify-between hover:scale-[1.02] active:scale-[0.98] group"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl ${action.iconBg} flex items-center justify-center transition group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-300 transition" />
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                    {action.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                    {action.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions Preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Recent Activity
          </h3>
          {transactions.length > 5 && (
            <Link href="/manage/history" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-0.5">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="bg-[#141414] border border-[#222] p-4 rounded-2xl text-xs text-gray-500 animate-pulse">
            Loading recent transactions...
          </div>
        ) : (
          <TransactionList transactions={recentTransactions} />
        )}
      </div>
    </div>
  );
}