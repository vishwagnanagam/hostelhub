import { useState } from 'react';
import { Star, MessageSquare, TrendingUp, ThumbsUp, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { analyzeReviews } from '../lib/reviewAnalysis';
import type { Review } from '../lib/types';

interface ReviewSectionProps {
  hostelId: string;
  reviews: Review[];
  onReviewAdded: () => void;
}

export default function ReviewSection({ hostelId, reviews, onReviewAdded }: ReviewSectionProps) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const analysis = analyzeReviews(reviews);
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: reviews.filter((rev) => rev.rating === r).length,
    pct: reviews.length > 0 ? (reviews.filter((rev) => rev.rating === r).length / reviews.length) * 100 : 0,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || rating === 0) {
      setError('Please fill all fields and select a rating.');
      return;
    }
    setLoading(true);
    setError('');

    const { error: dbError } = await supabase.from('reviews').insert({
      hostel_id: hostelId,
      reviewer_name: name.trim(),
      rating,
      comment: comment.trim(),
    });

    if (dbError) {
      setError('Failed to submit review. Please try again.');
    } else {
      setSuccess(true);
      setName('');
      setRating(0);
      setComment('');
      onReviewAdded();
      setTimeout(() => setSuccess(false), 4000);
    }
    setLoading(false);
  };

  return (
    <div>
      {reviews.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-2 mb-3">
            <Sparkles size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-amber-800 mb-1">AI Review Summary</div>
              <p className="text-sm text-amber-700 leading-relaxed">{analysis.summary}</p>
            </div>
          </div>
          {analysis.positives.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {analysis.positives.map((p) => (
                <span key={p} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100">
                  <ThumbsUp size={10} />
                  {formatCatLabel(p)}
                </span>
              ))}
              {analysis.negatives.map((n) => (
                <span key={n} className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full border border-red-100">
                  <AlertCircle size={10} />
                  {formatCatLabel(n)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {reviews.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
            <div className="text-5xl font-bold text-gray-900 mb-1">{avgRating.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  className={s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}
                />
              ))}
            </div>
            <div className="text-sm text-gray-500">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-2">
            {ratingDist.map(({ stars, count, pct }) => (
              <div key={stars} className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 w-3">{stars}</span>
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-gray-400 w-6 text-right text-xs">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4 mb-8">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No reviews yet</p>
            <p className="text-sm">Be the first to share your experience!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{review.reviewer_name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={13} className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'} />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
            </div>
          ))
        )}
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-2 font-bold text-gray-900 mb-5">
          <TrendingUp size={18} className="text-rose-500" />
          Write a Review
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
            Review submitted successfully! Thank you for your feedback.
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-400 bg-white"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    className={
                      s <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 fill-gray-200'
                    }
                  />
                </button>
              ))}
              {(hoverRating || rating) > 0 && (
                <span className="ml-2 text-sm text-gray-500">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoverRating || rating]}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience about cleanliness, food, safety, WiFi..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-400 bg-white resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

function formatCatLabel(cat: string): string {
  const labels: Record<string, string> = {
    cleanliness: 'Cleanliness',
    food: 'Food Quality',
    safety: 'Safety',
    wifi: 'WiFi',
    location: 'Location',
    staff: 'Staff',
    value: 'Value for Money',
    study: 'Study Environment',
    modern: 'Amenities',
    noise: 'Noise',
    maintenance: 'Maintenance',
  };
  return labels[cat] || cat;
}
