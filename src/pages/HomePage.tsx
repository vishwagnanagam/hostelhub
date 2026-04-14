import { useEffect, useState } from 'react';
import { MapPin, Star, Wifi, Utensils, Shield, TrendingUp, ChevronRight } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import HostelCard from '../components/HostelCard';
import { supabase } from '../lib/supabase';
import { getRecommendations } from '../lib/recommendations';
import type { Hostel, Page } from '../lib/types';

interface HomePageProps {
  onNavigate: (page: Page, query?: string) => void;
  onViewHostel: (id: string) => void;
}

const CITIES = ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai'];

const CITY_IMAGES: Record<string, string> = {
  Mumbai: 'https://images.pexels.com/photos/2846217/pexels-photo-2846217.jpeg?auto=compress&cs=tinysrgb&w=600',
  Pune: 'https://images.pexels.com/photos/3573351/pexels-photo-3573351.jpeg?auto=compress&cs=tinysrgb&w=600',
  Bangalore: 'https://images.pexels.com/photos/739407/pexels-photo-739407.jpeg?auto=compress&cs=tinysrgb&w=600',
  Delhi: 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=600',
  Hyderabad: 'https://images.pexels.com/photos/3648850/pexels-photo-3648850.jpeg?auto=compress&cs=tinysrgb&w=600',
  Chennai: 'https://images.pexels.com/photos/3573382/pexels-photo-3573382.jpeg?auto=compress&cs=tinysrgb&w=600',
};

export default function HomePage({ onNavigate, onViewHostel }: HomePageProps) {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('hostels')
      .select('*')
      .order('rating', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setHostels((data as Hostel[]) || []);
        setLoading(false);
      });
  }, []);

  const topRecommendations = getRecommendations(hostels, {}, 10000, true, true, true)
    .slice(0, 3)
    .map((r) => r.hostel);

  return (
    <div>
      <HeroSection onNavigate={onNavigate} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Hostels</h2>
            <p className="text-gray-500 text-sm mt-1">Top-rated student accommodations across India</p>
          </div>
          <button
            onClick={() => onNavigate('listing')}
            className="flex items-center gap-1.5 text-rose-500 hover:text-rose-600 text-sm font-semibold transition-colors"
          >
            View all
            <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-52 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostels.map((hostel) => (
              <HostelCard key={hostel.id} hostel={hostel} onClick={() => onViewHostel(hostel.id)} />
            ))}
          </div>
        )}
      </section>

      {topRecommendations.length > 0 && (
        <section className="bg-gradient-to-br from-rose-50 to-orange-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center">
                <Star size={14} className="text-white fill-white" />
              </div>
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">AI Recommendations</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Best Value Picks</h2>
            <p className="text-gray-500 text-sm mb-8">
              Smart suggestions based on budget, facilities, and student ratings
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topRecommendations.map((hostel) => {
                const rec = getRecommendations([hostel], {}, 10000, true, true, true)[0];
                return (
                  <div key={hostel.id} className="relative">
                    <div className="absolute -top-3 left-4 z-10 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <TrendingUp size={10} />
                      {rec?.reasons[0] || 'Recommended'}
                    </div>
                    <HostelCard hostel={hostel} onClick={() => onViewHostel(hostel.id)} />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Explore by City</h2>
        <p className="text-gray-500 text-sm mb-8">Find student hostels in your city</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => onNavigate('listing', city)}
              className="group relative overflow-hidden rounded-2xl aspect-square hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={CITY_IMAGES[city]}
                alt={city}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <div className="flex items-center justify-center gap-1 text-white">
                  <MapPin size={11} />
                  <span className="text-sm font-semibold">{city}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Why Choose HostelHub?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield size={24} className="text-green-500" />,
                bg: 'bg-green-50',
                title: 'Verified & Safe',
                desc: 'Every hostel is personally verified for safety standards and hygiene compliance.',
              },
              {
                icon: <Star size={24} className="text-amber-500" />,
                bg: 'bg-amber-50',
                title: 'Genuine Reviews',
                desc: 'Real reviews from real students. Make informed decisions with honest feedback.',
              },
              {
                icon: <Wifi size={24} className="text-blue-500" />,
                bg: 'bg-blue-50',
                title: 'Modern Amenities',
                desc: 'Find hostels with WiFi, gym, food, laundry, and all modern facilities.',
              },
              {
                icon: <Utensils size={24} className="text-rose-500" />,
                bg: 'bg-rose-50',
                title: 'Meals Included',
                desc: 'Browse hostels with home-cooked or canteen meals for a healthier student life.',
              },
            ].map((feat) => (
              <div key={feat.title} className="text-center">
                <div className={`w-14 h-14 ${feat.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  {feat.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center">
                <MapPin size={14} className="text-white" />
              </div>
              <span className="text-white font-bold">HostelHub</span>
            </div>
            <p className="text-sm">© 2025 HostelHub. Smart Hostel Booking for Students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
