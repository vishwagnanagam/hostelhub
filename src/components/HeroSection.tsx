import { Search, MapPin, Star, Shield } from 'lucide-react';
import { useState } from 'react';
import type { Page } from '../lib/types';

interface HeroSectionProps {
  onNavigate: (page: Page, query?: string) => void;
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  const [search, setSearch] = useState('');

  const handleSearch = () => {
    onNavigate('listing', search);
  };

  const popularCities = ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai'];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 pt-16 pb-24">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-rose-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-400 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white text-rose-600 text-sm font-semibold px-4 py-2 rounded-full shadow-sm mb-6 border border-rose-100">
            <Star size={14} className="fill-rose-500 text-rose-500" />
            India's #1 Student Hostel Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Find Your Perfect
            <span className="text-rose-500 block sm:inline"> Student Home</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Discover safe, affordable, and comfortable hostels near your college.
            Book instantly with verified listings across 50+ cities.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-3 flex flex-col sm:flex-row gap-3 border border-gray-100">
            <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-50">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by city, area or college..."
                className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-sm outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
            >
              Search Hostels
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4 justify-center">
            <span className="text-gray-400 text-sm flex items-center gap-1">
              <MapPin size={13} /> Popular:
            </span>
            {popularCities.map((city) => (
              <button
                key={city}
                onClick={() => onNavigate('listing', city)}
                className="text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200 hover:border-rose-300 hover:text-rose-500 transition-colors shadow-sm"
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          {[
            { icon: <MapPin size={20} />, value: '50+', label: 'Cities Covered' },
            { icon: <Star size={20} />, value: '2,000+', label: 'Verified Hostels' },
            { icon: <Shield size={20} />, value: '100%', label: 'Safe & Verified' },
            { icon: <Search size={20} />, value: '10K+', label: 'Happy Students' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-rose-500 mx-auto mb-2">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
