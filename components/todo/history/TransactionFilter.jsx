'use client';

import { Calendar, Filter, X } from 'lucide-react';

export default function TransactionFilter({
  banks,
  filters,
  setFilters,
  availableMonths = [],
  timeTab,
  setTimeTab,
}) {
  const tabs = [
    { id: 'ALL', label: 'All Time' },
    { id: 'TODAY', label: 'Today' },
    { id: 'WEEKLY', label: 'This Week' },
    { id: 'MONTHLY', label: 'This Month' },
    { id: 'CUSTOM', label: 'Date Range' },
  ];

  const handleReset = () => {
    setTimeTab('ALL');
    setFilters({
      search: '',
      bankId: 'ALL',
      category: 'ALL',
      month: 'ALL',
      date: '',
      startDate: '',
      endDate: '',
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.bankId !== 'ALL' ||
    filters.category !== 'ALL' ||
    filters.month !== 'ALL' ||
    filters.date ||
    filters.startDate ||
    filters.endDate ||
    timeTab !== 'ALL';

  return (
    <div className="bg-[#141414] p-4 sm:p-5 rounded-2xl shadow-lg border border-[#222] space-y-4">
      {/* Preset Time Period Tabs */}
      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Time Period
        </label>
        <div className="flex flex-wrap gap-1.5 p-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
          {tabs.map((tab) => {
            const isActive = timeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTimeTab(tab.id)}
                className={`flex-1 min-w-[75px] py-1.5 px-3 rounded-lg text-xs font-semibold transition text-center ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-[#222]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Range Inputs (visible when Date Range tab selected) */}
      {timeTab === 'CUSTOM' && (
        <div className="p-3.5 bg-[#1a1a1a]/80 border border-indigo-500/20 rounded-xl space-y-2 animate-in fade-in duration-150">
          <span className="text-[11px] font-semibold text-indigo-300 block">Select Date Range</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg border border-[#333] bg-[#141414] text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition color-scheme-dark"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg border border-[#333] bg-[#141414] text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition color-scheme-dark"
              />
            </div>
          </div>
        </div>
      )}

      {/* Additional Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Search</label>
          <input
            type="text"
            placeholder="Search description..."
            value={filters.search || ''}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-[#333] bg-[#1a1a1a] text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Bank Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Filter Bank</label>
          <select
            value={filters.bankId || 'ALL'}
            onChange={(e) => setFilters((f) => ({ ...f, bankId: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-[#333] bg-[#1a1a1a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="ALL" className="bg-[#141414] text-white">All Banks</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id} className="bg-[#141414] text-white">{b.name}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
          <select
            value={filters.category || 'ALL'}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-[#333] bg-[#1a1a1a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="ALL" className="bg-[#141414] text-white">All Categories</option>
            <option value="Travel Expenses" className="bg-[#141414] text-white">Travel Expenses</option>
            <option value="Grocery and other miscellaneous" className="bg-[#141414] text-white">Grocery & Misc</option>
            <option value="EMI" className="bg-[#141414] text-white">EMI</option>
            <option value="Others" className="bg-[#141414] text-white">Others</option>
          </select>
        </div>

        {/* Clear Filters Action */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className="w-full py-2 px-3 rounded-xl border border-[#333] bg-[#1a1a1a] text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#222] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}