import { useEffect, useState } from 'react';
import {
  ArrowLeft, MapPin, Star, Wifi, Utensils, Wind, BookOpen, Dumbbell,
  Car, Shield, Droplets, Users, AlertCircle, CalendarDays, Tag
} from 'lucide-react';
import ImageGallery from '../components/ImageGallery';
import ReviewSection from '../components/ReviewSection';
import BookingModal from '../components/BookingModal';
import { supabase } from '../lib/supabase';
import { analyzeReviews } from '../lib/reviewAnalysis';
import type { Hostel, Review, Page } from '../lib/types';

interface DetailPageProps {
  hostelId: string;
  onNavigate: (page: Page) => void;
}

export default function DetailPage({ hostelId, onNavigate }: DetailPageProps) {
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchData = async () => {
    const [hostelRes, reviewsRes] = await Promise.all([
      supabase.from('hostels').select('*').eq('id', hostelId).maybeSingle(),
      supabase.from('reviews').select('*').eq('hostel_id', hostelId).order('created_at', { ascending: false }),
    ]);

    if (!hostelRes.data) {
      setNotFound(true);
    } else {
      setHostel(hostelRes.data as Hostel);
      setReviews((reviewsRes.data as Review[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [hostelId]);

  const refreshReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('hostel_id', hostelId)
      .order('created_at', { ascending: false });
    setReviews((data as Review[]) || []);

    if (data && data.length > 0) {
      const avg = (data as Review[]).reduce((s, r) => s + r.rating, 0) / data.length;
      await supabase.from('hostels').update({ rating: Math.round(avg * 10) / 10 }).eq('id', hostelId);
      setHostel((h) => h ? { ...h, rating: Math.round(avg * 10) / 10 } : h);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-gray-200 rounded-2xl" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !hostel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={40} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Hostel not found</h2>
          <button onClick={() => onNavigate('listing')} className="text-rose-500 text-sm font-medium hover:text-rose-600">
            Back to listings
          </button>
        </div>
      </div>
    );
  }

  const analysis = analyzeReviews(reviews);
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : hostel.rating;

  const facilityItems = [
    { key: 'wifi', label: 'High-Speed WiFi', icon: <Wifi size={18} className="text-blue-500" /> },
    { key: 'food', label: 'Meals Included', icon: <Utensils size={18} className="text-orange-500" /> },
    { key: 'laundry', label: 'Laundry Service', icon: <Wind size={18} className="text-cyan-500" /> },
    { key: 'gym', label: 'Fitness Center', icon: <Dumbbell size={18} className="text-purple-500" /> },
    { key: 'parking', label: 'Parking Available', icon: <Car size={18} className="text-gray-500" /> },
    { key: 'security', label: '24/7 Security', icon: <Shield size={18} className="text-green-500" /> },
    { key: 'library', label: 'Study Library', icon: <BookOpen size={18} className="text-amber-500" /> },
  ] as const;

  const genderColor = {
    boys: 'bg-blue-50 text-blue-700',
    girls: 'bg-pink-50 text-pink-700',
    'co-ed': 'bg-green-50 text-green-700',
  }[hostel.gender];

  const genderLabel = { boys: 'Boys Hostel', girls: 'Girls Hostel', 'co-ed': 'Co-Ed Hostel' }[hostel.gender];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('listing')} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">{hostel.name}</h1>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={11} className="text-rose-400" />
                {hostel.area}, {hostel.city}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ImageGallery images={hostel.images} hostelName={hostel.name} />

        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex flex-wrap items-start gap-3 mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex-1">{hostel.name}</h1>
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${genderColor}`}>
                    {genderLabel}
                  </span>
                  <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                    {hostel.type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-rose-400" />
                  <span className="text-gray-600 text-sm">{hostel.area}, {hostel.city}</span>
                </div>
                {hostel.college_nearby && (
                  <>
                    <span className="text-gray-300">·</span>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Tag size={13} />
                      Near {hostel.college_nearby}
                    </div>
                  </>
                )}
                <span className="text-gray-300">·</span>
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-gray-800 text-sm">{avgRating.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Droplets size={16} className="text-blue-500" />
                  <span className="text-sm font-semibold text-blue-800">Hygiene Score</span>
                </div>
                <div className="text-3xl font-bold text-blue-700">{analysis.hygieneScore.toFixed(1)}</div>
                <div className="text-xs text-blue-500 mt-0.5">out of 10</div>
                <div className="mt-2 bg-blue-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${analysis.hygieneScore * 10}%` }} />
                </div>
              </div>
              <div className="flex-1 bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Shield size={16} className="text-green-500" />
                  <span className="text-sm font-semibold text-green-800">Safety Score</span>
                </div>
                <div className="text-3xl font-bold text-green-700">{hostel.safety_score.toFixed(1)}</div>
                <div className="text-xs text-green-500 mt-0.5">out of 10</div>
                <div className="mt-2 bg-green-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${hostel.safety_score * 10}%` }} />
                </div>
              </div>
              <div className="flex-1 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Users size={16} className="text-amber-500" />
                  <span className="text-sm font-semibold text-amber-800">Rooms Left</span>
                </div>
                <div className="text-3xl font-bold text-amber-700">{hostel.available_rooms}</div>
                <div className="text-xs text-amber-500 mt-0.5">available</div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">About this Hostel</h2>
              <p className="text-gray-600 leading-relaxed">{hostel.description || 'No description provided.'}</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Facilities & Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {facilityItems.map(({ key, label, icon }) => {
                  const available = (hostel.facilities as Record<string, boolean>)[key];
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        available
                          ? 'bg-white border-gray-100 shadow-sm'
                          : 'bg-gray-50 border-gray-100 opacity-40'
                      }`}
                    >
                      {icon}
                      <span className={`text-sm font-medium ${available ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Reviews ({reviews.length})
              </h2>
              <ReviewSection hostelId={hostelId} reviews={reviews} onReviewAdded={refreshReviews} />
            </div>
          </div>

          <div>
            <div className="sticky top-36">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="mb-5">
                  <div className="text-3xl font-bold text-gray-900">
                    ₹{hostel.price.toLocaleString()}
                    <span className="text-base font-normal text-gray-400">/month</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-gray-700 text-sm">{avgRating.toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">· {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-5 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">Room Type</span>
                    <span className="font-semibold text-gray-800">{hostel.type}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">For</span>
                    <span className="font-semibold text-gray-800 capitalize">{hostel.gender}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">City</span>
                    <span className="font-semibold text-gray-800">{hostel.city}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Available Rooms</span>
                    <span className={`font-semibold ${hostel.available_rooms > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {hostel.available_rooms > 0 ? hostel.available_rooms : 'Fully Booked'}
                    </span>
                  </div>
                </div>

                {hostel.available_rooms > 0 ? (
                  <button
                    onClick={() => setShowBooking(true)}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <CalendarDays size={16} />
                    Book Now – ₹{hostel.price.toLocaleString()}/mo
                  </button>
                ) : (
                  <button disabled className="w-full bg-gray-200 text-gray-500 font-bold py-3.5 rounded-xl text-sm cursor-not-allowed">
                    Fully Booked
                  </button>
                )}

                <p className="text-xs text-gray-400 text-center mt-3">
                  Secure payment via Razorpay
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBooking && <BookingModal hostel={hostel} onClose={() => setShowBooking(false)} />}
    </div>
  );
}
