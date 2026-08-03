'use client';

export default function TransactionFilter({ banks, filters, setFilters }) {
  return (
    <div className="bg-[#141414] p-4 rounded-2xl shadow-lg border border-[#222] space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Search</label>
          <input
            type="text"
            placeholder="Search description..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-[#333] bg-[#1a1a1a] text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Bank Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Filter Bank</label>
          <select
            value={filters.bankId}
            onChange={(e) => setFilters((f) => ({ ...f, bankId: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-[#333] bg-[#1a1a1a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="ALL" className="bg-[#141414] text-white">All Banks</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id} className="bg-[#141414] text-white">{b.name}</option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
          <select
            value={filters.category}
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
      </div>
    </div>
  );
}