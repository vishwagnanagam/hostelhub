import type { Review } from './types';

const POSITIVE_KEYWORDS: Record<string, string[]> = {
  cleanliness: ['clean', 'hygienic', 'hygiene', 'tidy', 'spotless', 'neat'],
  food: ['food', 'meal', 'tasty', 'delicious', 'healthy', 'nutritious'],
  safety: ['safe', 'secure', 'security', 'cctv', 'warden', 'protected'],
  wifi: ['wifi', 'internet', 'fast', 'speed', 'fiber', 'network'],
  location: ['location', 'convenient', 'nearby', 'metro', 'accessible'],
  staff: ['staff', 'helpful', 'friendly', 'supportive', 'caring'],
  value: ['value', 'affordable', 'budget', 'reasonable', 'worth'],
  study: ['study', 'library', 'quiet', 'peaceful', 'focused'],
  modern: ['modern', 'premium', 'amenities', 'well-maintained', 'facilities'],
};

const NEGATIVE_KEYWORDS: Record<string, string[]> = {
  cleanliness: ['dirty', 'unhygienic', 'messy', 'filthy', 'unclean'],
  food: ['bad food', 'tasteless', 'poor food', 'stale'],
  noise: ['noisy', 'loud', 'disturbance', 'noise'],
  maintenance: ['broken', 'not working', 'old', 'damaged', 'poor maintenance'],
};

export function analyzeReviews(reviews: Review[]): {
  summary: string;
  positives: string[];
  negatives: string[];
  hygieneScore: number;
} {
  if (reviews.length === 0) {
    return {
      summary: 'No reviews yet. Be the first to review!',
      positives: [],
      negatives: [],
      hygieneScore: 5,
    };
  }

  const allText = reviews.map((r) => r.comment.toLowerCase()).join(' ');

  const positiveCounts: Record<string, number> = {};
  for (const [category, keywords] of Object.entries(POSITIVE_KEYWORDS)) {
    const count = keywords.reduce((acc, kw) => {
      const matches = (allText.match(new RegExp(kw, 'g')) || []).length;
      return acc + matches;
    }, 0);
    if (count > 0) positiveCounts[category] = count;
  }

  const negativeCounts: Record<string, number> = {};
  for (const [category, keywords] of Object.entries(NEGATIVE_KEYWORDS)) {
    const count = keywords.reduce((acc, kw) => {
      const matches = (allText.match(new RegExp(kw, 'g')) || []).length;
      return acc + matches;
    }, 0);
    if (count > 0) negativeCounts[category] = count;
  }

  const sortedPositives = Object.entries(positiveCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  const sortedNegatives = Object.entries(negativeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([cat]) => cat);

  const hygieneKeywords = POSITIVE_KEYWORDS.cleanliness;
  const negHygieneKeywords = NEGATIVE_KEYWORDS.cleanliness;
  const posHygieneCount = hygieneKeywords.reduce(
    (acc, kw) => acc + (allText.match(new RegExp(kw, 'g')) || []).length,
    0
  );
  const negHygieneCount = negHygieneKeywords.reduce(
    (acc, kw) => acc + (allText.match(new RegExp(kw, 'g')) || []).length,
    0
  );

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const hygieneBase = (avgRating / 5) * 7;
  const hygieneBonus = Math.min(3, posHygieneCount * 0.5 - negHygieneCount * 1);
  const hygieneScore = Math.min(10, Math.max(1, hygieneBase + hygieneBonus));

  let summary = '';
  if (sortedPositives.length > 0) {
    const posLabels = sortedPositives.map(formatCategory);
    summary = `Most users praised ${posLabels.join(', ')}`;
    if (sortedNegatives.length > 0) {
      summary += `. Some mentioned concerns about ${sortedNegatives.map(formatCategory).join(' and ')}`;
    }
    summary += '.';
  } else {
    summary = `Average rating of ${avgRating.toFixed(1)} stars from ${reviews.length} review${reviews.length > 1 ? 's' : ''}.`;
  }

  return { summary, positives: sortedPositives, negatives: sortedNegatives, hygieneScore };
}

function formatCategory(cat: string): string {
  const labels: Record<string, string> = {
    cleanliness: 'cleanliness',
    food: 'food quality',
    safety: 'safety & security',
    wifi: 'WiFi speed',
    location: 'location',
    staff: 'helpful staff',
    value: 'value for money',
    study: 'study environment',
    modern: 'modern amenities',
    noise: 'noise levels',
    maintenance: 'maintenance',
  };
  return labels[cat] || cat;
}
