'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ArrowDownRight, ArrowUpRight, History, Calculator, CheckSquare, ChevronLeft } from 'lucide-react';

export default function ManageLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/manage', icon: Home, exact: true },
    { label: 'Expense', href: '/manage/expense', icon: ArrowDownRight },
    { label: 'Credit', href: '/manage/credit', icon: ArrowUpRight },
    { label: 'History', href: '/manage/history', icon: History },
    { label: 'Calculator', href: '/manage/calculator', icon: Calculator },
    { label: 'To-Dos', href: '/manage/todos', icon: CheckSquare },
  ];

  const isSubPage = pathname !== '/manage';

  return (
    <div className="min-h-screen bg-[#101010] text-white pb-24 selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#141414]/90 backdrop-blur-md border-b border-[#222]">
        <div className="max-w-xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isSubPage ? (
              <Link
                href="/manage"
                className="w-9 h-9 rounded-xl border border-[#333] bg-[#1a1a1a] flex items-center justify-center text-gray-300 hover:bg-[#222] hover:text-white transition"
                title="Back to Dashboard"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            ) : (
              <div className="w-9 h-9 rounded-xl border border-indigo-500/30 bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-extrabold text-base">
                Rs.
              </div>
            )}
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                Personal Manager
              </h1>
              <p className="text-[11px] text-gray-400 font-medium">Fintech & Tasks Hub</p>
            </div>
          </div>

          <Link
            href="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#333] bg-[#1a1a1a] text-gray-300 hover:bg-[#222] hover:text-white transition"
          >
            Exit Manager
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto px-4 pt-4">
        {children}
      </main>

      {/* Persistent Bottom Navigation (PhonePe/Paytm style) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#141414]/95 backdrop-blur-lg border-t border-[#222] py-2 px-3 shadow-2xl">
        <div className="max-w-xl mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'text-indigo-400 scale-105 font-bold' 
                    : 'text-gray-400 hover:text-gray-200 hover:scale-100 font-medium'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition ${
                  isActive ? 'bg-indigo-600/20 border border-indigo-500/30' : 'bg-transparent'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
