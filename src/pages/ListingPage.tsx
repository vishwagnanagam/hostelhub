import { useEffect, useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, ArrowLeft } from 'lucide-react';
import HostelCard from '../components/HostelCard';
import FilterSidebar from '../components/FilterSidebar';
import { supabase } from '../lib/supabase';
import { getRecommendations } from '../lib/recommendations';
import type { Hostel, SearchFilters, Page } from '../lib/types';

interface ListingPageProps {
  initialQuery?: string;
  onNavigate: (page: Page) => void;
  onViewHostel: (id: string) => void;
}

const defaultFilters: SearchFilters = {
  query: '',
  city: '',
  minPrice: 0,
  maxPrice: 20000,
  type: '',
  gender: '',
  minRating: 0,
  facilities: {},
};

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'recommended', label: 'Recommended' },
];

export default function ListingPage({ initialQuery, onNavigate, onViewHostel }: ListingPageProps) {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({ ...defaultFilters, query: initialQuery || '' });
  const [sortBy, setSortBy] = useState('rating');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    supabase
      .from('hostels')
      .select('*')
      .then(({ data }) => {
        setHostels((data as Hostel[]) || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (initialQuery) {
      setFilters((f) => ({ ...f, query: initialQuery }));
    }
  }, [initialQuery]);

  const cities = useMemo(() => [...new Set(hostels.map((h) => h.city))].sort(), [hostels]);

  const filtered = useMemo(() => {
    return hostels.filter((h) => {
      const q = filters.query.toLowerCase();
      if (q && !h.name.toLowerCase().includes(q) && !h.city.toLowerCase().includes(q) && !h.area.toLowerCase().includes(q) && !h.college_nearby.toLowerCase().includes(q)) {
        return false;
      }
      if (filters.city && h.city !== filters.city) return false;
      if (h.price < filters.minPrice || h.price > filters.maxPrice) return false;
      if (filters.type && h.type !== filters.type) return false;
      if (filters.gender && h.gender !== filters.gender) return false;
      if (h.rating < filters.minRating) return false;
      for (const [key, val] of Object.entries(filters.facilities)) {
        if (val && !(h.facilities as Record<string, boolean>)[key]) return false;
      }
      return true;
    });
  }, [hostels, filters]);

  const sorted = useMemo(() => {
    if (sortBy === 'recommended') {
      return getRecommendations(filtered, filters).map((r) => r.hostel);
    }
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return b.rating - a.rating;
    });
  }, [filtered, sortBy, filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('home')}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            </div>

            <div className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-rose-400 transition-colors">
              <Search size={16} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={filters.query}
                onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
                placeholder="Search by city, area or college..."
                className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
              />
              {filters.query && (
                <button onClick={() => setFilters((f) => ({ ...f, query: '' }))} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-rose-400 bg-gray-50 focus:bg-white"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 font-medium hover:border-rose-300 transition-colors"
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-36">
              <FilterSidebar filters={filters} onChange={setFilters} cities={cities} />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="font-semibold text-gray-900">
                  {loading ? '...' : sorted.length} hostel{sorted.length !== 1 ? 's' : ''}
                </span>
                <span className="text-gray-400 text-sm ml-2">
                  {filters.query ? `for "${filters.query}"` : 'found'}
                </span>
              </div>
              {filters.city && (
                <button
                  onClick={() => setFilters((f) => ({ ...f, city: '' }))}
                  className="flex items-center gap-1 text-xs bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-colors"
                >
                  {filters.city} <X size={10} />
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                    <div className="h-52 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No hostels found</h3>
                <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or search query</p>
                <button
                  onClick={() => setFilters(defaultFilters)}
                  className="bg-rose-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {sorted.map((hostel) => (
                  <HostelCard key={hostel.id} hostel={hostel} onClick={() => onViewHostel(hostel.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setShowMobileFilters(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              onClose={() => setShowMobileFilters(false)}
              cities={cities}
            />
          </div>
        </div>
      )}
    </div>
  );
}
