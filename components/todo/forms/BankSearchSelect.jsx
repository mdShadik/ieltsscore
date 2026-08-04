'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, Building2 } from 'lucide-react';
import { bankData } from '@/constant/manage/banks';
import { getInitials } from '@/lib/utils';

// Flatten all banks from all categories into a single list with group labels
const GROUP_LABELS = {
  priority_bank: '⭐ Priority Banks',
  public_bank: '🏛 Public Sector Banks',
  domestic_private_bank: '🏦 Private Banks',
  small_finance_bank: '🌱 Small Finance Banks',
  payments_bank: '📱 Payments Banks',
  regional_rural_bank: '🌾 Regional Rural Banks',
  foreign_bank: '🌍 Foreign Banks',
};

const allBanks = (() => {
  const source = bankData[0];
  const result = [];
  for (const [groupKey, banks] of Object.entries(source)) {
    result.push({ type: 'group', label: GROUP_LABELS[groupKey] || groupKey });
    for (const b of banks) {
      result.push({ type: 'option', name: b.name, group: groupKey });
    }
  }
  return result;
})();

const flatBankNames = allBanks.filter((b) => b.type === 'option').map((b) => b.name);

export default function BankSearchSelect({ value, onChange, required = false }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? allBanks.filter((item) => {
        if (item.type === 'group') return false; // hide group headers when searching
        return item.name.toLowerCase().includes(query.toLowerCase());
      })
    : allBanks;

  const handleSelect = (name) => {
    onChange(name);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleTriggerClick = () => {
    setOpen((o) => !o);
    if (!open) setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleTriggerClick}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-sm transition text-left ${
          open
            ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-[#1a1a1a]'
            : 'border-[#333] bg-[#1a1a1a] hover:border-[#444]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
          <span className={`truncate ${value ? 'text-white' : 'text-gray-500'}`}>
            {value || 'Search and select a bank…'}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              onClick={handleClear}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e)}
              className="w-5 h-5 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#333] transition cursor-pointer"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-[#181818] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-[#222]">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#111] rounded-xl border border-[#2a2a2a] focus-within:border-indigo-500 transition">
              <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to search…"
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="text-gray-500 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <ul className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-[#333]">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-xs text-gray-500 text-center">No banks found</li>
            )}
            {filtered.map((item, idx) => {
              if (item.type === 'group') {
                return (
                  <li
                    key={`group-${idx}`}
                    className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400/70"
                  >
                    {item.label}
                  </li>
                );
              }
              const isSelected = item.name === value;
              return (
                <li
                  key={`${item.group}-${item.name}`}
                  onClick={() => handleSelect(item.name)}
                  className={`flex items-center gap-2.5 px-3 mx-1 py-2 rounded-xl cursor-pointer text-sm transition ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                      : 'text-gray-300 hover:bg-[#222] hover:text-white'
                  }`}
                >
                  <Building2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-gray-600'}`} />
                  {item.name} ({getInitials(item.name)})
                </li>
              );
            })}
          </ul>

          {/* Footer hint */}
          <div className="px-3 py-2 border-t border-[#222] text-[10px] text-gray-600">
            {flatBankNames.length} banks available
          </div>
        </div>
      )}

      {/* Hidden required input for form validation */}
      {required && (
        <input
          tabIndex={-1}
          value={value}
          onChange={() => {}}
          required
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
