import { MapPin, Star, Wifi, Utensils, Wind, Users, ArrowRight, Shield, Droplets } from 'lucide-react';
import type { Hostel } from '../lib/types';

interface HostelCardProps {
  hostel: Hostel;
  onClick: () => void;
}

export default function HostelCard({ hostel, onClick }: HostelCardProps) {
  const imageUrl = hostel.images?.[0] || 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800';

  const genderColor = {
    boys: 'bg-blue-50 text-blue-700 border-blue-100',
    girls: 'bg-pink-50 text-pink-700 border-pink-100',
    'co-ed': 'bg-green-50 text-green-700 border-green-100',
  }[hostel.gender];

  const genderLabel = { boys: 'Boys', girls: 'Girls', 'co-ed': 'Co-Ed' }[hostel.gender];

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden h-52">
        <img
          src={imageUrl}
          alt={hostel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border bg-white ${genderColor}`}>
            {genderLabel}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-gray-700 border border-gray-200">
            {hostel.type}
          </span>
        </div>

        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-gray-800">{hostel.rating.toFixed(1)}</span>
          </div>
        </div>

        {hostel.available_rooms === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-semibold px-4 py-2 rounded-full text-sm">Fully Booked</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-rose-500 transition-colors line-clamp-1 flex-1 mr-2">
            {hostel.name}
          </h3>
        </div>

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin size={12} className="text-rose-400 flex-shrink-0" />
          <span className="line-clamp-1">{hostel.area}, {hostel.city}</span>
        </div>

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
          {hostel.description}
        </p>

        <div className="flex items-center gap-3 mb-4">
          {hostel.facilities?.wifi && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Wifi size={12} className="text-blue-500" />
              WiFi
            </div>
          )}
          {hostel.facilities?.food && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Utensils size={12} className="text-orange-500" />
              Food
            </div>
          )}
          {hostel.type === 'AC' && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Wind size={12} className="text-cyan-500" />
              AC
            </div>
          )}
          {hostel.facilities?.security && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Shield size={12} className="text-green-500" />
              Security
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Droplets size={12} className="text-blue-400" />
            <span className="text-xs text-gray-500">Hygiene</span>
            <span className="text-xs font-semibold text-gray-700">{hostel.hygiene_score.toFixed(1)}/10</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <div className="flex items-center gap-1">
            <Shield size={12} className="text-green-400" />
            <span className="text-xs text-gray-500">Safety</span>
            <span className="text-xs font-semibold text-gray-700">{hostel.safety_score.toFixed(1)}/10</span>
          </div>
          {hostel.available_rooms > 0 && (
            <>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <div className="flex items-center gap-1">
                <Users size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500">{hostel.available_rooms} rooms left</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-xl font-bold text-gray-900">₹{hostel.price.toLocaleString()}</span>
            <span className="text-sm text-gray-400">/month</span>
          </div>
          <button className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors group-hover:gap-2.5">
            View
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
