'use client';

export default function TransactionFilter({ banks, filters, setFilters, availableMonths = [] }) {
  return (
    <div className="bg-[#141414] p-4 rounded-2xl shadow-lg border border-[#222] space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

        {/* Month Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Filter Month</label>
          <select
            value={filters.month || 'ALL'}
            onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-[#333] bg-[#1a1a1a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="ALL" className="bg-[#141414] text-white">All Months</option>
            {availableMonths.map((m) => (
              <option key={m.value} value={m.value} className="bg-[#141414] text-white">
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Specific Date Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Specific Date</label>
          <input
            type="date"
            value={filters.date || ''}
            onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-[#333] bg-[#1a1a1a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition color-scheme-dark"
          />
        </div>

        {/* Reset Filters Action */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setFilters({ search: '', bankId: 'ALL', category: 'ALL', month: 'ALL', date: '' })}
            className="w-full py-2 px-3 rounded-xl border border-[#333] bg-[#1a1a1a] text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#222] transition"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}