import { SlidersHorizontal, X } from 'lucide-react';
import type { SearchFilters } from '../lib/types';

interface FilterSidebarProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onClose?: () => void;
  cities: string[];
}

export default function FilterSidebar({ filters, onChange, onClose, cities }: FilterSidebarProps) {
  const update = (patch: Partial<SearchFilters>) => onChange({ ...filters, ...patch });

  const facilityToggle = (key: keyof SearchFilters['facilities']) => {
    onChange({
      ...filters,
      facilities: {
        ...filters.facilities,
        [key]: !filters.facilities[key],
      },
    });
  };

  const facilityList = [
    { key: 'wifi' as const, label: 'WiFi' },
    { key: 'food' as const, label: 'Food Included' },
    { key: 'laundry' as const, label: 'Laundry' },
    { key: 'gym' as const, label: 'Gym' },
    { key: 'parking' as const, label: 'Parking' },
    { key: 'security' as const, label: '24/7 Security' },
    { key: 'library' as const, label: 'Library' },
  ];

  const resetFilters = () => {
    onChange({
      query: filters.query,
      city: '',
      minPrice: 0,
      maxPrice: 20000,
      type: '',
      gender: '',
      minRating: 0,
      facilities: {},
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-gray-900">
          <SlidersHorizontal size={18} className="text-rose-500" />
          Filters
        </div>
        <div className="flex items-center gap-2">
          <button onClick={resetFilters} className="text-xs text-rose-500 hover:text-rose-600 font-medium">
            Reset all
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg lg:hidden">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 mb-3 block">City</label>
        <select
          value={filters.city}
          onChange={(e) => update({ city: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-rose-400 bg-gray-50 focus:bg-white transition-colors"
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 mb-3 block">
          Price Range
          <span className="font-normal text-gray-400 ml-2">
            ₹{filters.minPrice.toLocaleString()} – ₹{filters.maxPrice.toLocaleString()}/mo
          </span>
        </label>
        <div className="space-y-3">
          <div>
            <input
              type="range"
              min={0}
              max={20000}
              step={500}
              value={filters.maxPrice}
              onChange={(e) => update({ maxPrice: Number(e.target.value) })}
              className="w-full accent-rose-500"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => update({ minPrice: Number(e.target.value) || 0 })}
              className="w-1/2 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-400"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => update({ maxPrice: Number(e.target.value) || 20000 })}
              className="w-1/2 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-400"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 mb-3 block">Room Type</label>
        <div className="flex gap-2">
          {['', 'AC', 'Non-AC'].map((t) => (
            <button
              key={t}
              onClick={() => update({ type: t })}
              className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${
                filters.type === t
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-rose-300'
              }`}
            >
              {t || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 mb-3 block">Gender</label>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: '', label: 'All' },
            { value: 'boys', label: 'Boys' },
            { value: 'girls', label: 'Girls' },
            { value: 'co-ed', label: 'Co-Ed' },
          ].map((g) => (
            <button
              key={g.value}
              onClick={() => update({ gender: g.value })}
              className={`px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                filters.gender === g.value
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-rose-300'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 mb-3 block">
          Minimum Rating
          <span className="font-normal text-gray-400 ml-2">{filters.minRating > 0 ? `${filters.minRating}+` : 'Any'}</span>
        </label>
        <input
          type="range"
          min={0}
          max={5}
          step={0.5}
          value={filters.minRating}
          onChange={(e) => update({ minRating: Number(e.target.value) })}
          className="w-full accent-rose-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Any</span>
          <span>5 stars</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 mb-3 block">Facilities</label>
        <div className="space-y-2">
          {facilityList.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => facilityToggle(key)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                  filters.facilities[key]
                    ? 'bg-rose-500 border-rose-500'
                    : 'border-gray-300 group-hover:border-rose-300'
                }`}
              >
                {filters.facilities[key] && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L5 8L2 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-600">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
